import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Check, RefreshCcw, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { AppModal } from '@/components/molecules/AppModal';
import { DOCUMENT_STATUS, type DocumentStatus } from '@/constants';
import type { WorkerDocument } from '@/types/worker';
import { handleApiError } from '@/utils/handleApiError';

import { useReviewWorkerDocument } from '../hooks/useReviewWorkerDocument';
import { getDocInfo } from '../utils/documentUtils';
import {
  reviewWorkerDocumentSchema,
  type ReviewWorkerDocumentSchemaType,
} from '../validation/reviewWorkerDocumentSchema';

interface DocumentReviewModalProps {
  doc: WorkerDocument | null;
  workerId: string;
  onClose: () => void;
}

type UpdatableDocumentStatus = Exclude<DocumentStatus, typeof DOCUMENT_STATUS.PENDING>;

export function WorkerDocumentReviewModal({ doc, workerId, onClose }: DocumentReviewModalProps) {
  const { mutateAsync: reviewDocument, isPending } = useReviewWorkerDocument();

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewWorkerDocumentSchemaType>({
    resolver: zodResolver(reviewWorkerDocumentSchema),
    defaultValues: {
      id: doc?.id ?? '',
      status: DOCUMENT_STATUS.IN_REVIEW,
      rejectReason: undefined,
    },
  });

  useEffect(() => {
    if (!doc) {
      return;
    }
    reset({
      id: doc.id,
      status: doc.status === DOCUMENT_STATUS.PENDING ? DOCUMENT_STATUS.IN_REVIEW : doc.status,
      rejectReason: doc.rejectReason ?? undefined,
    });
  }, [doc, reset]);

  const draftStatus = watch('status');

  const setStatus = (next: UpdatableDocumentStatus) => {
    setValue('status', next, { shouldDirty: true, shouldValidate: true });
    if (next !== DOCUMENT_STATUS.REJECTED) {
      setValue('rejectReason', undefined, { shouldDirty: true, shouldValidate: true });
    }
  };

  const onSubmit = async (data: ReviewWorkerDocumentSchemaType) => {
    try {
      const res = await reviewDocument({ workerId, data });
      toast.success(res?.message);
      onClose();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  if (!doc) {
    return null;
  }

  const docInfo = getDocInfo(doc.type);

  return (
    <AppModal
      open={!!doc}
      onClose={onClose}
      title={`Review ${docInfo.label}`}
      isDescriptionHidden
      canCloseOnOutsideClick={!isPending}
      confirmText="Save Review"
      cancelText="Cancel"
      onConfirm={handleSubmit(onSubmit)}
      isConfirmLoading={isPending}
      isConfirmDisabled={draftStatus === doc.status}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border overflow-hidden h-56 bg-muted/50">
          <img src={doc.url} alt={docInfo.label} className="w-full h-full object-contain" />
        </div>

        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
          <Button
            type="button"
            size="xs"
            variant={draftStatus === DOCUMENT_STATUS.IN_REVIEW ? 'warning' : 'ghost'}
            iconLeft={<RefreshCcw className="h-3.5 w-3.5" />}
            onClick={() => setStatus('in_review')}
          >
            In Review
          </Button>
          <Button
            type="button"
            size="xs"
            variant={draftStatus === DOCUMENT_STATUS.VERIFIED ? 'green' : 'ghost'}
            iconLeft={<Check className="h-3.5 w-3.5" />}
            onClick={() => setStatus('verified')}
          >
            Approve
          </Button>
          <Button
            type="button"
            size="xs"
            variant={draftStatus === DOCUMENT_STATUS.REJECTED ? 'red' : 'ghost'}
            iconLeft={<X className="h-3.5 w-3.5" />}
            onClick={() => setStatus('rejected')}
          >
            Reject
          </Button>
        </div>

        {draftStatus === DOCUMENT_STATUS.REJECTED && (
          <div className="space-y-1.5">
            <Label className="text-[11px] flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-rose-500" />
              Rejection Reason *
            </Label>
            <Textarea
              {...register('rejectReason', {
                setValueAs: v => (v === '' ? undefined : v),
              })}
              placeholder="Describe why this document is rejected..."
              error={errors.rejectReason?.message}
            />
          </div>
        )}
      </div>
    </AppModal>
  );
}
