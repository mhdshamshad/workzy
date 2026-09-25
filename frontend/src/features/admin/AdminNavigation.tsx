import {
  LayoutDashboard,
  Users,
  UserCircle,
  Briefcase,
  MessageSquare,
  CreditCard,
  PanelsTopLeft,
  Star,
  FileText,
} from 'lucide-react';

import type { MenuItem } from '@/types/navigation';

export const adminMenuItems: MenuItem[] = [
  { icon: <LayoutDashboard />, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: <Users />, label: 'Users', to: '/admin/users' },
  { icon: <UserCircle />, label: 'Workers', to: '/admin/workers' },
  { icon: <Briefcase />, label: 'Categories', to: '/admin/categories' },
  { icon: <Briefcase />, label: 'Bookings', to: '/admin/bookings' },
  { icon: <MessageSquare />, label: 'Messages', to: '/admin/messages' },
  { icon: <FileText />, label: 'Disputes', to: '/admin/disputes' },
  { icon: <Star />, label: 'Reviews', to: '/admin/reviews' },
  { icon: <CreditCard />, label: 'Transactions', to: '/admin/payments' },
  { icon: <PanelsTopLeft />, label: 'Home Sections', to: '/admin/home' },
];

export const adminSupportItems: MenuItem[] = [
  // { icon: <Settings />, label: 'Settings', to: '/admin/settings' },
];
