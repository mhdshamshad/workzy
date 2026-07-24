import { useOutletContext } from 'react-router-dom';

import { WorkerAboutContent } from '@/features/worker/components/WorkerAboutContent';
import type { WorkerProfileDetails } from '@/types/worker';

type WorkerOutletContext = {
  worker: WorkerProfileDetails;
};

export default function AdminWorkerAboutPage() {
  const { worker } = useOutletContext<WorkerOutletContext>();
  const { about, availability, languages } = worker;
  return (
    <WorkerAboutContent
      key={worker.id}
      about={about}
      availability={availability}
      languages={languages}
    />
  );
}
