import { Camera, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type ImageShape = 'circle' | 'rounded' | 'square';
type ImageStatus = 'loading' | 'loaded' | 'error';

interface Props {
  src?: string;
  name?: string;
  size?: number;
  shape?: ImageShape;
  editable?: boolean;
  onChange?: (file: File) => Promise<void>;
  onClickImage?: () => void;
  loading?: boolean;
  progress?: number;
  className?: string;
}

const SHAPE_CLASS: Record<ImageShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-2xl',
  square: 'rounded-none',
};

const GRADIENTS = [
  'from-pink-600 to-orange-500',
  'from-blue-600 to-cyan-500',
  'from-green-600 to-emerald-500',
  'from-purple-600 to-indigo-500',
  'from-amber-600 to-orange-500',
  'from-rose-600 to-pink-500',
  'from-sky-600 to-blue-500',
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return '?';
  }
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
}

function getGradient(name: string) {
  if (!name) {
    return GRADIENTS[0];
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export default function ProfileImage({
  src,
  name = '',
  size = 120,
  shape = 'circle',
  editable = false,
  className,
  onChange,
  onClickImage,
  loading = false,
  progress = 0,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [state, setState] = useState<{ src?: string; status: ImageStatus }>({
    status: 'loading',
  });

  const status = state.src === src ? state.status : 'loading';

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) {
      setState({ src, status: img.naturalWidth > 0 ? 'loaded' : 'error' });
    }
  }, [src]);

  const shapeClass = SHAPE_CLASS[shape];
  const showImage = Boolean(src) && status === 'loaded';

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editable || !onChange) {
      return;
    }
    await onChange(file);
  }

  return (
    <div
      className={cn('group relative inline-block', onClickImage && 'cursor-pointer', className)}
      style={{ width: size, height: size }}
    >
      {/* Initials fallback until image is loaded */}
      {!showImage && (
        <div
          onClick={onClickImage}
          className={cn(
            'flex items-center justify-center bg-linear-to-br text-white font-semibold select-none',
            getGradient(name),
            shapeClass
          )}
          style={{ width: size, height: size, fontSize: size * 0.35 }}
        >
          {name ? getInitials(name) : <User size={size * 0.4} />}
        </div>
      )}

      {/* Image fades in once loaded */}
      {src && status !== 'error' && (
        <img
          ref={imgRef}
          src={src}
          alt={name || 'Profile'}
          onClick={onClickImage}
          onLoad={() => setState({ src, status: 'loaded' })}
          onError={() => setState({ src, status: 'error' })}
          loading="lazy"
          decoding="async"
          style={{ width: size, height: size }}
          className={cn(
            'absolute inset-0 object-cover border-2 border-white/10 transition-opacity duration-200',
            showImage ? 'opacity-100' : 'opacity-0 pointer-events-none',
            shapeClass
          )}
        />
      )}

      {/* Upload progress overlay */}
      {loading && (
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 p-2',
            shapeClass
          )}
        >
          <div className="relative flex h-8 w-8 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-white/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-[9px] font-bold text-white">{progress}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Edit button */}
      {editable && !loading && (
        <>
          <button
            type="button"
            aria-label="Change profile picture"
            title="Change profile picture"
            onClick={() => fileRef.current?.click()}
            className={cn(
              'absolute bottom-0.5 right-0.5 z-30 rounded-full border border-border bg-background p-1.5 shadow-sm',
              '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity'
            )}
          >
            <Camera size={14} className="text-foreground" />
          </button>
          <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleFileSelect} />
        </>
      )}
    </div>
  );
}
