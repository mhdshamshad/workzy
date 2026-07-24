import { FileText } from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import type { WorkerDocument, WorkerProfileDetails } from '@/types/worker';

import { WorkerDocumentCard } from '../components/WorkerDocumentCard';
import { WorkerDocumentReviewModal } from '../components/WorkerDocumentReviewModal';
import { MANDATORY_DOCUMENT_TYPES } from '../utils/documentUtils';

type WorkerOutletContext = { worker: WorkerProfileDetails };

export default function AdminWorkerDocumentsPage() {
  const { worker } = useOutletContext<WorkerOutletContext>();
  const [reviewDoc, setReviewDoc] = useState<WorkerDocument | null>(null);

  const mandatoryDocs = worker.documents.filter(d => MANDATORY_DOCUMENT_TYPES.includes(d.type));
  const additionalDocs = worker.documents.filter(d => !MANDATORY_DOCUMENT_TYPES.includes(d.type));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h3 className="text-lg font-bold">Identity Verification</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Core identity documents are locked once a worker is verified. Additional certifications
          submitted afterward can still be reviewed below.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mandatoryDocs.map(doc => (
          <WorkerDocumentCard key={doc.id} doc={doc} isMandatory={true} />
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold">Additional Certifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Documents the worker submitted after verification — trade certificates, licenses,
            insurance, and similar.
          </p>
        </div>

        {additionalDocs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {additionalDocs.map(doc => (
              <WorkerDocumentCard key={doc.id} doc={doc} onReview={() => setReviewDoc(doc)} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No additional documents</p>
            <p className="text-xs text-muted-foreground">
              Nothing has been submitted beyond the core verification documents yet.
            </p>
          </div>
        )}
      </div>

      <WorkerDocumentReviewModal
        doc={reviewDoc}
        workerId={worker.id}
        onClose={() => setReviewDoc(null)}
      />
    </div>
  );
}
