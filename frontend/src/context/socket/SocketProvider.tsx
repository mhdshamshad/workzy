import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { io } from 'socket.io-client';

import { HOST, MODE, type Role } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import type { Chat, LastMessage } from '@/types/chat';
import type { ChatMessage } from '@/types/chatMessage';

import { SocketContext } from './socket-context';

const baseUrl = MODE === 'development' ? `${HOST}` : '';

interface SocketProviderProps {
  children: ReactNode;
}

type ChatsPage = InfiniteData<{ chats: Chat[]; nextCursor: string | null }>;

function upsertChatToTop(old: ChatsPage, updated: Chat): ChatsPage {
  const pages = old.pages.map(page => ({
    ...page,
    chats: page.chats.filter(chat => chat.id !== updated.id),
  }));

  pages[0] = {
    ...pages[0],
    chats: [updated, ...pages[0].chats],
  };

  return {
    ...old,
    pages,
  };
}

function findChat(old: ChatsPage | undefined, chatId: string): Chat | undefined {
  if (!old) {
    return undefined;
  }
  for (const page of old.pages) {
    const found = page.chats.find(c => c.id === chatId);
    if (found) {
      return found;
    }
  }
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { user, isAuthenticated, accessToken } = useAppSelector((s: RootState) => s.auth);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeenMap, setLastSeenMap] = useState<Map<string, string | null>>(new Map());
  const queryClient = useQueryClient();

  const activeChatIdRef = useRef<string | null>(null);

  const socket = useMemo(() => {
    if (!isAuthenticated || !user?.id) {
      return null;
    }

    return io(baseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: accessToken,
      },
      query: {
        userId: user.id,
        role: user.role,
        ...(user.worker?.id ? { workerId: user.worker.id } : {}),
      },
    });
  }, [isAuthenticated, user?.id, user?.role, user?.worker?.id, accessToken]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('disconnect', reason => console.log('Socket disconnected:', reason));
    socket.on('error', error => console.error('Socket error:', error));

    socket.on('onlineUsers', (users: string[]) => setOnlineUsers(new Set(users)));
    socket.on('userOnline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
      setLastSeenMap(prev => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on(
      'userOffline',
      ({ userId, lastSeen }: { userId: string; lastSeen: string | null }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        setLastSeenMap(prev => new Map(prev).set(userId, lastSeen));
      }
    );

    const handleGlobalNewMessage = (msg: ChatMessage) => {
      if (msg.chatId === activeChatIdRef.current) {
        return;
      }

      const isMine = msg.role === user?.role;
      let found = false;

      queryClient.setQueriesData<ChatsPage>({ queryKey: ['chats'], exact: false }, old => {
        if (!old) {
          return old;
        }
        const target = findChat(old, msg.chatId);
        if (!target) {
          return old;
        }
        found = true;
        return upsertChatToTop(old, {
          ...target,
          lastMessage: {
            messageId: msg.id,
            type: msg.type,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
            isDeleted: msg.isDeleted,
          },
          unread: isMine ? (target.unread ?? 0) : (target.unread ?? 0) + 1,
        });
      });

      if (!found) {
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      }

      queryClient.invalidateQueries({ queryKey: ['chat-messages', msg.chatId] });
    };

    const handleChatUpdated = (payload: {
      chatId: string;
      lastMessage?: LastMessage;
      isBlocked?: boolean;
      blockedBy?: Role | null;
    }) => {
      if (payload.chatId === activeChatIdRef.current) {
        return;
      }

      let notFound = false;

      queryClient.setQueriesData<ChatsPage>({ queryKey: ['chats'], exact: false }, old => {
        if (!old) {
          notFound = true;
          return old;
        }
        const target = findChat(old, payload.chatId);
        if (!target) {
          notFound = true;
          return old;
        }

        const isMine = payload.lastMessage?.role === user?.role;
        const isEditOrDelete = !!(
          payload.lastMessage &&
          target.lastMessage &&
          payload.lastMessage.messageId === target.lastMessage.messageId
        );

        return upsertChatToTop(old, {
          ...target,
          ...(payload.lastMessage && { lastMessage: payload.lastMessage }),
          ...(payload.isBlocked !== undefined && { isBlocked: payload.isBlocked }),
          ...(payload.blockedBy !== undefined && { blockedBy: payload.blockedBy ?? undefined }),
          unread: payload.lastMessage
            ? isMine || isEditOrDelete
              ? (target.unread ?? 0)
              : (target.unread ?? 0) + 1
            : (target.unread ?? 0),
        });
      });

      if (notFound) {
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      }

      queryClient.invalidateQueries({ queryKey: ['chat-messages', payload.chatId] });
    };

    const handleGlobalMessageDeleted = ({
      messageId,
      chatId,
    }: {
      messageId: string;
      chatId: string;
    }) => {
      queryClient.setQueriesData<ChatsPage>({ queryKey: ['chats'], exact: false }, old => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            chats: page.chats.map(c =>
              c.id === chatId && c.lastMessage?.messageId === messageId
                ? { ...c, lastMessage: { ...c.lastMessage, isDeleted: true } }
                : c
            ),
          })),
        };
      });

      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
    };

    const handleGlobalMessageEdited = ({
      messageId,
      chatId,
      content,
    }: {
      messageId: string;
      chatId: string;
      content: string;
    }) => {
      queryClient.setQueriesData<ChatsPage>({ queryKey: ['chats'], exact: false }, old => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            chats: page.chats.map(c =>
              c.id === chatId && c.lastMessage?.messageId === messageId
                ? { ...c, lastMessage: { ...c.lastMessage, content } }
                : c
            ),
          })),
        };
      });

      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
    };

    socket.on('newMessage', handleGlobalNewMessage);
    socket.on('chatUpdated', handleChatUpdated);
    socket.on('messageDeleted', handleGlobalMessageDeleted);
    socket.on('messageEdited', handleGlobalMessageEdited);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
      socket.off('onlineUsers');
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off('newMessage', handleGlobalNewMessage);
      socket.off('chatUpdated', handleChatUpdated);
      socket.off('messageDeleted', handleGlobalMessageDeleted);
      socket.off('messageEdited', handleGlobalMessageEdited);
      socket.disconnect();
    };
  }, [socket, queryClient, user?.role]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, lastSeenMap, activeChatIdRef }}>
      {children}
    </SocketContext.Provider>
  );
};
