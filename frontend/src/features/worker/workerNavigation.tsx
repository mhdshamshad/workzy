import {
  Briefcase,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Star,
  User2,
  Wallet,
} from 'lucide-react';

import type { MenuItem } from '@/types/navigation';

export const workerMenuItems: MenuItem[] = [
  { icon: <LayoutDashboard />, label: 'Dashboard', to: '/worker/dashboard' },
  { icon: <Briefcase />, label: 'My Bookings', to: '/worker/bookings' },
  { icon: <ClipboardList />, label: 'My Services', to: '/worker/services' },
  { icon: <User2 />, label: 'Profile', to: '/worker/profile' },
  { icon: <Wallet />, label: 'Payments', to: '/worker/payments' },
  { icon: <Star />, label: 'Reviews', to: '/worker/reviews' },
  { icon: <FileText />, label: 'Quotes', to: '/worker/quotes' },
  { icon: <MessageSquare />, label: 'Messages', to: '/worker/messages' },
];

export const workerSupportItems: MenuItem[] = [
  { icon: <HelpCircle />, label: 'Support', to: '/worker/disputes' },
  // { icon: <Settings />, label: 'Settings', to: '/worker/settings' },
];
