export const ROUTES = {
  auth: {
    login: '/login',
  },

  dashboard: '/dashboard',

  cars: {
    root: '/cars',
    create: '/cars/new',
    details: '/cars/:id',
    edit: '/cars/:id/edit',
    availability: '/cars/:id/availability',
    serviceHistory: '/cars/:id/service-history',
    registration: '/cars/:id/registration',
    issues: '/cars/:id/issues',
    insurance: '/cars/:id/insurance',
    maintenance: '/cars/:id/maintenance',
    costAnalytics: '/cars/:id/cost-analytics',
    timeline: '/cars/:id/timeline',
  },

  bookings: {
    root: '/bookings',
    create: '/bookings/new',
  },

  contracts: {
    root: '/contracts',
    create: '/contracts/new',
    details: '/contracts/:id',
    edit: '/contracts/:id/edit',
  },

  customers: {
    root: '/customers',
    create: '/customers/new',
    details: '/customers/:id',
    edit: '/customers/:id/edit',
  },

  admin: {
    users: '/users',
    createUser: '/users/create',
    editUser: '/users/:id/edit',
    auditLogs: '/audit-logs',
    auditLogDetails: '/audit-logs/:id',
  },

  profile: '/profile',
  notifications: '/notifications',
} as const;
