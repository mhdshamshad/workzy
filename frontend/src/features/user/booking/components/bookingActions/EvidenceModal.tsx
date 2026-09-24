import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Video, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { MediaViewer, type MediaItem } from '@/components/organisms/MediaViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingDetails } from '@/hooks/useBookingDetails';

interface EvidenceModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string | null;
}
export default function EvidenceModal({ open, onClose, bookingId }: EvidenceModalProps) {
  const [tab, setTab] = useState<'before' | 'after'>('before');
  const [lbIdx, setLbIdx] = useState<number | null>(null);

  const { booking, isLoading, error } = useBookingDetails(bookingId);
  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }
  if (error || !booking) {
    return null;
  }
  const evidence = booking?.evidence;
  const items: MediaItem[] = (evidence?.[tab] ?? []).map(i => ({
    url: i.url,
    type: i.type,
  }));

  const closeLb = () => setLbIdx(null);
  const goPrev = () => setLbIdx(i => (i !== null && i > 0 ? i - 1 : i));
  const goNext = () => setLbIdx(i => (i !== null && i < items.length - 1 ? i + 1 : i));
  const handleTabChange = (t: 'before' | 'after') => {
    setTab(t);
    setLbIdx(null);
  };
  const handleClose = () => {
    onClose();
    setTab('before');
    setLbIdx(null);
  };

  return (
    <>
      <EvidenceModalShell open={open} onClose={handleClose}>
        <div
          className="flex items-center justify-between px-6 pt-5 pb-4
          border-b border-border shrink-0"
        >
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Before & After Evidence
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
              hover:bg-muted transition-colors text-foreground"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {evidence ? (
            <div className="flex flex-col gap-4">
              <div className="flex rounded-xl bg-muted p-1 gap-1">
                {(['before', 'after'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => handleTabChange(t)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all
                        ${
                          tab === t
                            ? 'bg-background shadow text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                  >
                    {t === 'before' ? <ImageIcon size={14} /> : <CheckCircle size={14} />}
                    {t === 'before' ? 'Before' : 'After'}
                    <span className="text-[11px] text-muted-foreground font-normal">
                      ({(evidence[t] ?? []).length})
                    </span>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: tab === 'after' ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`grid gap-3 ${items.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
                >
                  {items.map((item, i) => (
                    <Thumbnail key={i} item={item} index={i} tab={tab} onOpen={() => setLbIdx(i)} />
                  ))}
                  {items.length === 0 && (
                    <div
                      className="col-span-2 aspect-video rounded-xl border-2
                      border-dashed border-border flex flex-col items-center
                      justify-center gap-1"
                    >
                      <span className="text-muted-foreground text-sm">No evidence uploaded</span>
                      <span className="text-muted-foreground/60 text-xs">
                        Worker hasn't added {tab} media yet
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {items.length > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Tap any item to view full screen
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No evidence available</p>
          )}
        </div>
      </EvidenceModalShell>
      {createPortal(
        <AnimatePresence>
          {lbIdx !== null && items[lbIdx] && (
            <MediaViewer
              item={items[lbIdx]}
              onClose={closeLb}
              onPrev={goPrev}
              onNext={goNext}
              hasPrev={lbIdx > 0}
              hasNext={lbIdx < items.length - 1}
              counter={items.length > 1 ? `${lbIdx + 1} / ${items.length}` : undefined}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

function EvidenceModalShell({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-500 flex items-center justify-center
            bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-background text-foreground
              rounded-2xl shadow-2xl flex flex-col max-h-[90dvh]
              overflow-hidden border border-border"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Thumbnail({
  item,
  index,
  tab,
  onOpen,
}: {
  item: MediaItem;
  index: number;
  tab: string;
  onOpen: () => void;
}) {
  if (item.type === 'video') {
    return (
      <div
        onClick={onOpen}
        className="relative group aspect-video rounded-xl overflow-hidden
          bg-slate-900 cursor-pointer"
      >
        <video
          src={item.url}
          preload="metadata"
          playsInline
          className="w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-10 h-10 rounded-full bg-white/90 flex items-center
            justify-center shadow-lg group-hover:scale-110 transition-transform"
          >
            <Play size={16} className="text-slate-800 ml-0.5" fill="currentColor" />
          </div>
        </div>
        <span
          className="absolute top-2 left-2 flex items-center gap-1 bg-black/60
          text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
        >
          <Video size={10} /> Video
        </span>
      </div>
    );
  }
  return (
    <div
      onClick={onOpen}
      className="relative group aspect-video rounded-xl overflow-hidden
        bg-muted cursor-pointer"
    >
      <img
        src={item.url}
        alt={`${tab} ${index + 1}`}
        className="w-full h-full object-cover group-hover:scale-105
          transition-transform duration-300"
      />
      <div
        className="absolute inset-0 bg-black/0 group-hover:bg-black/20
        transition-colors rounded-xl"
      />
    </div>
  );
}
