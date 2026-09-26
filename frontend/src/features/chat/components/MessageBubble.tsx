import dayjs from 'dayjs';
import {
  Ban,
  Check,
  CheckCheck,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Pencil,
  Reply,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import Button from '@/components/atoms/Button';
import { AppModal } from '@/components/molecules/AppModal';
import ProfileImage from '@/components/molecules/ProfileImage';
import { Skeleton } from '@/components/ui/skeleton';
import { ROLE, type Role } from '@/constants';
import { MESSAGE_TYPE } from '@/constants';
import { useSocket } from '@/context/socket/use-socket';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/chat';
import type { ChatMessage } from '@/types/chatMessage';
import { formatChatDate } from '@/utils/time.format';

import MediaLightbox from './MediaLightbox';

interface Props {
  message: ChatMessage;
  currentRole: Role;
  chat: Chat;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onJumpToMessage?: (messageId: string) => void;
}

const STATUS_ICON_MAP = {
  pending: Clock,
  sent: Check,
  delivered: CheckCheck,
  read: CheckCheck,
} as const;

export default function MessageBubble({
  message,
  currentRole,
  chat,
  onReply,
  onEdit,
  onJumpToMessage,
}: Props) {
  const { socket } = useSocket();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [askDelete, setAskDelete] = useState(false);
  const [revealDeleted, setRevealDeleted] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { content, mediaUrl, readByRoles, createdAt, type, role, isDeleted, id, isEdited, status } =
    message;

  const isOwn = role === currentRole;
  const isAdmin = currentRole === ROLE.ADMIN;
  const isSentByAdmin = role === ROLE.ADMIN;

  const sender =
    role === ROLE.USER
      ? chat.participants.user
      : role === ROLE.WORKER
        ? chat.participants.worker
        : null;

  const isPending = status === 'pending';
  const StatusIcon = STATUS_ICON_MAP[status];

  const showDeletedPlaceholder = isDeleted && !(isAdmin && revealDeleted);
  const canModify =
    isOwn &&
    !isPending &&
    !isDeleted &&
    !chat.isBlocked &&
    dayjs().diff(dayjs(createdAt), 'hour') < 2;

  const canDelete = canModify;
  const canEdit = canModify && type === MESSAGE_TYPE.TEXT;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const close = () => setMenuOpen(false);
    const t = setTimeout(() => document.addEventListener('click', close), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', close);
    };
  }, [menuOpen]);

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 5, left: rect.left - 110 });
    setMenuOpen(true);
  };

  const handleConfirmDelete = () => {
    socket?.emit('deleteMessage', { messageId: id, chatId: chat.id });
    setAskDelete(false);
  };

  return (
    <>
      <div className={cn('flex flex-col mb-1 w-full', isOwn ? 'items-end' : 'items-start')}>
        {isSentByAdmin && !isAdmin && (
          <span className="mb-0.5 ml-2 inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide text-blue-500">
            <span className="text-[9px]">✦</span> Admin
          </span>
        )}

        <div className={cn('flex items-end gap-2 w-full', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          {/* Avatar (admin view only) */}
          {!isOwn && isAdmin && sender && (
            <ProfileImage src={sender.profileImage} name={sender.name} size={30} />
          )}

          {/* Bubble */}
          <div className={cn('relative group max-w-[78%]', isOwn ? 'self-end' : 'self-start')}>
            {!isDeleted && (isOwn || isAdmin || onReply) && (
              <button
                onClick={openMenu}
                aria-label="Message options"
                className={cn(
                  'absolute -top-2 z-10 w-6 h-6 rounded-full flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border',
                  isOwn
                    ? '-left-2 bg-primary border-primary/60 text-primary-foreground hover:bg-primary/90'
                    : '-right-2 bg-card border-border text-muted-foreground hover:text-foreground'
                )}
              >
                <ChevronDown size={13} />
              </button>
            )}
            <div
              className={cn(
                'rounded-2xl px-3 py-2 text-sm shadow-sm',
                isOwn
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : isSentByAdmin
                    ? 'bg-blue-500/15 text-card-foreground border border-blue-500/20 rounded-tl-none'
                    : 'bg-card text-card-foreground border border-border rounded-tl-none'
              )}
            >
              {/* Sender name + admin reveal toggle (admin view) */}
              <div className="flex items-center gap-1">
                {isAdmin && !isSentByAdmin && sender && (
                  <p
                    className={cn(
                      'mb-1 text-[11px] font-semibold',
                      role === ROLE.WORKER ? 'text-sky-500' : 'text-emerald-500'
                    )}
                  >
                    {sender.name}
                    <span className="ml-1 opacity-50 font-normal">· {role}</span>
                  </p>
                )}
                {isAdmin && isDeleted && (
                  <Button
                    size="icon"
                    aria-label={revealDeleted ? 'Hide deleted message' : 'Reveal deleted message'}
                    onClick={() => setRevealDeleted(v => !v)}
                    variant={revealDeleted ? 'outline' : 'secondary'}
                    className="ml-1 h-4 w-4 p-0 rounded-full"
                  >
                    {revealDeleted ? <EyeOff size={11} /> : <Eye size={11} />}
                  </Button>
                )}
              </div>

              {message.replyTo?.messageId && !showDeletedPlaceholder && (
                <div
                  onClick={() =>
                    message.replyTo?.messageId && onJumpToMessage?.(message.replyTo.messageId)
                  }
                  className={cn(
                    'border-l-4 p-2 rounded mb-2 text-xs cursor-pointer transition-colors min-w-0 max-w-full overflow-hidden',
                    isOwn
                      ? 'bg-background/20 border-primary-foreground/60 hover:bg-background/30'
                      : 'bg-muted/60 border-primary hover:bg-muted/80'
                  )}
                >
                  <p
                    className={cn(
                      'font-bold text-[10px] mb-0.5',
                      isOwn ? 'text-primary-foreground/80' : 'text-primary'
                    )}
                  >
                    {message.replyTo.role === currentRole ? 'You' : message.replyTo.role}
                  </p>
                  <p className="line-clamp-2 wrap-break-word opacity-80">
                    {message.replyTo.type === MESSAGE_TYPE.IMAGE
                      ? '📷 Photo'
                      : message.replyTo.type === MESSAGE_TYPE.VIDEO
                        ? '🎥 Video'
                        : message.replyTo.type === MESSAGE_TYPE.AUDIO
                          ? '🎵 Audio'
                          : message.replyTo.content}
                  </p>
                </div>
              )}

              {/* Message body */}
              {showDeletedPlaceholder ? (
                <div className="flex items-center gap-1.5 italic opacity-60">
                  <Ban size={13} />
                  <span className="text-xs">
                    {isOwn ? 'You deleted this message' : 'This message was deleted'}
                  </span>
                </div>
              ) : (
                <>
                  {type === MESSAGE_TYPE.TEXT && (
                    <p className="whitespace-pre-wrap leading-relaxed wrap-break-word">{content}</p>
                  )}

                  {type === MESSAGE_TYPE.IMAGE && (
                    <div className="space-y-1">
                      <div className="relative min-w-50 max-w-65 overflow-hidden rounded-xl">
                        {imgLoading && <Skeleton className="h-48 w-full rounded-xl" />}
                        {!imgError ? (
                          <img
                            src={mediaUrl}
                            alt="image"
                            onLoad={() => setImgLoading(false)}
                            onError={() => {
                              setImgLoading(false);
                              setImgError(true);
                            }}
                            className={cn(
                              'w-64 h-48 object-cover rounded-xl cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all duration-300',
                              imgLoading && 'hidden'
                            )}
                            onClick={() => setLightboxOpen(true)}
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center rounded-xl border text-xs text-muted-foreground">
                            Failed to load
                          </div>
                        )}
                      </div>
                      {content && <p className="text-sm mt-1">{content}</p>}
                    </div>
                  )}

                  {type === MESSAGE_TYPE.VIDEO && (
                    <div className="space-y-1">
                      <div
                        className="relative rounded-xl overflow-hidden border border-border bg-card cursor-pointer group/video w-64 h-48 flex items-center justify-center"
                        onClick={() => setLightboxOpen(true)}
                      >
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover opacity-80"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/video:bg-black/35 transition-colors">
                          <div className="bg-black/60 text-white rounded-full p-3 group-hover/video:scale-110 transition-all duration-300 shadow-md">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {content && <p className="text-sm mt-1">{content}</p>}
                    </div>
                  )}

                  {type === MESSAGE_TYPE.AUDIO && (
                    <div className="space-y-1">
                      <audio controls className="w-56 min-w-50 mt-1">
                        <source src={mediaUrl} />
                      </audio>
                      {content && <p className="text-sm mt-1">{content}</p>}
                    </div>
                  )}
                </>
              )}
            </div>

            {!showDeletedPlaceholder && (
              <div
                className={cn(
                  'flex items-center gap-1 mt-0.5 px-1',
                  isOwn ? 'justify-end' : 'justify-start'
                )}
              >
                <span className="text-[10px] text-muted-foreground">
                  {formatChatDate(createdAt, 'time')}
                  {isEdited && !isDeleted && <span className="ml-1 opacity-60">(edited)</span>}
                </span>

                {isOwn &&
                  (status === 'read' && isAdmin ? (
                    <span className="text-[10px] text-muted-foreground opacity-60">
                      Read by: {readByRoles.filter(r => r !== role).join(', ')}
                    </span>
                  ) : (
                    <StatusIcon
                      size={13}
                      className={cn(
                        status === 'sent'
                          ? 'text-muted-foreground/50'
                          : status === 'read'
                            ? 'text-blue-500'
                            : 'text-muted-foreground'
                      )}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-35 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl py-1.5"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={e => e.stopPropagation()}
        >
          {onReply && !isDeleted && (
            <button
              onClick={() => {
                onReply(message);
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-accent flex items-center gap-2 text-sm"
            >
              <Reply size={14} /> Reply
            </button>
          )}
          {canEdit && onEdit && (
            <button
              onClick={() => {
                onEdit(message);
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-accent flex items-center gap-2 text-sm"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => {
                setAskDelete(true);
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-accent flex items-center gap-2 text-sm text-destructive"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          {!onReply && !canEdit && !canDelete && (
            <p className="px-4 py-2 text-xs text-muted-foreground">No actions</p>
          )}
        </div>
      )}

      <AppModal
        open={askDelete}
        onClose={() => setAskDelete(false)}
        confirmText="Delete"
        isTitleHidden
        buttonVariant="red"
        onConfirm={handleConfirmDelete}
        className="md:max-w-lg"
      >
        <div className="text-sm text-muted-foreground">
          This message will be removed for everyone. Admins can still view the original content.
        </div>
      </AppModal>

      {/* Full-screen lightbox */}
      <MediaLightbox
        open={lightboxOpen && !isDeleted}
        onClose={() => setLightboxOpen(false)}
        type={type}
        mediaUrl={mediaUrl}
        caption={content}
      />
    </>
  );
}
