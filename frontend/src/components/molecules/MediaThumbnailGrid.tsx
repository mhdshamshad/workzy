import { AnimatePresence } from 'framer-motion';
import { Video } from 'lucide-react';
import { useState } from 'react';

import { MediaViewer, type MediaItem } from '../organisms/MediaViewer';

interface MediaThumbnailGridProps {
  label: string;
  items: MediaItem[];
}

export function MediaThumbnailGrid({ label, items }: MediaThumbnailGridProps) {
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);

  if (!items?.length) {
    return null;
  }

  return (
    <>
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setViewerIdx(i)}
              className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="relative h-full w-full">
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {viewerIdx !== null && (
          <MediaViewer
            item={items[viewerIdx]}
            hasPrev={viewerIdx > 0}
            hasNext={viewerIdx < items.length - 1}
            counter={`${viewerIdx + 1} / ${items.length}`}
            onClose={() => setViewerIdx(null)}
            onPrev={() => setViewerIdx(v => (v !== null && v > 0 ? v - 1 : v))}
            onNext={() => setViewerIdx(v => (v !== null && v < items.length - 1 ? v + 1 : v))}
          />
        )}
      </AnimatePresence>
    </>
  );
}
