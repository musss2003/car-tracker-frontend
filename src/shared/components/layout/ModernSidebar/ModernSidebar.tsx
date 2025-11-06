import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '../../ui/sheet';
import { Separator } from '../../ui/separator';
import { Badge } from '../../ui/badge';
import './ModernSidebar.css';
import {
  BarChart3,
  Car,
  FileText,
  Users,
  Bell,
  User,
  Home,
  Menu,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  isSmallScreen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string | number;
  isNew?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const ModernSidebar: React.FC<SidebarProps> = ({
  isOpen,
  isSmallScreen,
  toggleSidebar,
}) => {
  const location = useLocation();

  // Navigation structure with updated icons and Bosnian labels
  const navGroups: NavGroup[] = [
    {
      title: 'Pregled',
      items: [
        {
          to: '/dashboard',
          icon: BarChart3,
          label: 'Komandna tabela',
          badge: '2',
        },
        {
          to: '/cars',
          icon: Car,
          label: 'Vozila',
        },
      ],
    },
    {
      title: 'Upravljanje',
      items: [
        {
          to: '/contracts',
          icon: FileText,
          label: 'Ugovori',
        },
        {
          to: '/customers',
          icon: Users,
          label: 'Korisnici',
        },
      ],
    },
    {
      title: 'Račun',
      items: [
        {
          to: '/notifications',
          icon: Bell,
          label: 'Notifikacije',
          badge: '3',
          isNew: true,
        },
        {
          to: '/profile',
          icon: User,
          label: 'Profil',
        },
      ],
    },
  ];

  // Navigation link component
  const NavLink: React.FC<NavItem & { compact?: boolean }> = ({
    to,
    icon: Icon,
    label,
    badge,
    isNew,
    compact = false,
  }) => {
    const isActive = location.pathname === to;

    return (
      <Link to={to} onClick={isSmallScreen ? toggleSidebar : undefined}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start h-11 mb-1',
            compact ? 'px-2' : 'px-3',
            isActive && 'bg-blue-50 text-blue-700 hover:bg-blue-100',
            !isActive && 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <Icon
            className={cn('shrink-0', compact ? 'h-5 w-5' : 'h-4 w-4 mr-3')}
          />
          {!compact && (
            <>
              <span className="truncate">{label}</span>
              {badge && (
                <Badge
                  variant={isNew ? 'destructive' : 'secondary'}
                  className="ml-auto h-5 px-1.5 text-xs"
                >
                  {badge}
                </Badge>
              )}
            </>
          )}
        </Button>
      </Link>
    );
  };

  // Mobile Header with hamburger menu (only visible on mobile)
  const MobileHeader = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center px-4 shadow-sm">
      <Sheet open={isOpen} onOpenChange={toggleSidebar}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 p-0 !bg-white border-r border-gray-200 mobile-sidebar-sheet  data-[state=open]:animate-slide-in-from-left data-[state=closed]:animate-slide-out-to-left"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation menu for the Car Tracker application
          </SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <Link
        to="/"
        className="flex items-center gap-2 font-semibold text-gray-900 ml-4"
      >
        <Home className="h-6 w-6 text-blue-600" />
        <span className="text-lg">RENT A CAR</span>
      </Link>
    </div>
  );

  // Desktop sidebar content
  const SidebarContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex h-full flex-col bg-white text-gray-900 transition-all duration-300">
      {/* Header */}
      <div
        className={cn(
          'flex items-center border-b px-3 py-4',
          compact && 'justify-center px-2'
        )}
      >
        <Link
          to="/"
          className={cn(
            'flex items-center font-semibold text-gray-900',
            compact ? 'justify-center' : 'gap-2'
          )}
        >
          <Home className="h-6 w-6 text-blue-600" />
          {!compact && <span className="text-lg">RENT A CAR</span>}
        </Link>
        {!compact && !isSmallScreen && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 w-8 p-0"
            onClick={toggleSidebar}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {compact && !isSmallScreen && (
          <div className="flex justify-center w-full">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={toggleSidebar}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-6">
          {navGroups.map((group, index) => (
            <div key={index}>
              {!compact && (
                <h3 className="mb-2 px-2 text-sm font-medium text-gray-500">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item, idx) => (
                  <NavLink key={idx} {...item} compact={compact} />
                ))}
              </div>
              {index < navGroups.length - 1 && !compact && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className={cn('border-t p-3', compact && 'px-2')}>
        <Link to="/settings">
          <Button
            variant="ghost"
            className={cn(
              'w-full',
              compact ? 'h-11 px-2' : 'justify-start h-11 px-3'
            )}
          >
            <Settings
              className={cn('shrink-0', compact ? 'h-5 w-5' : 'h-4 w-4 mr-3')}
            />
            {!compact && <span>Podešavanja</span>}
          </Button>
        </Link>
      </div>
    </div>
  );

  if (isSmallScreen) {
    // Mobile: render mobile header + main content
    return <MobileHeader />;
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r bg-white border-gray-200 transition-all duration-300 relative shadow-sm',
        isOpen ? 'w-72' : 'w-16'
      )}
    >
      <SidebarContent compact={!isOpen} />
    </div>
  );
};

export default ModernSidebar;
