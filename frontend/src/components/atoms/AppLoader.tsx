import React from 'react';

import logoAsset from '@/assets/icons/workzy-logo.png';
import { cn } from '@/lib/utils';

interface AppLoaderProps {
  title?: string;
  subtitle?: string;
  variant?: 'page' | 'inline';
  className?: string;
}

const AppLoader: React.FC<AppLoaderProps> = ({
  title = 'Loading...',
  subtitle = 'Please wait a moment.',
  variant = 'page',
  className,
}) => {
  const isInline = variant === 'inline';

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center text-center select-none px-4',
        isInline ? 'py-8' : 'flex-1 min-h-[calc(100vh-4rem)] bg-background',
        className
      )}
    >
      <div className={cn('relative flex items-center justify-center', isInline ? 'mb-2' : 'mb-3')}>
        <img
          src={logoAsset}
          alt="Workzy — Skilled Hands. Right Nearby."
          width={isInline ? 48 : 96}
          height={isInline ? 48 : 96}
          className={cn(
            'bg-white shadow-sm ring-1 ring-border object-contain',
            isInline ? 'h-12 w-12 rounded-xl p-1' : 'h-24 w-24 rounded-2xl p-1.5'
          )}
        />
      </div>

      <div
        className={cn(
          'relative rounded-full bg-muted/70 overflow-hidden',
          isInline ? 'w-28 h-1.5 mb-2' : 'w-36 sm:w-44 md:w-52 h-1.5 sm:h-2 mb-3'
        )}
      >
        <div className="absolute inset-0 bg-linear-to-r from-primary via-purple-600 to-pink-600 rounded-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {title && (
        <p
          className={cn(
            'text-foreground font-semibold tracking-tight',
            isInline ? 'text-sm' : 'text-base sm:text-lg'
          )}
        >
          {title}
        </p>
      )}

      {subtitle && (
        <p
          className={cn(
            'text-muted-foreground mt-0.5',
            isInline ? 'text-xs' : 'text-xs sm:text-sm'
          )}
        >
          {subtitle}
        </p>
      )}

      <style>
        {`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        `}
      </style>
    </div>
  );
};
export default AppLoader;
