import { X } from 'lucide-react';

import Button from '@/components/atoms/Button';

import type { FilterConfig } from '../helper/filterConfig';
import type { Dispatch, SetStateAction } from 'react';

interface Props {
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  filterConfig: FilterConfig;
  radius: number;
  setRadius: (value: number) => void;
  priceRange: [number, number];
  setPriceRange: Dispatch<SetStateAction<[number, number]>>;
  minRating: number;
  setMinRating: Dispatch<SetStateAction<number>>;
  availableNow: boolean;
  setAvailableNow: Dispatch<SetStateAction<boolean>>;
  resetFilters: () => void;
  isServiceSelected: boolean;
}

export default function FilterSidebar({
  showFilters,
  setShowFilters,
  filterConfig,
  radius,
  setRadius,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  availableNow,
  setAvailableNow,
  resetFilters,
  isServiceSelected,
}: Props) {
  return (
    <aside
      className={`
        ${showFilters ? 'fixed inset-0 z-20 bg-black/50 lg:relative lg:bg-transparent' : 'hidden lg:block'}
        lg:w-80 shrink-0
      `}
      onClick={e => {
        if (e.target === e.currentTarget) {
          setShowFilters(false);
        }
      }}
    >
      <div
        className={`
          ${showFilters ? 'absolute right-0 top-0 h-full w-80 bg-background overflow-y-auto' : ''}
          lg:sticky lg:top-20 bg-card border border-border rounded-lg p-6 shadow-sm
        `}
      >
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-6">
          {filterConfig.showRadius && (
            <div>
              <label className="text-sm font-medium mb-2 flex items-center justify-between">
                <span>Radius</span>
                <span className="text-primary">{radius} km</span>
              </label>

              <input
                type="range"
                min={1}
                max={500}
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-accent rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 km</span>
                <span>500 km</span>
              </div>
            </div>
          )}

          {filterConfig.showPriceRange && (
            <div>
              <label className="text-sm font-medium mb-2 flex items-center justify-between">
                <span>Price Range</span>
                <span className="text-primary">
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </span>
              </label>

              <div className="space-y-3">
                <input
                  type="range"
                  min={filterConfig.minPrice}
                  max={filterConfig.maxPrice}
                  step={filterConfig.step}
                  value={priceRange[0]}
                  onChange={e => {
                    const newMin = Number(e.target.value);
                    setPriceRange(([, max]) => [Math.min(newMin, max), max]);
                  }}
                  className="w-full accent-primary h-2 bg-accent rounded-lg cursor-pointer"
                />

                <input
                  type="range"
                  min={filterConfig.minPrice}
                  max={filterConfig.maxPrice}
                  step={filterConfig.step}
                  value={priceRange[1]}
                  onChange={e => {
                    const newMax = Number(e.target.value);
                    setPriceRange(([min]) => [min, Math.max(newMax, min)]);
                  }}
                  className="w-full accent-primary h-2 bg-accent rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {filterConfig.showRating && (
            <div>
              <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 3, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                      minRating === rating
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                        : 'bg-background border-border hover:border-primary hover:bg-accent'
                    }`}
                  >
                    {rating === 0 ? 'Any' : `${rating}+`}
                  </button>
                ))}
              </div>
            </div>
          )}
          {filterConfig.showAvailableNow && (
            <label className="flex items-center gap-3 p-3 bg-accent/30 hover:bg-accent/50 border border-border rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={availableNow}
                onChange={e => setAvailableNow(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">Available Now</div>
                <div className="text-xs text-muted-foreground">
                  Show only available professionals
                </div>
              </div>
            </label>
          )}
          <Button
            onClick={resetFilters}
            disabled={!isServiceSelected}
            variant="secondary"
            fullWidth
          >
            Reset All Filters
          </Button>
        </div>
      </div>
    </aside>
  );
}
