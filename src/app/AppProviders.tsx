import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import UserProvider from '@/features/auth/hooks/useAuth';
import { SidebarProvider } from '@/shared/components/ui/sidebar';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
