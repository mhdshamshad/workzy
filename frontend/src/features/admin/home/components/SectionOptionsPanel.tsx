import { Filter } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Pagination from '@/components/molecules/Pagination';
import SearchInput from '@/components/molecules/SearchInput';
import { HOME_SECTION_TYPE_LABELS, HomeSectionsFilterOptions } from '@/constants';
import type { AdminHomeSection, ListType } from '@/types/admin/home';

import { useHomeSections } from '../hooks/useHomeSection';

import LayoutSkeleton from './LayoutSkeleton';

interface Props {
  onAdd: (selection: AdminHomeSection) => void;
  layoutIds: Set<string>;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function SectionOptionsPanel({ layoutIds, onAdd }: Props) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<ListType>('all');
  const [pageIndex, setPageIndex] = useState(0);

  const { sectionData, sectionsIsLoading, sectionsError } = useHomeSections({
    pageIndex,
    pageSize: 5,
    search,
    status: 'active',
    type,
  });

  const total = sectionData?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / 5));

  useEffect(() => {
    setPageIndex(prev => clamp(prev, 0, pageCount - 1));
  }, [pageCount]);

  const rows = useMemo(() => sectionData?.sections ?? [], [sectionData]);

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPageIndex(0);
  }, []);

  const handlePageChange = useCallback(
    (next: number) => setPageIndex(clamp(next, 0, pageCount - 1)),
    [pageCount]
  );

  return (
    <div>
      <div className="flex flex-col gap-2">
        <SearchInput placeholder="Search by name" value={search} onChange={handleSearch} />
        <Select
          placeholder="All Types"
          value={type}
          onChange={v => {
            setType(v as ListType);
            setPageIndex(0);
          }}
          leftIcon={<Filter />}
          options={HomeSectionsFilterOptions}
        />
      </div>

      <div className="flex flex-col gap-2 max-h-105 overflow-y-auto my-3">
        {sectionsIsLoading ? (
          <LayoutSkeleton />
        ) : sectionsError ? (
          <div className="py-10 text-center text-sm text-destructive">Failed to load sections</div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No active sections match your filters
          </div>
        ) : (
          rows.map(section => (
            <AvailableSectionRow
              key={section.id}
              section={section}
              isAdded={layoutIds.has(section.id)}
              onAdd={onAdd}
            />
          ))
        )}
      </div>

      <Pagination pageIndex={pageIndex} pageCount={pageCount} onPageChange={handlePageChange} />
    </div>
  );
}

type HomeSectionTypeKey = keyof typeof HOME_SECTION_TYPE_LABELS;

function getSectionTypeLabel(type: unknown) {
  const key = String(type) as HomeSectionTypeKey;
  return HOME_SECTION_TYPE_LABELS[key] ?? String(type);
}

function AvailableSectionRow({
  section,
  onAdd,
  isAdded,
}: {
  section: { id: string; name: string; type: unknown };
  onAdd: (section: AdminHomeSection) => void;
  isAdded: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border bg-background">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{section.name}</p>
        <p className="text-[11px] text-muted-foreground">{getSectionTypeLabel(section.type)}</p>
      </div>

      <Button
        size="sm"
        disabled={isAdded}
        onClick={() => onAdd(section as unknown as AdminHomeSection)}
      >
        {isAdded ? 'Added' : 'Add'}
      </Button>
    </div>
  );
}
