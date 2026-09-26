import { Ban } from 'lucide-react';

import ProfileImage from '@/components/molecules/ProfileImage';
import { MESSAGE_TYPE, ROLE, type Role } from '@/constants';
import { useSocket } from '@/context/socket/use-socket';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/chat';
import { formatChatDate } from '@/utils/time.format';

interface ChatListItemProps {
  chat: Chat;
  role: Role;
  active: boolean;
  onClick: () => void;
}

export default function ChatListItem({ chat, role, active, onClick }: ChatListItemProps) {
  const { onlineUsers } = useSocket();
  const { participants, chatId, lastMessage, unread = 0, isBlocked } = chat;
  const isAdmin = role === ROLE.ADMIN;

  const profilePart =
    role === ROLE.WORKER ? participants.user : role === ROLE.USER ? participants.worker : null;

  const otherUserId = role === ROLE.USER ? participants.worker.id : participants.user.id;
  const isOnline = !isAdmin && onlineUsers.has(otherUserId);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 w-full text-left transition-colors border-b border-border/40',
        'hover:bg-muted/60',
        active && 'bg-accent border-l-2 border-l-primary',
        isBlocked && 'opacity-60'
      )}
    >
      <div className="relative shrink-0">
        {profilePart ? (
          <ProfileImage src={profilePart.profileImage} name={profilePart.name} size={43} />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-bold text-primary uppercase">
            {chatId.slice(-4)}
          </div>
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-medium text-foreground">
              {isAdmin
                ? `${participants.user.name} ↔ ${participants.worker.name}`
                : (profilePart?.name ?? chatId)}
            </span>
            {isBlocked && (
              <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 py-px text-[10px] font-medium text-destructive">
                Blocked
              </span>
            )}
          </div>
          {lastMessage?.createdAt && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatChatDate(lastMessage.createdAt, 'smart')}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 text-xs text-muted-foreground">
            {isAdmin ? (
              <span className="truncate opacity-60">{chatId}</span>
            ) : lastMessage ? (
              lastMessage.isDeleted ? (
                <span className="flex items-center gap-1 italic opacity-60">
                  <Ban className="h-3 w-3 shrink-0" />
                  {lastMessage.role === role ? 'You deleted this message' : 'Message deleted'}
                </span>
              ) : (
                <span className="block truncate font-semibold">
                  <span className="font-medium text-foreground/70 mr-1">
                    {lastMessage.role === role ? 'You:' : ''}
                  </span>
                  {lastMessage.type === MESSAGE_TYPE.VIDEO
                    ? '🎥 Video'
                    : lastMessage.type === MESSAGE_TYPE.IMAGE
                      ? '📷 Photo'
                      : lastMessage.type === MESSAGE_TYPE.AUDIO
                        ? '🎵 Audio'
                        : lastMessage.content}
                </span>
              )
            ) : (
              <span className="italic opacity-40">No messages yet</span>
            )}
          </div>
          {!active && !isAdmin && unread > 0 && (
            <span className="ml-1 inline-flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
