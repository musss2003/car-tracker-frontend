import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  /**
   * Optional max width constraint
   * @default 'container' (full width with px-6 padding)
   */
  maxWidth?: 'container' | 'full' | '7xl' | '6xl' | '5xl';
  /**
   * Optional vertical padding
   * @default 'py-6'
   */
  padding?: 'py-4' | 'py-6' | 'py-8' | 'py-12';
  /**
   * Optional spacing between child elements
   * @default 'space-y-6'
   */
  spacing?: 'space-y-4' | 'space-y-6' | 'space-y-8';
}

/**
 * DashboardLayout
 *
 * Consistent layout wrapper for authenticated dashboard pages.
 * Provides fixed horizontal padding (px-6 = 24px) and vertical padding.
 * Matches the spacing used in ContractsPage, CarsPage, CustomersPage.
 *
 * @example
 * ```tsx
 * <DashboardLayout>
 *   <PageLayout
 *     title="Rezervacije"
 *     description="Upravljajte i pratite sve rezervacije"
 *     action={<Button>Kreiraj</Button>}
 *   >
 *     <div>Your content here</div>
 *   </PageLayout>
 * </DashboardLayout>
 * ```
 */
export function DashboardLayout({
  children,
  maxWidth = 'container',
  padding = 'py-6',
  spacing = 'space-y-6',
}: DashboardLayoutProps) {
  const maxWidthClass = {
    container: 'w-full',
    full: 'w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
  }[maxWidth];

  return (
    <div className={`${maxWidthClass} px-6 ${padding} ${spacing}`}>
      {children}
    </div>
  );
}
