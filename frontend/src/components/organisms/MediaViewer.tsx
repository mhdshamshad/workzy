import { motion } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  caption?: string;
}

interface MediaViewerProps {
  item: MediaItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  counter?: string;
}

function MediaContent({ item }: { item: MediaItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setPlaying(false);
    setProgress(0);
    setCurrent(0);
    setDuration(0);
    setMuted(false);
  }, [item.url]);

  if (item.type === 'image') {
    return (
      <img
        src={item.url}
        alt={item.caption ?? 'Media'}
        draggable={false}
        className="max-h-[80dvh] w-full object-contain select-none"
      />
    );
  }

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) {
      return;
    }
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) {
      return;
    }
    v.muted = !muted;
    setMuted(m => !m);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !duration) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full cursor-pointer select-none" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={item.url}
        playsInline
        preload="metadata"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (!v || !v.duration) {
            return;
          }
          setCurrent(v.currentTime);
          setProgress((v.currentTime / v.duration) * 100);
        }}
        className="max-h-[80dvh] w-full object-contain bg-black"
      />
      <div
        className={`absolute inset-0 flex items-center justify-center
        pointer-events-none transition-opacity duration-200
        ${playing ? 'opacity-0' : 'opacity-100'}`}
      >
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full
          bg-white/15 backdrop-blur-md border border-white/20
          flex items-center justify-center shadow-xl"
        >
          {playing ? (
            <Pause size={22} className="text-white" fill="white" />
          ) : (
            <Play size={22} className="text-white ml-0.5" fill="white" />
          )}
        </div>
      </div>
      <div
        onClick={e => e.stopPropagation()}
        className="absolute bottom-0 inset-x-0 px-3 pb-3 pt-8
          bg-linear-to-t from-black/80 to-transparent flex flex-col gap-1.5"
      >
        <div
          className="relative w-full h-1 rounded-full bg-white/20 cursor-pointer group/bar"
          onClick={handleSeek}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white
              shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity -translate-x-1/2"
            style={{ left: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-[11px] tabular-nums font-medium">
            {fmt(current)} / {fmt(duration)}
          </span>
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="w-7 h-7 flex items-center justify-center
              rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MediaViewer({
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  counter,
}: MediaViewerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowRight' && hasNext) {
        onNext();
      }
      if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev, hasPrev, hasNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center
        bg-black/95 backdrop-blur-md"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="absolute top-0 inset-x-0 z-10 flex items-center justify-between
          px-4 py-3 sm:px-6 bg-linear-to-b from-black/70 to-transparent"
      >
        <span
          className="flex items-center gap-1.5 text-white/70 text-xs font-medium
          bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm"
        >
          {item.type === 'video' ? (
            <>
              <Video size={11} /> Video
            </>
          ) : (
            <>
              <ImageIcon size={11} /> Photo
            </>
          )}
        </span>

        {counter && (
          <span className="text-white/60 text-xs font-medium tabular-nums">{counter}</span>
        )}

        <button
          onClick={e => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center
            rounded-full bg-white/10 hover:bg-white/20 text-white
            transition-colors backdrop-blur-sm"
        >
          <X size={16} />
        </button>
      </div>
      <motion.div
        key={item.url}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-5xl mx-4 sm:mx-8
          rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-black"
      >
        <MediaContent item={item} />
      </motion.div>
      {hasPrev && (
        <button
          onClick={e => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10
            w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full
            bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {hasNext && (
        <button
          onClick={e => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10
            w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full
            bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight size={20} />
        </button>
      )}
      {item.caption && (
        <div
          onClick={e => e.stopPropagation()}
          className="absolute bottom-0 inset-x-0 z-10 flex justify-center
            px-4 pb-5 pt-10 bg-linear-to-t from-black/70 to-transparent"
        >
          <p className="text-white/80 text-sm text-center max-w-lg">{item.caption}</p>
        </div>
      )}
    </motion.div>
  );
}
