import { Bell, Sun, Moon, Menu } from 'lucide-react';

import { WorkzyLogo } from '@/components/atoms/WorkzyLogo';
import { useTheme } from '@/context/theme/use-theme';
import { useAppSelector } from '@/store/hooks';

import Button from '../atoms/Button';

import { NotificationsDropdown } from './NotificationsDropdown';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  return (
    <header className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur flex items-center justify-between px-4 lg:px-6">
      <button
        className="lg:hidden p-1 rounded-md"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu size={26} />
      </button>
      <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
        <WorkzyLogo />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="p-1">
            <NotificationsDropdown role={user?.role} />
          </div>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
