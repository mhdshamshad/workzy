import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Topbar } from '@/components/organisms/Topbar';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';

import { WorkerSidebar } from './WorkerSidebar';

export default function WorkerLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex inset-0 fixed bg-muted/30">
      <div className="hidden lg:block h-full">
        <WorkerSidebar />
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <VisuallyHidden>
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Mobile navigation</SheetDescription>
          </VisuallyHidden>
          <WorkerSidebar mobile onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          onMenuClick={() => {
            setMobileSidebarOpen(true);
          }}
        />
        <main className="flex-1 overflow-y-auto no-scrollbar bg-background min-w-0 overflow-x-hidden">
          <Suspense fallback={<div className="opacity-50" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
