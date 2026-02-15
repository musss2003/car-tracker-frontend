export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  EXPORT = 'EXPORT',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
}

export enum AuditResource {
  CONTRACT = 'contract',
  CUSTOMER = 'customer',
  CAR = 'car',
  CAR_ISSUE_REPORT = 'car_issue_report',
  CAR_INSURANCE = 'car_insurance',
  CAR_REGISTRATION = 'car_registration',
  CAR_SERVICE_HISTORY = 'car_service_history',
  USER = 'user',
  AUTH = 'auth',
  NOTIFICATION = 'notification',
  COUNTRY = 'country',
  BOOKING = 'booking',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export interface AuditLog {
  id: string;
  userId?: string;
  username?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  description: string;
  changes?: {
    before?: any;
    after?: any;
  };
  status: AuditStatus;
  errorMessage?: string;
  duration?: number;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  resource?: AuditResource;
  status?: AuditStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogStatistics {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByResource: Record<string, number>;
  failedActions: number;
  uniqueUsers: number;
}

export interface AuditLogResponse {
  success: boolean;
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
