import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { AppModal } from '@/components/molecules/AppModal';
import { MultiUpload } from '@/components/molecules/MultiUpload';
import type { EvidenceItem } from '@/types/booking';

type EvidenceItemForm = Pick<EvidenceItem, 'type' | 'url'>;
export interface BookigCompleteForm {
  evidence: {
    before: EvidenceItemForm[];
    after: EvidenceItemForm[];
  };
  note?: string;
}

interface WorkerCompleteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BookigCompleteForm) => Promise<void>;
  bookingId: string | null;
  isSubmitting?: boolean;
  title?: string;
}

export default function WorkerCompleteModal({
  open,
  onClose,
  onSubmit,
  bookingId,
  isSubmitting = false,
  title = 'Complete Job',
}: WorkerCompleteModalProps) {
  const [note, setNote] = useState('');
  const [beforeEvidence, setBeforeEvidence] = useState<EvidenceItemForm[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [afterEvidence, setAfterEvidence] = useState<EvidenceItemForm[]>([]);

  useEffect(() => {
    if (!open) {
      setNote('');
      setBeforeEvidence([]);
      setAfterEvidence([]);
    }
  }, [open]);

  if (!bookingId) {
    return null;
  }

  const handleConfirm = async () => {
    if (beforeEvidence.length === 0 || afterEvidence.length === 0) {
      toast.error('Please upload at least one Before and one After evidence');
      return;
    }

    try {
      await onSubmit({
        evidence: {
          before: beforeEvidence,
          after: afterEvidence,
        },
        note: note.trim() || undefined,
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete job');
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" disabled={isSubmitting || isUploading} onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="green"
        disabled={
          beforeEvidence.length === 0 || afterEvidence.length === 0 || isSubmitting || isUploading
        }
        onClick={handleConfirm}
        loading={isSubmitting}
        iconLeft={<CheckCircle2 size={14} />}
      >
        {isUploading ? 'Waiting for uploads...' : 'Complete Job'}
      </Button>
    </div>
  );

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={title}
      canCloseOnOutsideClick={!isSubmitting}
      className="max-w-2xl"
      footer={footer}
    >
      <div className="flex flex-col gap-8 py-2">
        <div className="space-y-4">
          <MultiUpload
            label="Before Progress Evidence"
            value={beforeEvidence}
            onChange={setBeforeEvidence}
            purpose="SERVICE_EVIDENCE"
            maxFiles={4}
            autoCompress
            onUploadingChange={setIsUploading}
          />
        </div>

        <div className="space-y-4">
          <MultiUpload
            label="After Completion Evidence"
            value={afterEvidence}
            onChange={setAfterEvidence}
            purpose="SERVICE_EVIDENCE"
            onUploadingChange={setIsUploading}
            maxFiles={4}
            autoCompress
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Completion Note (Optional)</Label>
          <Textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Describe the final outcome or any details for the client..."
            disabled={isSubmitting}
            className="min-h-25"
          />
        </div>
      </div>
    </AppModal>
  );
}
