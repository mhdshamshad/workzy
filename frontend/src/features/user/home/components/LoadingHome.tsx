import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingHome() {
  return (
    <main>
      <HeroSkeleton />
      <CategoryShowcaseSkeleton />
      <BannerSkeleton />
      <TopServicesSkeleton />
      <TestimonialsSkeleton />
      <HowItWorksSkeleton />
      <WhyChooseSkeleton />
      <CTASkeleton />
    </main>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative h-125 lg:h-150 overflow-hidden">
      <Skeleton className="absolute inset-0 rounded-none" />

      <div className="absolute inset-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-170 xl:max-w-180 h-full flex flex-col justify-between py-12 lg:py-16">
          <div className="min-h-65 lg:min-h-85">
            <Skeleton className="h-7 w-44 rounded-full mb-4 bg-white/20" />
            <Skeleton className="h-12 sm:h-14 lg:h-16 w-[90%] mb-3 bg-white/20" />
            <Skeleton className="h-12 sm:h-14 lg:h-16 w-[70%] mb-5 bg-white/20" />
            <Skeleton className="h-5 w-[85%] mb-2 bg-white/15" />
            <Skeleton className="h-5 w-[70%] mb-8 bg-white/15" />
            <Skeleton className="h-12 w-48 rounded-xl bg-white/20" />
          </div>

          <div className="grid grid-cols-4 gap-2 lg:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md rounded-lg p-2 lg:p-3 border border-white/20 text-center"
              >
                <Skeleton className="h-6 w-16 mx-auto mb-2 bg-white/20" />
                <Skeleton className="h-3 w-20 mx-auto bg-white/15" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-2 w-2 rounded-full bg-white/25" />
        ))}
      </div>
    </section>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="mb-10">
      <Skeleton className="h-9 w-72 mb-3" />
      <Skeleton className="h-5 w-105 max-w-full" />
    </div>
  );
}

export function CarouselRowSkeleton({ cards = 5 }: { cards?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="basis-full min-[550px]:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 shrink-0"
        >
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-4 w-3/4 mt-4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </div>
      ))}
    </div>
  );
}

export function CategoryShowcaseSkeleton() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeadingSkeleton />
        <CarouselRowSkeleton cards={4} />
      </div>
    </section>
  );
}

function BannerSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-64 md:h-80 rounded-3xl" />
    </section>
  );
}

function TopServicesSkeleton() {
  return (
    <section className="py-16 bg-section-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-9 w-56 rounded-full mb-3" />
            <Skeleton className="h-9 w-80 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <CarouselRowSkeleton cards={5} />
      </div>
    </section>
  );
}

function TestimonialsSkeleton() {
  return (
    <section className="py-16 bg-section-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Skeleton className="h-9 w-56 mx-auto rounded-full mb-4" />
          <Skeleton className="h-10 w-96 mx-auto mb-3 max-w-full" />
          <Skeleton className="h-5 w-72 mx-auto max-w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-lg">
              <Skeleton className="h-5 w-40 mb-5" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[92%] mb-2" />
              <Skeleton className="h-4 w-[80%] mb-6" />
              <div className="flex items-center gap-3 pt-4 border-t border-muted-foreground/20">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSkeleton() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeadingSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 border border-muted-foreground/10">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-5 w-40 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseSkeleton() {
  return (
    <section className="py-16 bg-section-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeadingSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 bg-card shadow">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-5 w-44 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASkeleton() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-52 rounded-3xl" />
      </div>
    </section>
  );
}
