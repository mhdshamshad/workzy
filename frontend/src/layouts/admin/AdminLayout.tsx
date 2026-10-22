import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';

import AppLoader from '@/components/atoms/AppLoader';
import { Topbar } from '@/components/organisms/Topbar';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';

import { AdminSidebar } from './AdminSidebar';

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-muted/30 ">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <VisuallyHidden>
            <SheetTitle>Admin Sidebar</SheetTitle>
            <SheetDescription>Mobile navigation drawer</SheetDescription>
          </VisuallyHidden>
          <AdminSidebar mobile onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          onMenuClick={() => {
            setMobileSidebarOpen(true);
          }}
        />
        <main className="flex-1 overflow-y-auto no-scrollbar bg-background overflow-x-hidden min-w-0">
          <Suspense fallback={<AppLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
