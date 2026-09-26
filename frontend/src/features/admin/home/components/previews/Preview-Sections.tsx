import { Separator } from '@radix-ui/react-separator';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Star,
  Layers,
  LayoutGrid,
  MapPin,
  Users,
  ListOrdered,
  MessageSquareQuote,
  CalendarDays,
  Wrench,
  Shield,
  Award,
  Clock,
  ArrowRight,
} from 'lucide-react';

import Button from '@/components/atoms/Button';
import ProfileImage from '@/components/molecules/ProfileImage';
import { HOME_SECTION_TYPE, WHY_CHOOSE_ICON } from '@/constants';
import CategoryService from '@/services/category.service';
import type { AdminSection } from '@/types/admin/home';
import type {
  HeroSlide,
  HowItWorksStep,
  TestimonialItem,
  WhyChooseItem,
} from '@/types/home/home.sectionContent';

import {
  PreviewShell,
  Field,
  Stat,
  IdBadge,
  PreviewHeaderRow,
  CardGrid,
  PreviewCard,
  MetaRow,
} from './preview-primitives';

type StepsProps = { section: AdminSection<typeof HOME_SECTION_TYPE.HOW_IT_WORKS> };
type TestimonialProps = { section: AdminSection<typeof HOME_SECTION_TYPE.TESTIMONIALS> };
type TopServiceProps = { section: AdminSection<typeof HOME_SECTION_TYPE.TOP_SERVICES> };
type WhyChooseProps = { section: AdminSection<typeof HOME_SECTION_TYPE.WHY_CHOOSE> };
type NearByProps = { section: AdminSection<typeof HOME_SECTION_TYPE.NEARBY_WORKERS> };
type CategoryProps = { section: AdminSection<typeof HOME_SECTION_TYPE.CATEGORY_SHOWCASE> };
type BannerProps = { section: AdminSection<typeof HOME_SECTION_TYPE.BANNER> };
type HeroProps = { section: AdminSection<typeof HOME_SECTION_TYPE.HERO> };

export function HeroPreview({ section }: HeroProps) {
  return (
    <div className="w-full space-y-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="w-3.5 h-3.5" />
        <span>
          {section.data.slides.length} slide{section.data.slides.length !== 1 ? 's' : ''}
        </span>
        {section.data.autoPlay && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <span>Auto-play every {section.data.interval / 1000}s</span>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.data.slides.map((slide, index) => (
          <HeroSlideCard key={index} slide={slide} />
        ))}
      </div>
    </div>
  );
}

function HeroSlideCard({ slide }: { slide: HeroSlide }) {
  return (
    <article className="group flex flex-col min-h-[160px] overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col gap-2 p-4 h-full">
        <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          {slide.eyebrow}
        </span>
        <h3 className="text-sm font-bold leading-tight text-foreground line-clamp-2">
          {slide.title || <span className="opacity-30 italic">Untitled Slide</span>}
        </h3>
        <p className="text-[11px] text-muted-foreground line-clamp-1">{slide.subTitle}</p>
        <div className="my-1 border-t border-border/50" />
        <p className="text-xs text-foreground leading-relaxed line-clamp-3">{slide.description}</p>
      </div>
    </article>
  );
}

export function BannerPreview({ section }: BannerProps) {
  const {
    data: { title, imageUrl, description, ctaText },
  } = section;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-2xl px-8 md:px-12">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">{title}</h3>
            <p className="md:text-lg text-sm text-white/90 mb-6">{description}</p>
            <Button className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all inline-flex items-center gap-2 shadow-xl">
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoryPreview({ section }: CategoryProps) {
  const { data } = section;
  const { data: category } = useQuery({
    queryKey: ['category', data.categoryId],
    queryFn: () => CategoryService.getCategory(data.categoryId),
    staleTime: 60 * 60 * 1000,
  });

  return (
    <PreviewShell icon={LayoutGrid} label="Category Showcase">
      <PreviewHeaderRow title={data.title} subTitle={data.subTitle} />
      <div className="flex flex-wrap items-center gap-6 px-4 py-4">
        <IdBadge id={category?.name ?? data.categoryId} label="Category" />
        <Stat icon={Layers} label="Limit" value={data.limit} variant="primary" />
      </div>
    </PreviewShell>
  );
}

export function NearByWorkersPreview({ section }: NearByProps) {
  const { data } = section;
  return (
    <PreviewShell icon={MapPin} label="Nearby Workers">
      <PreviewHeaderRow title={data.title} subTitle={data.subTitle} />
      <div className="flex items-center gap-6 px-4 py-4">
        <Stat icon={MapPin} label="Radius" value={data.radiusKm} unit="km" variant="primary" />
        <div className="h-10 w-px bg-border/50" />
        <Stat icon={Users} label="Limit" value={data.limit} unit="workers" variant="muted" />
      </div>
    </PreviewShell>
  );
}

export function StepsPreview({ section }: StepsProps) {
  const { data } = section;
  return (
    <PreviewShell icon={ListOrdered} label="How It Works" badge={`${data.steps.length} steps`}>
      <PreviewHeaderRow title={data.title} subTitle={data.subTitle} />
      <div className="flex flex-col divide-y divide-border/40">
        {data.steps.map(step => (
          <StepRow key={step.step} step={step} />
        ))}
      </div>
    </PreviewShell>
  );
}

function StepRow({ step }: { step: HowItWorksStep }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
        <span className="text-[11px] font-bold text-primary">{step.step}</span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
          {step.title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export function TestimonialPreview({ section }: TestimonialProps) {
  const { data } = section;
  return (
    <PreviewShell
      icon={MessageSquareQuote}
      label="Testimonials"
      badge={`${data.items.length} reviews`}
    >
      <Field label="Section Title">{data.title}</Field>
      <Separator />
      <CardGrid>
        {data.items.map((item, i) => (
          <TestimonialCard key={item.id ?? i} item={item} />
        ))}
      </CardGrid>
    </PreviewShell>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <PreviewCard>
      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3 italic">
        "{item.comment}"
      </p>
      <Separator />
      <div className="flex items-center gap-1.5">
        <ProfileImage src={item.imageUrl} size={30} />
        <span className="text-xs text-muted-foreground truncate">{item.name}</span>
      </div>
      <MetaRow icon={Wrench}>{item.service}</MetaRow>
      <MetaRow icon={CalendarDays}>{item.date}</MetaRow>
      <MetaRow icon={Star}>{item.rating}</MetaRow>
    </PreviewCard>
  );
}

export function TopServicePreview({ section }: TopServiceProps) {
  const { data } = section;
  return (
    <PreviewShell icon={Star} label="Top Services">
      <PreviewHeaderRow title={data.title} subTitle={data.subTitle} />
      <div className="px-4 py-4">
        <Stat icon={Layers} label="Services Shown" value={data.limit} />
      </div>
    </PreviewShell>
  );
}

export function WhyChoosePreview({ section }: WhyChooseProps) {
  const { data } = section;
  return (
    <PreviewShell icon={ShieldCheck} label="Why Choose" badge={`${data.items.length} items`}>
      <PreviewHeaderRow title={data.title} subTitle={data.subTitle} />
      <CardGrid>
        {data.items.map((item, i) => (
          <WhyChooseCard key={i} item={item} />
        ))}
      </CardGrid>
    </PreviewShell>
  );
}

function WhyChooseCard({ item }: { item: WhyChooseItem }) {
  const IconComponent =
    item.icon === WHY_CHOOSE_ICON.Shield
      ? Shield
      : item.icon === WHY_CHOOSE_ICON.Star
        ? Star
        : item.icon === WHY_CHOOSE_ICON.Clock
          ? Clock
          : Award;

  return (
    <PreviewCard>
      <div className="flex items-center gap-2.5">
        <IconComponent className="w-6 h-6 text-foreground " />
        <h4 className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {item.description}
      </p>
      <Separator />
      <MetaRow icon={TrendingUp} className="text-primary">
        <span className="text-xs font-bold text-primary">{item.stat}</span>
      </MetaRow>
    </PreviewCard>
  );
}
