import { Bell, Sun, Moon, Menu } from 'lucide-react';

import workzyLogo from '@/assets/icons/logo_image.svg';
import { useTheme } from '@/context/theme/use-theme';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

import Button from '../atoms/Button';

import { NotificationsDropdown } from './NotificationsDropdown';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAppSelector((s: RootState) => s.auth);

  return (
    <header className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur flex items-center justify-between px-4 lg:px-6">
      <button className="lg:hidden" onClick={onMenuClick}>
        <Menu size={26} />
      </button>
      <div className="lg:hidden flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <img src={workzyLogo} className="h-8 w-8" />
        <span className="font-semibold text-lg">WorkZy</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="p-1">
            <NotificationsDropdown role={user?.role} />
          </div>
        ) : (
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
