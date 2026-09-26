import { FileText, Calendar } from 'lucide-react';

import Label from '@/components/atoms/Label';
import ProfileImage from '@/components/molecules/ProfileImage';
import { Badge } from '@/components/ui/badge';
import { ROLE, type Role } from '@/constants';
import {
  DISPUTE_REASON_LABELS,
  DISPUTE_RESOLUTION_LABELS,
  DISPUTE_STATUS,
} from '@/constants/dispute';
import type { Dispute } from '@/types/dispute';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/time.format';

interface Props {
  dispute: Dispute;
  role: Role;
  onPreview: (index: number) => void;
}

export function DisputeDetailsView({ dispute, role, onPreview }: Props) {
  return (
    <div className="space-y-4 pt-1">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-muted/40 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
            <FileText size={16} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {dispute.disputeId}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Raised by {dispute.raisedBy === ROLE.USER ? 'Customer' : 'Worker'}
            </p>
          </div>
        </div>
        <Badge
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          variant={
            dispute.status === DISPUTE_STATUS.PENDING
              ? 'amber'
              : dispute.status === DISPUTE_STATUS.UNDER_REVIEW
                ? 'blue'
                : dispute.status === DISPUTE_STATUS.RESOLVED
                  ? 'green'
                  : 'red'
          }
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 inline-block" />
          {dispute.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(role === ROLE.ADMIN || role === ROLE.WORKER) && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <ProfileImage src={dispute.user?.profileImage} name={dispute.user.name} size={50} />
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Customer
                </span>
                {dispute.raisedBy === ROLE.USER && <Badge variant="blue">Disputant</Badge>}
              </div>
              <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                {dispute.user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{dispute.user.phone}</p>
            </div>
          </div>
        )}
        {(role === ROLE.ADMIN || role === ROLE.USER) && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <ProfileImage src={dispute.worker.profileImage} name={dispute.worker.name} size={50} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Worker
                </span>
                {dispute.raisedBy === ROLE.WORKER && <Badge variant="amber">Disputant</Badge>}
              </div>
              <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                {dispute.worker.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {dispute.worker?.phone ?? 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="gap-3 px-4 py-3.5 border-b border-border">
          <Label>Reason</Label>
          <p className="text-sm font-semibold text-foreground">
            {DISPUTE_REASON_LABELS[dispute.reason]}
          </p>
        </div>
        <div className="px-4 py-3.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Description
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {dispute.description}
          </p>
        </div>
      </div>
      {dispute.evidence && dispute.evidence.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Evidence ({dispute.evidence.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {dispute.evidence.map((item, index) => (
              <div
                key={index}
                onClick={() => onPreview(index)}
                className="group relative aspect-video rounded-xl overflow-hidden border border-border cursor-pointer bg-muted hover:border-muted-foreground/40 transition-all duration-200"
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="py-4 space-y-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {dispute.resolution && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Resolution
              </p>
              <p className="text-sm font-semibold text-foreground">
                {DISPUTE_RESOLUTION_LABELS[dispute?.resolution]}
              </p>
            </div>
          )}
          {dispute.refundedAmount && dispute?.refundedAmount > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Refunded amount
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(dispute.refundedAmount)}
              </p>
            </div>
          )}

          {dispute.resolvedAt && (
            <div className="col-span-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Resolved on
              </p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Calendar size={13} className="text-muted-foreground" />
                {formatDate(dispute.resolvedAt, 'calendar')}
              </div>
            </div>
          )}
        </div>
        {dispute.adminNote && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Resolution explanation
            </p>
            <p className="text-sm text-foreground/85 italic leading-relaxed">{dispute.adminNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
