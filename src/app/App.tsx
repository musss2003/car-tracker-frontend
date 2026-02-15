import { useEffect, useRef } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import ErrorBoundary from '../shared/components/feedback/ErrorBoundary/ErrorBoundary';
import { AppRouter } from '../routing/router';
import { socketService } from '../shared/services/socketService';

import { Toaster } from '@/shared/components/ui/sonner';
import { AppSidebar } from '@/shared/components/layout';
import { Menu } from 'lucide-react';
import { useSidebar } from '@/shared/components/ui/sidebar';
import useIsMobile from '@/shared/hooks/useIsMobile';

function App() {
  const { isLoggedIn, user } = useAuth();
  const { isMobile } = useIsMobile();
  const { toggleSidebar } = useSidebar(); // <-- Shadcn sidebar hook

  // CONNECT SOCKET
  const hasConnected = useRef(false);

  useEffect(() => {
    if (isLoggedIn() && user?.id && !hasConnected.current) {
      socketService.connect(user.id);
      hasConnected.current = true;
    }

    return () => {
      if (hasConnected.current) {
        socketService.disconnect();
        hasConnected.current = false;
      }
    };
  }, [isLoggedIn(), user?.id]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Toaster />

        {/* SIDEBAR (auto-handles mobile overlay mode) */}
        {isLoggedIn() && <AppSidebar />}

        {/* MAIN CONTENT */}
        <main className="flex flex-col flex-1 overflow-y-auto">
          {/* MOBILE TOP BAR WITH HAMBURGER BUTTON */}
          {isLoggedIn() && isMobile && (
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shadow-sm">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-100 transition"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-semibold">Menu</span>
            </div>
          )}

          {/* PAGE CONTENT */}
          <div className="p-4">
            <AppRouter />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
