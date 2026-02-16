import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  /**
   * Optional background image or gradient
   */
  backgroundClass?: string;
}

/**
 * AuthLayout
 *
 * Centered layout for authentication pages (login, register).
 * Provides a centered card with consistent styling.
 *
 * @example
 * ```tsx
 * <AuthLayout>
 *   <div className="space-y-6">
 *     <h1 className="text-2xl font-bold text-center">Prijava</h1>
 *     <LoginForm />
 *   </div>
 * </AuthLayout>
 * ```
 */
export function AuthLayout({
  children,
  backgroundClass = 'bg-gradient-to-br from-background to-muted',
}: AuthLayoutProps) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${backgroundClass}`}
    >
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
