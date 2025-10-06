import { JSX, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChartBarIcon,
  UserIcon,
  TruckIcon,
  ClipboardListIcon,
  UserCircleIcon,
  BellIcon,
  XIcon,
  HomeIcon,
} from '@heroicons/react/solid';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  isSmallScreen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  to: string;
  icon: JSX.Element;
  label: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isSmallScreen,
  toggleSidebar,
}) => {
  const location = useLocation();

  // Close sidebar with Escape key on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && isSmallScreen) {
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSmallScreen, toggleSidebar]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSmallScreen && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSmallScreen, isOpen]);

  // Reusable NavLink component with active state
  const NavLink: React.FC<NavItem> = ({ to, icon, label }) => {
    const isActive = location.pathname === to;

    return (
      <Link
        to={to}
        className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
        onClick={isSmallScreen ? toggleSidebar : undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className="nav-icon">{icon}</div>
        <span className="nav-label">{label}</span>
        {!isOpen && <div className="nav-tooltip">{label}</div>}
      </Link>
    );
  };

  // Navigation structure
  const navGroups: { title: string; items: NavItem[] }[] = [
    {
      title: 'Main',
      items: [
        { to: '/dashboard', icon: <ChartBarIcon />, label: 'Komandna tabela' },
        { to: '/cars', icon: <TruckIcon />, label: 'Auta' },
      ],
    },
    {
      title: 'Management',
      items: [
        { to: '/contracts', icon: <ClipboardListIcon />, label: 'Ugovori' },
        { to: '/customers', icon: <UserCircleIcon />, label: 'Korisnici' },
      ],
    },
    {
      title: 'Account',
      items: [
        { to: '/notifications', icon: <BellIcon />, label: 'Notifikacije' },
        { to: '/profile', icon: <UserIcon />, label: 'Profil' },
      ],
    },
  ];

  return (
    <>
      {isSmallScreen && isOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <nav
        className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'} ${
          isSmallScreen ? 'sidebar-mobile' : 'sidebar-desktop'
        }`}
        aria-label="Main Navigation"
        role="navigation"
      >
        <div className="sidebar-content">
          <div className="sidebar-header">
            <Link to="/" className="sidebar-logo">
              <HomeIcon className="logo-icon" />
              {isOpen && <span>RENT A CAR</span>}
            </Link>
            {isOpen && isSmallScreen && (
              <button
                onClick={toggleSidebar}
                className="sidebar-close-button"
                aria-label="Close sidebar"
              >
                <XIcon />
              </button>
            )}
          </div>

          <div className="sidebar-nav">
            {navGroups.map((group, index) => (
              <div key={index} className="nav-group">
                {isOpen && <h3 className="nav-group-title">{group.title}</h3>}
                {group.items.map((item, idx) => (
                  <NavLink
                    key={idx}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
