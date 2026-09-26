import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface AppCarouselProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  showControls?: boolean;
}

export function AppCarousel<T>({
  items,
  renderItem,
  className,
  title,
  subTitle,
  badge,
  actions,
  showControls = true,
}: AppCarouselProps<T>) {
  const hasHeader = title || subTitle || badge || actions;

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: false,
      }}
      className="w-full relative"
    >
      {(hasHeader || (showControls && items.length > 2)) && (
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            {badge && <div className="mb-2">{badge}</div>}
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
                {title}
              </h2>
            )}
            {subTitle && (
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium mt-1">
                {subTitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {actions}
            {showControls && items.length > 2 && (
              <div className="flex items-center gap-1.5">
                <CarouselPrevious className="static translate-y-0 h-8 w-8 rounded-full border border-border bg-background hover:bg-accent text-foreground shadow-xs" />
                <CarouselNext className="static translate-y-0 h-8 w-8 rounded-full border border-border bg-background hover:bg-accent text-foreground shadow-xs" />
              </div>
            )}
          </div>
        </div>
      )}

      <CarouselContent className="-ml-3 sm:-ml-6 overflow-visible pb-4">
        {items.map((item, index) => (
          <CarouselItem
            key={index}
            className={cn(
              'pl-3 sm:pl-6 basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4',
              className
            )}
          >
            {renderItem(item)}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
