import React from 'react';

import logoAsset from '@/assets/icons/workzy-logo.png';
import { cn } from '@/lib/utils';

interface AppLoaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const AppLoader: React.FC<AppLoaderProps> = ({
  title = 'Loading...',
  subtitle = 'Please wait a moment.',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-1 w-full min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center select-none px-4 bg-background',
        className
      )}
    >
      <div className="relative mb-3 flex items-center justify-center">
        <img
          src={logoAsset}
          alt="Workzy — Skilled Hands. Right Nearby."
          className="h-24 w-auto rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-border"
        />
      </div>

      <div className="relative w-36 sm:w-44 md:w-52 h-1.5 sm:h-2 rounded-full bg-muted/70 overflow-hidden mb-3">
        <div className="absolute inset-0 bg-linear-to-r from-primary via-purple-600 to-pink-600 rounded-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {title && (
        <p className="text-foreground font-semibold text-base sm:text-lg tracking-tight">{title}</p>
      )}

      {subtitle && <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">{subtitle}</p>}

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
