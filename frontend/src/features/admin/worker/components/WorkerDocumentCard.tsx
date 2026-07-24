import dayjs from 'dayjs';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Pencil,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DOCUMENT_STATUS } from '@/constants';
import { cn } from '@/lib/utils';
import type { WorkerDocument } from '@/types/worker';

import { getDocInfo } from '../utils/documentUtils';

interface WorkerDocumentCardProps {
  doc: WorkerDocument;
  onReview?: () => void;
  isMandatory?: boolean;
}

export function WorkerDocumentCard({ doc, onReview, isMandatory }: WorkerDocumentCardProps) {
  const docInfo = getDocInfo(doc.type);
  const DocmentIcon = docInfo.icon;

  const isVerified = doc.status === DOCUMENT_STATUS.VERIFIED;
  const isRejected = doc.status === DOCUMENT_STATUS.REJECTED;
  const isInReview = doc.status === DOCUMENT_STATUS.IN_REVIEW;
  const isPendingUntouched = doc.status === DOCUMENT_STATUS.PENDING;

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
        isPendingUntouched && 'bg-blue-500/15',
        isInReview && 'bg-amber-500/15'
      )}
    >
      <div className="relative group w-full h-40 bg-muted/50 overflow-hidden">
        <img
          src={doc?.url}
          alt={docInfo.label}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <a
            href={doc?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-background/90 shadow-sm hover:bg-background flex items-center gap-1.5 px-3 text-xs font-medium"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </a>
        </div>
        {onReview && !isVerified && !isRejected && (
          <button
            type="button"
            onClick={onReview}
            title="Review this document"
            className="absolute top-2 right-2 z-10 rounded-full bg-background/90 p-1.5 shadow-sm hover:bg-background transition-colors"
          >
            <Pencil className="h-3.5 w-3.5 text-foreground" />
          </button>
        )}
      </div>

      <div className="p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <DocmentIcon className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold">{docInfo.label}</h4>
              <p className="text-[11px] text-muted-foreground">
                {isVerified ? 'Verified' : 'Uploaded'}{' '}
                {dayjs(isVerified ? (doc.verifiedAt ?? doc.uploadedAt) : doc.uploadedAt).format(
                  'MMM DD, YYYY'
                )}
              </p>
            </div>
          </div>
          <Badge
            variant={
              isVerified ? 'green' : isRejected ? 'red' : isPendingUntouched ? 'blue' : 'amber'
            }
          >
            {isVerified ? (
              isMandatory ? (
                <ShieldCheck className="h-3 w-3" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )
            ) : isRejected ? (
              <XCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {isVerified
              ? 'Verified'
              : isRejected
                ? 'Rejected'
                : isPendingUntouched
                  ? 'Pending'
                  : 'In Review'}
          </Badge>
        </div>

        {isVerified && !isMandatory && (
          <p className="text-xs text-muted-foreground italic">
            This document has been verified and can no longer be reviewed.
          </p>
        )}

        {isRejected && (
          <div className="text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-2">
            <p className="font-medium text-rose-600 flex items-center gap-1 mb-0.5">
              <AlertTriangle className="h-3 w-3" /> Rejection Reason
            </p>
            <p className="text-foreground">{doc.rejectReason || 'No reason provided.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
