import { CheckCircle, Clock, Plus, X } from 'lucide-react';

import Button from '@/components/atoms/Button';

export type Slot = { startTime: string; endTime: string };
export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type Availability = Record<DayKey, Slot[]>;

export interface AvailabilityGridProps {
  days?: DayKey[];
  value: Availability;
  isEditing?: boolean;
  maxSlotsPerDay?: number;
  onChange?: (newAvailability: Availability) => void;
  onAddSlot?: (day: DayKey) => void;
  onRemoveSlot?: (day: DayKey, index: number) => void;
  onUpdateSlot?: (day: DayKey, index: number, slot: Slot) => void;
  className?: string;
}

const DEFAULT_DAYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function AvailabilityGrid({
  days = DEFAULT_DAYS,
  value,
  isEditing = false,
  maxSlotsPerDay = 3,
  onChange,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlot,
  className,
}: AvailabilityGridProps) {
  const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const safeGet = (d: DayKey) => value?.[d] ?? [];

  const handleAddSlot = (day: DayKey) => {
    if (onAddSlot) {
      return onAddSlot(day);
    }

    // default behaviour if parent didn't provide callback:
    const newSlot: Slot = { startTime: '09:00', endTime: '17:00' };
    const newAvail = { ...value, [day]: [...safeGet(day), newSlot] };
    onChange?.(newAvail);
  };

  const handleRemoveSlot = (day: DayKey, idx: number) => {
    if (onRemoveSlot) {
      return onRemoveSlot(day, idx);
    }
    const next = safeGet(day).filter((_, i) => i !== idx);
    onChange?.({ ...value, [day]: next });
  };

  const updateSlot = (day: DayKey, idx: number, partial: Partial<Slot>) => {
    if (onUpdateSlot) {
      const updated = { ...safeGet(day)[idx], ...partial };
      return onUpdateSlot(day, idx, updated);
    }
    const next = safeGet(day).map((s, i) => (i === idx ? { ...s, ...partial } : s));
    onChange?.({ ...value, [day]: next });
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => {
          const slots = safeGet(day);
          const isAvailable = slots && slots.length > 0;

          return (
            <div
              key={day}
              className="border border-border rounded-lg p-4 hover:border-primary transition-colors bg-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isAvailable ? 'bg-primary/10' : 'bg-muted'
                  }`}
                  aria-hidden
                >
                  {isAvailable ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground text-sm">{titleCase(day)}</h4>
                  <p className="text-xs text-muted-foreground">
                    {isAvailable ? `${slots.length} slot${slots.length > 1 ? 's' : ''}` : 'Off'}
                  </p>
                </div>
              </div>

              {slots && slots.length > 0 && (
                <div className="space-y-2 mb-3">
                  {slots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                      {isEditing ? (
                        <>
                          <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                          <input
                            aria-label={`${day}-start-${idx}`}
                            type="time"
                            value={slot.startTime}
                            onChange={e =>
                              updateSlot(day as DayKey, idx, { startTime: e.target.value })
                            }
                            className="flex-1 px-2 py-1 border border-input rounded text-xs focus:ring-2 focus:ring-ring focus:border-transparent outline-none bg-background text-foreground"
                          />
                          <span className="text-muted-foreground text-xs">to</span>
                          <input
                            aria-label={`${day}-end-${idx}`}
                            type="time"
                            value={slot.endTime}
                            onChange={e =>
                              updateSlot(day as DayKey, idx, { endTime: e.target.value })
                            }
                            className="flex-1 px-2 py-1 border border-input rounded text-xs focus:ring-2 focus:ring-ring focus:border-transparent outline-none bg-background text-foreground"
                          />
                          <button
                            onClick={() => handleRemoveSlot(day as DayKey, idx)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors shrink-0"
                            title="Remove slot"
                            type="button"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-card-foreground font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isEditing && (
                <Button
                  onClick={() => handleAddSlot(day as DayKey)}
                  disabled={slots && slots.length >= maxSlotsPerDay}
                  variant={slots && slots.length >= maxSlotsPerDay ? 'ghost' : 'blue'}
                  fullWidth
                  className="text-xs py-2"
                  iconLeft={<Plus className="w-3 h-3" />}
                  type="button"
                >
                  Add Slot
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AvailabilityGrid;
