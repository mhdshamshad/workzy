import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

type StarRatingSize = 'xs' | 'sm' | 'md' | 'lg';

interface StarRatingProps {
  rating: number;
  showValue?: boolean;
  size?: StarRatingSize;
  className?: string;
}

const sizeMap: Record<StarRatingSize, { star: string; text: string }> = {
  xs: { star: 'w-3 h-3', text: 'text-xs' },
  sm: { star: 'w-3.5 h-3.5', text: 'text-sm' },
  md: { star: 'w-4 h-4', text: 'text-sm font-semibold' },
  lg: { star: 'w-5 h-5', text: 'text-base font-bold' },
};

export function StarRating({ rating, showValue = true, size = 'md', className }: StarRatingProps) {
  const { star, text } = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex">
        {[0, 1, 2, 3, 4].map(i => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return (
            <div key={i} className={cn('relative shrink-0', star)}>
              <Star className={cn(star, 'text-muted-foreground/20 absolute inset-0')} />
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn(star, 'fill-amber-400 text-amber-400')} />
              </div>
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={cn('text-foreground tabular-nums', text)}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
