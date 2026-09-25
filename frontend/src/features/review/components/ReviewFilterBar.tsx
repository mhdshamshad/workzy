import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ReviewFilterBarProps = {
  sortBy: 'createdAt' | 'rating';
  sortOrder: 'asc' | 'desc';
  rating: number | null;
  onSortByChange: (value: 'createdAt' | 'rating') => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onClearRating: () => void;
};

export function ReviewFilterBar({
  sortBy,
  sortOrder,
  rating,
  onSortByChange,
  onSortOrderChange,
  onClearRating,
}: ReviewFilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap items-center gap-3"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal size={16} />
        <span>Filters</span>
      </div>
      <Select value={sortBy} onValueChange={v => onSortByChange(v as 'createdAt' | 'rating')}>
        <SelectTrigger className="w-37.5">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Most Recent</SelectItem>
          <SelectItem value="rating">Rating</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortOrder} onValueChange={v => onSortOrderChange(v as 'asc' | 'desc')}>
        <SelectTrigger className="w-35">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">High → Low</SelectItem>
          <SelectItem value="asc">Low → High</SelectItem>
        </SelectContent>
      </Select>
      <AnimatePresence>
        {rating !== null && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClearRating}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
          >
            {rating} star only <span className="ml-1">✕</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
