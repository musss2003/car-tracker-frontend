import { ReactNode } from 'react';

interface PageLayoutProps {
  /**
   * Page title
   */
  title: string;
  /**
   * Optional page description/subtitle
   */
  description?: string;
  /**
   * Optional action button/element to display in header
   */
  action?: ReactNode;
  /**
   * Page content
   */
  children: ReactNode;
  /**
   * Optional spacing between header and content
   * @default 'space-y-6'
   */
  spacing?: 'space-y-4' | 'space-y-6' | 'space-y-8';
}

/**
 * PageLayout
 *
 * Consistent page structure with title, description, and optional action.
 * Use inside DashboardLayout for authenticated pages.
 *
 * @example
 * ```tsx
 * <DashboardLayout>
 *   <PageLayout
 *     title="Rezervacije"
 *     description="Upravljajte i pratite sve rezervacije"
 *     action={
 *       <Button onClick={() => navigate('/bookings/create')}>
 *         <PlusIcon /> Kreiraj Rezervaciju
 *       </Button>
 *     }
 *   >
 *     <div>Your page content here</div>
 *   </PageLayout>
 * </DashboardLayout>
 * ```
 */
export function PageLayout({
  title,
  description,
  action,
  children,
  spacing = 'space-y-6',
}: PageLayoutProps) {
  return (
    <div className={spacing}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
