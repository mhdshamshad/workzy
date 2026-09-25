import { GripVertical, LayoutDashboard } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { HOME_SECTION_TYPE_LABELS } from '@/constants';
import { cn } from '@/lib/utils';
import type { SectionListItem } from '@/types/admin/home';

import LayoutSkeleton from './LayoutSkeleton';

interface LayoutPanelProps {
  items: SectionListItem[];
  isEditMode: boolean;
  isLoading: boolean;
  error: Error | null;
  removeSection: (sectionId: string) => void;
  dragHandlers: {
    dragStart: (index: number) => void;
    dragEnter: (index: number) => void;
    dragEnd: () => void;
  };
}

export default function LayoutPanel({
  items,
  isEditMode,
  isLoading,
  error,
  removeSection,
  dragHandlers,
}: LayoutPanelProps) {
  return (
    <div className="flex flex-col gap-2 min-h-60 max-h-125 overflow-y-auto">
      {isLoading && Array.from({ length: 5 }).map((_, i) => <LayoutSkeleton key={i} />)}

      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <LayoutDashboard className="size-10 opacity-30" />
          <p className="text-sm">Failed to load layout data.</p>
        </div>
      )}

      {!isLoading && !error && items.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Layout is empty. Add sections from the left.
        </div>
      ) : (
        items.map((item, i) => (
          <LayoutSectionRow
            key={item.sectionId}
            item={item}
            index={i}
            isEditMode={isEditMode}
            removeSection={removeSection}
            dragHandlers={dragHandlers}
          />
        ))
      )}
    </div>
  );
}

type SectionType = Pick<LayoutPanelProps, 'isEditMode' | 'removeSection' | 'dragHandlers'> & {
  item: SectionListItem;
  index: number;
};

export function LayoutSectionRow({
  item,
  index,
  isEditMode,
  removeSection,
  dragHandlers,
}: SectionType) {
  return (
    <div
      draggable={isEditMode}
      onDragStart={() => dragHandlers.dragStart(index)}
      onDragEnter={() => dragHandlers.dragEnter(index)}
      onDragEnd={dragHandlers.dragEnd}
      onDragOver={e => e.preventDefault()}
      className={cn(
        'flex items-center justify-between gap-2 px-3 py-2 rounded-xl border bg-background',
        isEditMode && 'cursor-grab active:cursor-grabbing'
      )}
    >
      <div className="min-w-0 flex items-center gap-2">
        <GripVertical
          className={cn(
            'size-4 shrink-0 transition-colors',
            isEditMode ? 'text-muted-foreground' : 'text-muted-foreground/30'
          )}
        />
        <span className="size-6 rounded-md bg-muted text-muted-foreground text-[11px] font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        <div>
          <div className="text-sm font-medium truncate">{item.sectionName}</div>
          <div className="text-[11px] text-muted-foreground">
            {HOME_SECTION_TYPE_LABELS[item.sectionType] ?? item.sectionType}
          </div>
        </div>
      </div>

      {isEditMode && (
        <Button variant="outline" size="sm" onClick={() => removeSection(item.sectionId)}>
          Remove
        </Button>
      )}
    </div>
  );
}
