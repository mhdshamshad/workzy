import { ChevronDown, X, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface MultiSelectInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  error?: string;
  icon?: LucideIcon;
  maxSelected?: number;
}

export default function MultiSelectInput({
  value,
  onChange,
  options,
  placeholder = 'Search and add…',
  emptyText = 'Nothing selected',
  disabled,
  error,
  icon: Icon,
  maxSelected,
}: MultiSelectInputProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const atLimit = typeof maxSelected === 'number' && value.length >= maxSelected;

  const filtered = options.filter(
    opt => opt.toLowerCase().includes(search.toLowerCase()) && !value.includes(opt)
  );

  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
      return;
    }
    if (atLimit) {
      return;
    }
    onChange([...value, opt]);
    setSearch('');
  };

  const remove = (opt: string) => onChange(value.filter(v => v !== opt));

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full border border-section-blue-border bg-section-blue px-3 py-1 text-xs font-medium text-section-blue-text"
            >
              {Icon && <Icon size={11} className="text-section-blue-text" />}
              {item}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(item)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-section-blue-border/40"
                  aria-label={`Remove ${item}`}
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {!disabled && (
        <div className="relative" ref={containerRef}>
          <div className="relative">
            <input
              type="text"
              value={search}
              placeholder={atLimit ? `Limit of ${maxSelected} reached` : placeholder}
              disabled={atLimit}
              onChange={e => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filtered.length > 0) {
                    toggle(filtered[0]);
                  }
                } else if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
              className={cn(
                'w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none transition-all',
                'focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
                error && 'border-destructive bg-destructive/10'
              )}
            />
            <ChevronDown
              size={14}
              className={cn(
                'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform',
                open && 'rotate-180'
              )}
            />
          </div>

          {open && !atLimit && (
            <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
              {filtered.length > 0 ? (
                filtered.map(opt => (
                  <li
                    key={opt}
                    onMouseDown={e => {
                      e.preventDefault();
                      toggle(opt);
                    }}
                    className="cursor-pointer px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {opt}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm italic text-muted-foreground">
                  {search ? 'No matches found' : 'All options selected'}
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {disabled && value.length === 0 && (
        <p className="text-xs italic text-muted-foreground">{emptyText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
