import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';

import ErrorState from '@/components/molecules/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { ROLE, type Role } from '@/constants';
import { cn } from '@/lib/utils';

import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import { useActiveChat } from '../hooks/useActiveChat';

export default function ChatPage({ role = ROLE.ADMIN }: { role?: Role }) {
  const { chatId } = useParams<{ chatId: string }>();
  const { data: chat, isLoading, isError, error, refetch } = useActiveChat(chatId);
  const hasChatSelected = Boolean(chatId);

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
      <div
        className={cn(
          hasChatSelected ? 'hidden md:flex' : 'flex md:flex',
          'w-full md:w-80 lg:w-96 flex-col border-r border-border bg-card h-full shrink-0'
        )}
      >
        <ChatSidebar activeChatId={chatId} role={role} />
      </div>
      <main
        className={cn(
          hasChatSelected ? 'flex md:flex' : 'hidden md:flex',
          'flex-1 flex-col bg-muted/30 h-full'
        )}
      >
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <ErrorState description={error.message} onRetry={refetch} />
        ) : chat ? (
          <ChatWindow chat={chat} role={role} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
            <div className="relative">
              <div className="flex h-22 w-22 items-center justify-center rounded-full border bg-muted/50">
                <MessageCircle className="h-9 w-9 text-muted-foreground/60" />
              </div>
              <div className="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                <ArrowLeft className="h-3 w-3 text-muted-foreground/60" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="text-sm font-medium text-foreground">No chat selected</p>
              <p className="max-w-55 text-xs leading-relaxed">
                Pick a conversation from the sidebar to start messaging
              </p>
            </div>

            <div className="flex w-full max-w-60 flex-col gap-2">
              {[0.55, 0.35].map((opacity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-xl border bg-muted/40 px-3.5 py-2.5"
                  style={{ opacity }}
                >
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-2 w-3/5" />
                    <Skeleton className="h-1.5 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
