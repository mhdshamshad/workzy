import { StickyNote } from 'lucide-react';

import { Textarea } from '@/components/atoms/Textarea';
import type { BookingState } from '@/types/slot';

export default function InstructionsStep({
  booking,
  setBooking,
  onSkip,
}: {
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">
            <StickyNote className="w-4 h-4" /> Any instructions?
          </p>
          <p className="text-xs text-muted-foreground mt-1">Help the professional prepare.</p>
        </div>
        <button
          onClick={onSkip}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0 mt-0.5 transition-colors"
        >
          Skip
        </button>
      </div>
      <Textarea
        placeholder="e.g. Ring the bell, 2nd floor, bring your own tools..."
        value={booking.note}
        onChange={e => setBooking(b => ({ ...b, note: e.target.value.trimStart() }))}
        className="text-sm bg-muted/40 min-h-27.5"
      />
    </div>
  );
}
