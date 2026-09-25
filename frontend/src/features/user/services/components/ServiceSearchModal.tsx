import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Search, SearchX, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import EmptyState from '@/components/molecules/EmptyState';
import SearchInput from '@/components/molecules/SearchInput';
import type { CategorySuggestion } from '@/types/category';

import SearchSuggestionSkeleton from './SearchSuggestionSkeleton';
import TrendingSkeleton from './TrendingSkeleton';

interface ServiceSearchModalProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  searchQuery: string;
  internalSearchQuery: string;
  setInternalSearchQuery: (v: string) => void;
  categoryServices: CategorySuggestion[];
  trending: CategorySuggestion[];
  isSearching: boolean;
  isTrendingLoading: boolean;
  onSelectService: (service: CategorySuggestion) => void;
}

function ServiceItem({
  service,
  onSelect,
}: {
  service: CategorySuggestion;
  onSelect: (s: CategorySuggestion) => void;
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'var(--accent)' }}
      onClick={() => onSelect(service)}
      className="w-full flex items-center gap-3 p-3.5 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
        <img
          src={service.iconUrl}
          alt={service.name}
          className="w-full h-full object-cover"
          onError={e => {
            (e.target as HTMLImageElement).src =
              `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random`;
          }}
        />
      </div>
      <p className="font-medium text-sm text-foreground">{service.name}</p>
    </motion.button>
  );
}

function TrendingItem({
  service,
  onSelect,
}: {
  service: CategorySuggestion;
  onSelect: (s: CategorySuggestion) => void;
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'var(--accent)' }}
      onClick={() => onSelect(service)}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-left"
    >
      <TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-sm text-foreground">{service.name}</span>
    </motion.button>
  );
}

function TrendingSection({
  trending,
  isTrendingLoading,
  onSelect,
  showDivider = false,
}: {
  trending: CategorySuggestion[];
  isTrendingLoading: boolean;
  onSelect: (s: CategorySuggestion) => void;
  showDivider?: boolean;
}) {
  return (
    <div className={showDivider ? 'border-t border-border pt-4 mt-2' : ''}>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
        Trending Searches
      </p>
      {isTrendingLoading ? (
        <TrendingSkeleton />
      ) : (
        <div className="space-y-0.5">
          {trending.slice(0, 5).map(service => (
            <TrendingItem key={service.id} service={service} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.14, ease: 'easeIn' as const } },
};

export default function ServiceSearchModal({
  open,
  onClose,
  isMobile,
  searchQuery,
  internalSearchQuery,
  setInternalSearchQuery,
  categoryServices,
  trending,
  isSearching,
  isTrendingLoading,
  onSelectService,
}: ServiceSearchModalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile || !open) {
      return;
    }
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isMobile, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const hasResults = categoryServices.length > 0;
  const isSearchMode = searchQuery.trim().length > 0;

  const ResultsContent = (
    <AnimatePresence mode="wait">
      {isSearchMode ? (
        <motion.div
          key="search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {isSearching ? (
            <SearchSuggestionSkeleton />
          ) : hasResults ? (
            <div className="divide-y divide-border">
              {categoryServices.map(service => (
                <ServiceItem key={service.id} service={service} onSelect={onSelectService} />
              ))}
            </div>
          ) : (
            <div className="px-4 py-2">
              <EmptyState
                icon={<SearchX className="w-5 h-5" />}
                title="No services found"
                description={`No results for "${searchQuery}". Try different keywords.`}
                className="py-6 border-none shadow-none bg-transparent"
              />
              <TrendingSection
                trending={trending}
                isTrendingLoading={isTrendingLoading}
                onSelect={onSelectService}
                showDivider
              />
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="trending"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="p-4"
        >
          <TrendingSection
            trending={trending}
            isTrendingLoading={isTrendingLoading}
            onSelect={onSelectService}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Mobile ──
  if (isMobile) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="fixed top-18 left-0 right-0 z-50 flex justify-center px-4">
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Mobile search bar */}
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <SearchInput
                  value={internalSearchQuery}
                  variant="inline"
                  onChange={setInternalSearchQuery}
                  autoFocus
                  placeholder="Search for services"
                  className="w-full pl-9 pr-3 py-2 bg-accent border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>
            </div>
            <div className="max-h-[calc(100vh-180px)] overflow-y-auto">{ResultsContent}</div>
          </motion.div>
        </div>
      </>
    );
  }

  // ── Desktop ──
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-18 left-0 right-0 z-50 flex justify-center px-4">
        <motion.div
          ref={dropdownRef}
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
        >
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto">{ResultsContent}</div>
        </motion.div>
      </div>
    </>
  );
}
