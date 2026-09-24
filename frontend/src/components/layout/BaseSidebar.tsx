import { ChevronDown, ChevronLeft, ChevronRight, LogOut, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ROLE } from '@/constants';
import { setAxiosToken } from '@/lib/api/axios';
import { cn } from '@/lib/utils';
import { logoutService, switchRoleService } from '@/services/auth.service';
import { useAppDispatch } from '@/store/hooks';
import { clearUser, setCredentials } from '@/store/slices/authSlice';
import type { MenuItem } from '@/types/navigation';
import type { User } from '@/types/user';
import { syncUserLocation } from '@/utils/locationSync';

import workzyLogo from '../../assets/icons/logo_image.svg';
import ProfileImage from '../molecules/ProfileImage';
import { SidebarItem } from '../molecules/SidebarItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';

interface BaseSidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
  initialRender: boolean;
  mobile?: boolean;
  onNavigate?: () => void;

  menuItems: MenuItem[];
  supportItems?: MenuItem[];
  user: User;
}

export function BaseSidebar({
  collapsed,
  toggleCollapse,
  initialRender,
  mobile = false,
  menuItems,
  onNavigate,
  supportItems = [],
  user,
}: BaseSidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const worker = user.worker;

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(clearUser());
      setAxiosToken(null);
      navigate('/login');
    }
  };

  const handleSwitchMode = async () => {
    try {
      const data = await switchRoleService();
      setAxiosToken(data.accessToken);
      const targetPath = data.user.role === ROLE.WORKER ? '/worker/dashboard' : '/';
      navigate(targetPath, { replace: true });
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      syncUserLocation(dispatch, data.user);
    } catch (error) {
      console.error('Failed to switch role:', error);
    }
  };

  return (
    <aside
      className={cn(
        'h-full flex flex-col bg-card border-r shadow-sm overflow-hidden no-scrollbar',
        !initialRender && 'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-72',
        mobile && 'w-72'
      )}
    >
      <div
        className={cn('flex items-center p-4', collapsed ? 'justify-center' : 'justify-between')}
      >
        <div className="flex items-center gap-3">
          <img
            src={workzyLogo}
            alt="Workzy Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          {!collapsed && <span className="text-lg font-semibold">WorkZy</span>}
        </div>

        {!collapsed && !mobile && (
          <button
            onClick={toggleCollapse}
            aria-label="Collapse sidebar"
            className="p-1 rounded-md hover:bg-accent"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {collapsed && !mobile && (
          <button
            className="absolute left-[62px] p-1 rounded-md hover:bg-accent"
            onClick={toggleCollapse}
            aria-label="Expand sidebar"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* menu items  */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
        {menuItems.map((item, i) => (
          <SidebarItem
            key={i}
            icon={item.icon}
            label={item.label}
            to={item.to}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}

        {supportItems.length > 0 && (
          <>
            <Separator className="my-4" />
            {supportItems.map((item, i) => (
              <SidebarItem
                key={i}
                icon={item.icon}
                label={item.label}
                to={item.to}
                collapsed={collapsed}
              />
            ))}
          </>
        )}
      </div>
      <div className="p-4">
        <Separator className="mb-3" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'w-full flex items-center p-3 rounded-xl cursor-pointer hover:bg-accent text-left',
                collapsed && 'justify-center'
              )}
            >
              {user.role === ROLE.WORKER ? (
                <ProfileImage src={worker?.profileImage} name={worker?.displayName} size={40} />
              ) : (
                <ProfileImage src={user?.profileImage} name={user?.name} size={40} />
              )}

              {!collapsed && (
                <div className="ml-3 flex-1">
                  {user.role === ROLE.WORKER ? (
                    <p className="text-sm font-medium">{worker?.displayName}</p>
                  ) : (
                    <p className="text-sm font-medium">{user.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}

              {!collapsed && <ChevronDown size={14} />}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 rounded-xl p-2" align="end">
            {user?.worker?.id && (
              <DropdownMenuItem className="p-3 text-sm" onClick={handleSwitchMode}>
                <Repeat className="mr-2 h-4 w-4" /> Switch to User
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="p-3 text-red-500 text-sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
