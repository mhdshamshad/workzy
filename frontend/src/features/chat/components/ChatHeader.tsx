import { ArrowLeft, MoreVertical, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import Button from '@/components/atoms/Button';
import ProfileImage from '@/components/molecules/ProfileImage';
import { ROLE, type Role } from '@/constants';
import { useSocket } from '@/context/socket/use-socket';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/chat';
import { formatLastSeen } from '@/utils/time.format';

interface ChatHeaderProps {
  chat: Chat;
  role: Role;
  searchOpen: boolean;
  onSearchToggle: () => void;
  onBlockToggle: () => void;
}

export default function ChatHeader({
  chat,
  role,
  searchOpen,
  onSearchToggle,
  onBlockToggle,
}: ChatHeaderProps) {
  const { onlineUsers, lastSeenMap } = useSocket();

  const isAdmin = role === ROLE.ADMIN;
  const isUser = role === ROLE.USER;

  const profilePart =
    role === ROLE.WORKER ? chat.participants.user : isUser ? chat.participants.worker : null;

  const isOnline = !isAdmin && profilePart ? onlineUsers.has(profilePart.id) : false;
  const lastSeen = profilePart ? (lastSeenMap.get(profilePart.id) ?? profilePart.lastSeen) : null;
  const canToggleBlock = isAdmin || !chat.isBlocked || chat.blockedBy === role;

  const blockLabel =
    isAdmin && chat.isBlocked
      ? 'Unblock'
      : chat.blockedBy === role
        ? 'Unblock'
        : chat.isBlocked
          ? 'Blocked'
          : 'Block';
  const messagesPath = role === ROLE.USER ? '/messages' : `/${role}/messages`;
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 sm:px-6 py-3 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={messagesPath}
          aria-label="Back to messages"
          className="md:hidden inline-flex items-center text-primary/80 transition-colors hover:text-primary rounded-full p-1 hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="shrink-0">
          {!isAdmin && profilePart ? (
            <div className="relative">
              <ProfileImage src={profilePart.profileImage} name={profilePart.name} size={43} />
              {isOnline && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
              )}
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
              {chat.chatId.slice(-4)}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {profilePart ? profilePart.name : chat.chatId}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="opacity-40">·</span>
            {isAdmin ? (
              <span className="truncate">
                <Link
                  to={`/admin/users/${chat.participants.user.id}`}
                  className="py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {chat.participants.user.name}
                </Link>
                {' ↔ '}
                <Link
                  to={`/admin/workers/${chat.participants.worker.id}`}
                  className="py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {chat.participants.worker.name}
                </Link>
              </span>
            ) : isOnline ? (
              <span className="text-emerald-500 font-medium">Online</span>
            ) : lastSeen ? (
              <span className="text-muted-foreground">Last seen {formatLastSeen(lastSeen)}</span>
            ) : (
              <span className="text-muted-foreground">Offline</span>
            )}
          </div>
        </div>
      </div>

      {/* ── right: actions ── */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onSearchToggle}
          aria-label="Search messages"
          aria-pressed={searchOpen}
          className={cn(
            'rounded-full p-2 transition-colors hover:bg-accent',
            searchOpen ? 'bg-accent text-foreground' : 'text-muted-foreground'
          )}
        >
          <Search className="h-4.5 w-4.5" />
        </button>

        <Button
          disabled={!canToggleBlock}
          onClick={onBlockToggle}
          variant="ghost"
          size="sm"
          className={cn(
            chat.isBlocked && (chat.blockedBy === role || isAdmin)
              ? 'text-green-600 hover:bg-green-600/10'
              : 'text-destructive hover:bg-destructive/10',
            'transition-colors text-xs px-2 sm:px-3'
          )}
        >
          <span>{blockLabel}</span>
        </Button>

        <button
          aria-label="More options"
          className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </header>
  );
}
