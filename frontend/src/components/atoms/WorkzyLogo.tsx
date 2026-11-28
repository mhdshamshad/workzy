import emblemAsset from '@/assets/icons/workzy-icon-logo.png';
import { cn } from '@/lib/utils';

interface WorkzyLogoProps {
  className?: string;
  textClassName?: string;
  collapsed?: boolean;
}

export function WorkzyLogo({ collapsed = false, className, textClassName }: WorkzyLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img
        src={emblemAsset}
        alt="Workzy"
        className="h-9 w-9 shrink-0 rounded-xl bg-white object-contain p-0.5 shadow-sm ring-1 ring-border"
      />

      {!collapsed && (
        <span
          className={cn(
            'font-display text-xl font-extrabold tracking-tight text-foreground',
            textClassName
          )}
        >
          Work<span className="text-[#F5A623]">zy</span>
        </span>
      )}
    </span>
  );
}
