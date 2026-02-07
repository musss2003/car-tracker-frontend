import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarContent,
  SidebarRail,
} from '@/shared/components/ui/sidebar';

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount';

import {
  BarChart3,
  Car,
  FileText,
  Users,
  Bell,
  User,
  Home,
  Settings,
  ClipboardList,
  UserCog,
  Calendar,
} from 'lucide-react';

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useUnreadCount();
  const isAdmin = user?.role === 'admin';

  const navGroups = [
    {
      title: 'Pregled',
      items: [
        {
          to: '/dashboard',
          icon: BarChart3,
          label: 'Komandna tabela',
          badge: '',
        },
        { to: '/cars', icon: Car, label: 'Vozila', badge: '' },
      ],
    },
    {
      title: 'Upravljanje',
      items: [
        { to: '/contracts', icon: FileText, label: 'Ugovori', badge: '' },
        { to: '/bookings', icon: Calendar, label: 'Rezervacije', badge: '' },
        { to: '/customers', icon: Users, label: 'Kupci', badge: '' },
      ],
    },
    {
      title: 'Administracija',
      adminOnly: true,
      items: [
        {
          to: '/users',
          icon: UserCog,
          label: 'Upravljanje korisnicima',
          badge: '',
        },
        {
          to: '/audit-logs',
          icon: ClipboardList,
          label: 'Audit logovi',
          badge: '',
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
          badge: unreadCount > 0 ? unreadCount.toString() : undefined,
        },
        { to: '/profile', icon: User, label: 'Profil' },
      ],
    },
  ].filter((g) => !g.adminOnly || isAdmin);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Home className="h-5 w-5 text-blue-600" />
          <span>RENT A CAR</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group, idx) => (
          <SidebarGroup key={idx}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>

            <SidebarMenu>
              {group.items.map((item, j) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;

                return (
                  <SidebarMenuItem key={j}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.to}>
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>

                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                <span>Podešavanja</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
