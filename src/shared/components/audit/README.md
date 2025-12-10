# AuditLogHistory Component

Reusable component for displaying audit log history for any resource with expandable/collapsible interface.

## Features

- ✅ Expandable/collapsible audit log section
- ✅ Color-coded action badges (Create, Update, Delete, Read)
- ✅ Before/After comparison view for updates
- ✅ Special views for create and delete operations
- ✅ Loading states
- ✅ Empty state handling
- ✅ Formatted timestamps
- ✅ User information display

## Usage

```tsx
import { AuditLogHistory } from '@/shared/components/audit/AuditLogHistory';
import { getIssueReportAuditLogs } from '../services/carIssueReportService';

function MyComponent() {
  return (
    <div>
      {/* Your component content */}

      <AuditLogHistory
        resourceId={issue.id}
        fetchAuditLogs={getIssueReportAuditLogs}
        title="Historija izmjena"
      />
    </div>
  );
}
```

## Props

| Prop             | Type                                                                    | Required | Default               | Description                                               |
| ---------------- | ----------------------------------------------------------------------- | -------- | --------------------- | --------------------------------------------------------- |
| `resourceId`     | `string`                                                                | Yes      | -                     | The ID of the resource to fetch audit logs for            |
| `fetchAuditLogs` | `(resourceId: string) => Promise<{success: boolean, data: AuditLog[]}>` | Yes      | -                     | Function that fetches audit logs for the resource         |
| `title`          | `string`                                                                | No       | `"Historija izmjena"` | Title displayed in the toggle button and expanded section |
| `className`      | `string`                                                                | No       | `""`                  | Additional CSS classes                                    |

## Example Service Functions

### Car Issue Report

```tsx
import { getIssueReportAuditLogs } from '../services/carIssueReportService';

<AuditLogHistory
  resourceId={issueId}
  fetchAuditLogs={getIssueReportAuditLogs}
/>;
```

### Contract

```tsx
import { getContractAuditLogs } from '../services/contractService';

<AuditLogHistory
  resourceId={contractId}
  fetchAuditLogs={getContractAuditLogs}
  title="Historija ugovora"
/>;
```

### Customer

```tsx
import { getCustomerAuditLogs } from '../services/customerService';

<AuditLogHistory
  resourceId={customerId}
  fetchAuditLogs={getCustomerAuditLogs}
  title="Historija klijenta"
/>;
```

## Creating Service Functions

To use this component, you need to create a service function that fetches audit logs for your resource:

```typescript
// In your service file (e.g., contractService.ts)
export async function getContractAuditLogs(
  contractId: string,
  page: number = 1,
  limit: number = 50
): Promise<{
  success: boolean;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const res = await fetch(
    `${BASE_PATH}/${encodeURIComponent(contractId)}/audit-logs?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse<{
    success: boolean;
    data: AuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(res);
}
```

## Backend Requirements

Your backend should have an endpoint that returns audit logs in this format:

```typescript
GET /api/resource/:id/audit-logs?page=1&limit=50

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "username": "john.doe",
      "userRole": "admin",
      "action": "UPDATE",
      "resource": "car_issue_report",
      "resourceId": "resource-uuid",
      "description": "Updated issue report status: open → resolved",
      "changes": {
        "before": { "status": "open" },
        "after": { "status": "resolved" }
      },
      "createdAt": "2025-12-02T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "totalPages": 1
  }
}
```

## Styling

The component uses Tailwind CSS and supports both light and dark modes. Color coding:

- 🟢 **Green**: CREATE actions, "after" changes
- 🔵 **Blue**: UPDATE actions
- 🔴 **Red**: DELETE actions, "before" changes
- ⚪ **Gray**: READ actions

## Change Display Formats

### Create (only "after" exists)

Shows new values in green box with "Kreirano:" label.

### Update (both "before" and "after" exist)

Shows side-by-side comparison with before (red) and after (green) values.

### Delete (only "before" exists)

Shows deleted values in red box with "Obrisano:" label.
