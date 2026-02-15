import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { ROUTES } from '@/routing/paths';

const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const AuditLogDetailsPage = lazy(() => import('./pages/AuditLogDetailsPage'));

export const auditLogsRoutes = (
  <>
    <Route path={ROUTES.admin.auditLogs} element={<AuditLogsPage />} />
    <Route
      path={ROUTES.admin.auditLogDetails}
      element={<AuditLogDetailsPage />}
    />
  </>
);
