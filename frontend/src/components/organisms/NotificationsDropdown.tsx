import dayjs from 'dayjs';
import * as LucideIcons from 'lucide-react';
import { Bell, CheckCheck, Loader2, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ROLE, type Role } from '@/constants';
import { getNotificationConfig } from '@/constants/notificationConfig';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import {
  useNotificationActions,
  useNotifications,
  useNotificationCount,
} from '@/hooks/useNotifications';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

import type { ComponentType } from 'react';

type LucideIconComponent = ComponentType<React.SVGProps<SVGSVGElement>>;
const lucideIconMap = LucideIcons as unknown as Record<string, LucideIconComponent | undefined>;

export function NotificationsDropdown({ role = ROLE.USER }: { role?: Role }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'unread' | 'all'>('unread');
  useNotificationCount(role);

  const { notifications, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotifications(role, filter === 'unread' ? 'false' : undefined);
  const { markAsRead, markAllAsRead } = useNotificationActions(role);

  const unreadCount = useAppSelector((s: RootState) => s.notification.unreadCount);
  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  const renderMessage = (text: string) => {
    if (!text) {
      return null;
    }
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const renderIcon = (type: string) => {
    const { icon, color } = getNotificationConfig(type);
    const IconCmp: LucideIconComponent = lucideIconMap[icon] ?? Bell;
    return (
      <div
        className="flex items-center justify-center h-10 w-10 rounded-full shrink-0 shadow-sm border border-black/5 dark:border-white/5"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <IconCmp className="h-5 w-5" />
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2.5 hover:bg-accent rounded-full transition-all duration-300 hover:scale-105"
          aria-label="Notifications"
        >
          <Bell className="h-[22px] w-[22px] text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute top-1 right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 hover:bg-red-600 shadow-md border-2 border-background animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[420px] p-0 shadow-2xl rounded-2xl border-muted/50"
        sideOffset={8}
      >
        <div className="flex flex-col bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="px-5 py-2 flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Notifications</h3>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {unreadCount > 0
                  ? `You have ${unreadCount > 9 ? '9+' : unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
                  : 'You are all caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void markAllAsRead()}
                  title="Mark all as read"
                  aria-label="Mark all as read"
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="h-8 w-8 text-muted-foreground hover:bg-accent rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50 bg-muted/20">
            <Button
              variant={filter === 'unread' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setFilter('unread')}
              className={`rounded-full h-8 px-4 text-xs font-medium transition-all ${
                filter === 'unread' ? 'shadow-sm' : 'bg-transparent hover:bg-accent'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className={`ml-1.5 px-1.5 min-w-[20px] h-[20px] flex items-center justify-center ${
                    filter === 'unread'
                      ? 'bg-background/25 text-white hover:bg-background/25'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setFilter('all')}
              className={`rounded-full h-8 px-4 text-xs font-medium transition-all ${
                filter === 'all' ? 'shadow-sm' : 'bg-transparent hover:bg-accent'
              }`}
            >
              All
            </Button>
          </div>
          {isLoading && notifications.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h4 className="text-base font-medium mb-1">No notifications</h4>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread'
                  ? "You've read everything!"
                  : "When you get notifications, they'll show up here."}
              </p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`group relative flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 cursor-default ${
                    !n.read
                      ? 'bg-primary/[0.04] hover:bg-primary/[0.08] shadow-sm'
                      : 'bg-transparent hover:bg-accent/50'
                  }`}
                >
                  {!n.read && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                  )}

                  {renderIcon(n.type)}

                  <div className="flex-1 space-y-1 min-w-0 pr-6">
                    <div className="flex justify-between items-start gap-2">
                      <h4
                        className={`text-[13px] leading-tight ${
                          !n.read
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground'
                        }`}
                      >
                        {n.heading}
                      </h4>
                      <span className="text-[10px] text-muted-foreground/80 whitespace-nowrap font-medium tracking-wide">
                        {dayjs(n.createdAt).format('MMM D, h:mm A')}
                      </span>
                    </div>
                    <p
                      className={`text-[13px] leading-[1.5] ${
                        !n.read ? 'text-muted-foreground' : 'text-muted-foreground/70'
                      }`}
                    >
                      {renderMessage(n.message)}
                    </p>
                  </div>

                  {!n.read && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        void markAsRead(n.id);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border shadow-sm p-1.5 rounded-full text-muted-foreground hover:text-primary hover:border-primary/30"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <div ref={sentinelRef} className="h-4" />
              {isFetchingNextPage && (
                <div className="p-4 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
