import { Loader2, ArrowDown } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';

import { AppModal } from '@/components/molecules/AppModal';
import { MESSAGE_TYPE, ROLE, type MessageType, type Role } from '@/constants';
import { useSocket } from '@/context/socket/use-socket';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/chat';
import type { ChatMessage } from '@/types/chatMessage';

import { useChatMessages } from '../hooks/useChatMessages';
import { useChatSocketEvents } from '../hooks/useChatSocketEvents';
import { useMessageIndex } from '../hooks/useMessageIndex';
import { useMessageNavigation } from '../hooks/useMessageNavigation';
import { buildFlatList, type FlatItem } from '../utils/flatList.utils';

import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import MessageSearchPanel from './MessageSearchPanel';

interface ChatWindowProps {
  chat: Chat;
  role?: Role;
}

function getItemKey(item: FlatItem) {
  return item.type === 'label' ? `label-${item.label}` : item.data.id;
}
const START_INDEX = 100000;

export default function ChatWindow({ chat, role = ROLE.ADMIN }: ChatWindowProps) {
  const { socket } = useSocket();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const isAtBottomRef = useRef(true);

  const [searchOpen, setSearchOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ messageId: string; content: string } | null>(null);
  const [reply, setReply] = useState<{
    messageId: string;
    content?: string;
    type: MessageType;
    role: Role;
  } | null>(null);
  const [optimisticList, setOptimisticList] = useState<ChatMessage[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [incomingCount, setIncomingCount] = useState(0);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);
  const prevFirstItemRef = useRef<{ key: string; index: number } | null>(null);

  useEffect(() => {
    setOptimisticList([]);
    setIncomingCount(0);
    setFirstItemIndex(START_INDEX);
    prevFirstItemRef.current = null;
    setEditing(null);
    setReply(null);
    setSearchOpen(false);
  }, [chat.id]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    jumpToAnchor,
    returnToLatest,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
  } = useChatMessages(chat.id);

  const isLoadingOlderRef = useRef(false);
  const isLoadingNewerRef = useRef(false);

  const handleAtTop = useCallback(
    async (atTop: boolean) => {
      if (!atTop || !hasNextPage || isLoadingOlderRef.current) {
        return;
      }
      isLoadingOlderRef.current = true;
      try {
        await fetchNextPage();
      } finally {
        isLoadingOlderRef.current = false;
      }
    },
    [hasNextPage, fetchNextPage]
  );

  const handleAtBottom = useCallback(
    async (atBottom: boolean) => {
      setIsAtBottom(atBottom);
      isAtBottomRef.current = atBottom;
      if (!atBottom || !hasPreviousPage || isLoadingNewerRef.current) {
        return;
      }
      isLoadingNewerRef.current = true;
      try {
        await fetchPreviousPage();
      } finally {
        isLoadingNewerRef.current = false;
      }
    },
    [hasPreviousPage, fetchPreviousPage]
  );

  const messages = useMemo(() => {
    const queryMsgs =
      data?.pages
        .slice()
        .reverse()
        .flatMap(p => [...p.messages].reverse()) ?? [];

    const activeOptimistic = optimisticList.filter(
      opt => !queryMsgs.some(m => m.id === opt.id || m.tempId === opt.id)
    );

    return [...queryMsgs, ...activeOptimistic];
  }, [data, optimisticList]);

  const flatList = useMemo(() => buildFlatList(messages), [messages]);

  useLayoutEffect(() => {
    if (flatList.length === 0) {
      return;
    }

    const prev = prevFirstItemRef.current;
    if (prev) {
      const newIndex = flatList.findIndex(item => getItemKey(item) === prev.key);
      if (newIndex > 0) {
        setFirstItemIndex(idx => idx - newIndex);
      }
    }
    prevFirstItemRef.current = { key: getItemKey(flatList[0]), index: 0 };
  }, [flatList]);

  useEffect(() => {
    if (optimisticList.length === 0) {
      return;
    }
    const queryMsgIds = new Set(data?.pages.flatMap(p => p.messages.map(m => m.id)) ?? []);
    const queryTempIds = new Set(
      data?.pages.flatMap(p => p.messages.map(m => m.tempId).filter((id): id is string => !!id)) ??
        []
    );

    const remaining = optimisticList.filter(
      opt => !queryMsgIds.has(opt.id) && !queryTempIds.has(opt.id)
    );
    if (remaining.length !== optimisticList.length) {
      setOptimisticList(remaining);
    }
  }, [data, optimisticList]);

  const { messageIndexMap } = useMessageIndex(messages, flatList);

  const { highlightId, jumpingTo, jumpToMessage } = useMessageNavigation({
    messageIndexMap,
    virtuosoRef,
    jumpToAnchor,
  });

  const handleReturnToLatest = useCallback(() => {
    setIncomingCount(0);
    if (hasPreviousPage) {
      returnToLatest();
    } else {
      virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'auto' });
    }
  }, [returnToLatest, hasPreviousPage]);

  const { handleLocalMessage } = useChatSocketEvents({
    chat,
    role,
    virtuosoRef,
    isAtBottomRef,
    replyMessageId: reply?.messageId,
    onReplyCleared: () => setReply(null),
    hasPreviousPage,
    returnToLatest: handleReturnToLatest,
    onIncomingMessage: () => setIncomingCount(c => c + 1),
    onOptimisticMessage: msg => setOptimisticList(prev => [...prev, msg]),
  });

  const handleSetReply = useCallback((msg: ChatMessage) => {
    setReply({ messageId: msg.id, content: msg.content, type: msg.type, role: msg.role });
    setEditing(null);
  }, []);

  const handleSetEdit = useCallback((msg: ChatMessage) => {
    setEditing({ messageId: msg.id, content: msg.content ?? '' });
    setReply(null);
  }, []);

  const handleSubmitEdit = useCallback(
    (messageId: string, content: string) => {
      socket?.emit('editMessage', { messageId, chatId: chat.id, content });
      setEditing(null);
    },
    [socket, chat.id]
  );

  const handleBlockToggleClick = () => {
    if (chat.isBlocked) {
      socket?.emit('toggleChatStatus', { chatId: chat.id });
    } else {
      setIsBlockModalOpen(true);
    }
  };
  const handleConfirmBlock = () => {
    socket?.emit('toggleChatStatus', { chatId: chat.id });
    setIsBlockModalOpen(false);
  };

  return (
    <main className="relative flex flex-1 overflow-hidden h-full bg-muted/30">
      <div className="flex flex-1 flex-col h-full min-w-0">
        <ChatHeader
          chat={chat}
          role={role}
          searchOpen={searchOpen}
          onSearchToggle={() => setSearchOpen(v => !v)}
          onBlockToggle={handleBlockToggleClick}
        />

        <div className="flex-1 min-h-0 overflow-hidden relative">
          <Virtuoso
            key={chat.id}
            ref={virtuosoRef}
            firstItemIndex={firstItemIndex}
            computeItemKey={(_, item) => getItemKey(item)}
            style={{ height: '100%' }}
            data={flatList}
            initialTopMostItemIndex={flatList.length > 0 ? flatList.length - 1 : 0}
            followOutput={isAtBottom => (isAtBottom ? 'smooth' : false)}
            atTopStateChange={handleAtTop}
            atBottomStateChange={handleAtBottom}
            components={{
              Header: () =>
                isFetchingNextPage ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : null,
              Footer: () =>
                isLoading || isFetchingPreviousPage ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <div className="h-4" />
                ),
            }}
            itemContent={(_, item: FlatItem) => {
              if (item.type === 'label') {
                return (
                  <div className="flex justify-center my-3 px-4">
                    <span className="rounded-full bg-card border border-border px-3 py-1 text-xs text-muted-foreground shadow-sm">
                      {item.label}
                    </span>
                  </div>
                );
              }

              const msg = item.data;

              if (msg.type === MESSAGE_TYPE.BOOKING_EVENT) {
                return (
                  <div className="flex justify-center my-2 px-4 mb-2">
                    <div className="bg-primary/10 border border-primary/30 px-5 py-2 rounded-full max-w-[80%] text-center">
                      <p className="text-sm font-medium text-foreground">{msg.content}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  className={cn(
                    'w-full rounded-2xl transition-all duration-300 mb-1 pl-4 pr-4',
                    highlightId === msg.id &&
                      'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  )}
                >
                  <MessageBubble
                    chat={chat}
                    message={msg}
                    currentRole={role}
                    onReply={handleSetReply}
                    onEdit={handleSetEdit}
                    onJumpToMessage={jumpToMessage}
                  />
                </div>
              );
            }}
          />
          {(hasPreviousPage || !isAtBottom || incomingCount > 0) && (
            <button
              onClick={handleReturnToLatest}
              aria-label="Scroll to bottom"
              className="absolute bottom-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-lg backdrop-blur transition-all hover:bg-accent hover:text-foreground active:scale-95"
            >
              <ArrowDown className="h-5 w-5" />
              {incomingCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[9px] font-bold text-primary-foreground shadow animate-pulse-subtle">
                  {incomingCount}
                </span>
              )}
            </button>
          )}
        </div>

        {chat.isBlocked ? (
          <div className="border-t bg-card p-4 shrink-0">
            <div className="rounded-xl bg-muted p-4 text-center">
              <p className="font-medium">Conversation closed</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This booking is no longer active. Messaging has been disabled.
              </p>
            </div>
          </div>
        ) : (
          <MessageInput
            key={chat.id}
            chatId={chat.id}
            role={role}
            replyTo={reply}
            onCancelReply={() => setReply(null)}
            onLocalMessage={handleLocalMessage}
            editingMessageId={editing?.messageId}
            editingContent={editing?.content}
            onCancelEdit={() => setEditing(null)}
            onSubmitEdit={handleSubmitEdit}
          />
        )}

        <AppModal
          open={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          confirmText="Block"
          buttonVariant="red"
          title="Block this conversation?"
          onConfirm={handleConfirmBlock}
        >
          <div className="text-sm text-muted-foreground">
            Blocking will prevent both parties from sending messages.
          </div>
        </AppModal>
      </div>

      {searchOpen && (
        <MessageSearchPanel
          chat={chat}
          role={role}
          onClose={() => setSearchOpen(false)}
          onJump={jumpToMessage}
          jumpingToId={jumpingTo}
        />
      )}
    </main>
  );
}
