import React from 'react';

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
        'flex flex-col items-center justify-center text-center select-none px-4 fixed inset-0 z-50 min-h-screen',
        className
      )}
    >
      <div className="relative mb-3 flex items-center justify-center">
        <div className="absolute -inset-3 rounded-full bg-linear-to-r from-primary/25 via-purple-600/25 to-pink-600/25 blur-xl animate-pulse pointer-events-none" />
        <span className="relative text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-linear-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm animate-[float_3s_ease-in-out_infinite]">
          Workzy
        </span>
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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

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
