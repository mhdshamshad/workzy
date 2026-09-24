import {
  User,
  Users,
  Search,
  MapPin,
  Menu,
  X,
  Home,
  Briefcase,
  UserPlus,
  LogOut,
  ChevronRight,
  ChevronDown,
  CreditCard,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  LocationSearchModal,
  type SelectedLocation,
} from '@/components/molecules/LocationSearchModal';
import ProfileImage from '@/components/molecules/ProfileImage';
import SearchInput from '@/components/molecules/SearchInput';
import { NotificationsDropdown } from '@/components/organisms/NotificationsDropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import ModeToggle from '@/components/ui/ModeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ROLE } from '@/constants';
import ServiceSearchContainer from '@/features/user/services/components/ServiceSearchContainer';
import { setAxiosToken } from '@/lib/api/axios';
import { logoutService, switchRoleService } from '@/services/auth.service';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser, setCredentials } from '@/store/slices/authSlice';
import { setLocation } from '@/store/slices/locationSlice';
import type { RootState } from '@/store/store';
import type { CategorySuggestion } from '@/types/category';
import { syncUserLocation } from '@/utils/locationSync';

const NAV_LINKS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/services', label: 'Services', icon: Briefcase },
  { path: '/join-us', label: 'Join Us', icon: UserPlus },
];

const SEARCH_ROUTES = ['/', '/services'];

export default function Header() {
  const { user, isAuthenticated } = useAppSelector((s: RootState) => s.auth);
  const { city } = useAppSelector((s: RootState) => s.location);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchInputRef = useRef<HTMLDivElement>(null);

  const shouldShowSearch = SEARCH_ROUTES.some(
    path => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(clearUser());
      setAxiosToken(null);
      navigate('/login');
      setMobileMenuOpen(false);
    }
  };

  const handleSwitchMode = async () => {
    if (!user) {
      return;
    }
    try {
      const data = await switchRoleService();
      setAxiosToken(data.accessToken);
      const targetPath = data.user.role === ROLE.WORKER ? '/worker/dashboard' : '/';
      navigate(targetPath, { replace: true });
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      syncUserLocation(dispatch, data.user);
    } catch (error) {
      console.error('Failed to switch role:', error);
    } finally {
      setMobileMenuOpen(false);
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handleNavClick = (path: string, closeMobile = false) => {
    if (closeMobile) {
      setMobileMenuOpen(false);
    }
    if (location.pathname === path) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handleLocationSelect = (location: SelectedLocation) => {
    dispatch(
      setLocation({
        city: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      })
    );
  };

  const handleServiceSelect = (service: CategorySuggestion) => {
    setSearchQuery('');
    if (service.level === 1) {
      navigate(`/services?category=${service.id}`);
    } else if (service.level === 2) {
      navigate(`/services/${service.id}`);
    }
    setServiceModalOpen(false);
    setMobileMenuOpen(false);
  };

  const handleOpenServiceModal = () => {
    setServiceModalOpen(true);
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link
              to="/"
              onClick={() => handleNavClick('/')}
              className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent flex-shrink-0"
            >
              Workzy
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActiveRoute(link.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {shouldShowSearch && (
              <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/80 border border-r-0 border-border rounded-l-lg transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                    {city}
                  </span>
                </button>
                <div ref={searchInputRef} className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <SearchInput
                    value={searchQuery}
                    variant="inline"
                    onChange={setSearchQuery}
                    onFocus={handleOpenServiceModal}
                    onClick={handleOpenServiceModal}
                    placeholder="Search for services"
                    className="w-full pl-9 pr-3 py-2 bg-accent border border-border rounded-r-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <div className="p-1 hover:bg-accent rounded-lg transition-colors">
                  <NotificationsDropdown />
                </div>
              )}
              <ModeToggle />
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="hidden lg:flex items-center gap-2 p-1 pr-3 hover:bg-accent rounded-full transition-colors"
                      aria-label="User account menu"
                    >
                      <ProfileImage src={user?.profileImage} size={35} name={user?.name} />
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate('/bookings')}>
                      <Briefcase className="h-4 w-4 mr-2" />
                      My Booking
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/quotes')}>
                      <FileText className="h-4 w-4 mr-2" />
                      My Quotes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/payments')}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      My Payments
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/disputes')}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Support
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </DropdownMenuItem>

                    {user?.worker?.id && (
                      <DropdownMenuItem onClick={handleSwitchMode}>
                        <Users className="h-4 w-4 mr-2" />
                        Switch to Worker Mode
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="hidden lg:block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  Login
                </button>
              )}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
                    aria-label="Open mobile navigation menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>

                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <span className="text-lg font-semibold">Menu</span>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        aria-label="Close menu"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {isAuthenticated && user && (
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.profileImage} referrerPolicy="no-referrer" />
                            <AvatarFallback>
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{user.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {shouldShowSearch && (
                      <div className="p-4 border-b border-border space-y-3">
                        <button
                          onClick={() => {
                            setLocationModalOpen(true);
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 bg-accent hover:bg-accent/80 rounded-lg transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate flex-1 text-left">
                            {city}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>

                        <button
                          onClick={() => {
                            setServiceModalOpen(true);
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 bg-accent hover:bg-accent/80 rounded-lg transition-colors"
                        >
                          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            Search for services...
                          </span>
                        </button>
                      </div>
                    )}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                      {NAV_LINKS.map(link => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => handleNavClick(link.path, true)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                              isActiveRoute(link.path)
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground hover:bg-accent'
                            }`}
                          >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">{link.label}</span>
                          </Link>
                        );
                      })}

                      {isAuthenticated && (
                        <>
                          <div className="my-2 border-t border-border" />
                          <Link
                            to="/profile"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-accent transition-colors"
                          >
                            <User className="h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">My Profile</span>
                          </Link>
                          {user?.role === ROLE.WORKER && (
                            <button
                              onClick={handleSwitchMode}
                              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-accent transition-colors"
                            >
                              <Users className="h-5 w-5 flex-shrink-0" />
                              <span className="font-medium">Switch to Worker Mode</span>
                            </button>
                          )}
                        </>
                      )}
                    </nav>
                    <div className="p-4 border-t border-border">
                      {isAuthenticated ? (
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg font-medium transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            navigate('/login');
                            setMobileMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                          Login
                        </button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <LocationSearchModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelectLocation={handleLocationSelect}
        title="Select Your Location"
        description="Choose your location to find services near you"
      />

      <ServiceSearchContainer
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        externalSearchQuery={searchQuery}
        onSelectService={handleServiceSelect}
      />
    </>
  );
}
