import { Camera, User } from 'lucide-react';
import React, { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Skeleton } from '../ui/skeleton';

type ImageShape = 'circle' | 'rounded' | 'square';

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

function getInitials(name: string) {
  if (!name) {
    return '?';
  }
  const parts = name.trim().split(' ');
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
}

function getGradient(name: string) {
  const gradients = [
    'from-pink-600 to-orange-500',
    'from-blue-600 to-cyan-500',
    'from-green-600 to-emerald-500',
    'from-purple-600 to-indigo-500',
    'from-amber-600 to-orange-500',
    'from-rose-600 to-pink-500',
    'from-sky-600 to-blue-500',
  ];
  if (!name) {
    return gradients[0];
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
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
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const shapeClass = SHAPE_CLASS[shape];
  const showImage = src && !imgError && imgLoaded && !loading;
  const showFallback = (!src || imgError) && !loading;
  const showSkeleton = src && ((!imgLoaded && !imgError) || loading);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editable || !onChange) {
      return;
    }
    await onChange(file);
  }

  return (
    <div
      className={cn('group relative inline-block cursor-pointer', className)}
      style={{ width: size, height: size }}
    >
      {/* Skeleton while loading */}
      {showSkeleton && (
        <Skeleton
          className={cn('absolute inset-0', shapeClass)}
          style={{ width: size, height: size }}
        />
      )}

      {/* Image */}
      {src && (
        <img
          src={src}
          alt={name || 'Profile'}
          onClick={onClickImage}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          style={{ width: size, height: size, display: showImage ? 'block' : 'none' }}
          className={cn('object-cover border-2 border-white/10', shapeClass)}
        />
      )}

      {/* Fallback initials */}
      {showFallback && (
        <div
          onClick={onClickImage}
          className={cn(
            'flex items-center justify-center bg-linear-to-br text-white font-semibold select-none',
            getGradient(name),
            shapeClass
          )}
          style={{ width: size, height: size, fontSize: size * 0.35 }}
        >
          {name ? (
            <span style={{ fontSize: size * 0.35 }}>{getInitials(name)}</span>
          ) : (
            <User size={size * 0.4} />
          )}
        </div>
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
            onClick={() => fileRef.current?.click()}
            className={cn(
              'absolute bottom-0.5 right-0.5 z-30 rounded-full border border-border bg-background p-1.5 shadow-sm',
              'opacity-0 transition-opacity group-hover:opacity-100'
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
