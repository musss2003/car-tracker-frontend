# Layout Components Guide

This guide explains how to use the layout components to maintain consistent styling across your application.

## Available Layouts

### 1. DashboardLayout

**Purpose**: Wrapper for authenticated dashboard pages

**Features**:

- Fixed horizontal padding (px-6 = 24px on all screen sizes)
- Configurable vertical padding and spacing
- Consistent with ContractsPage, CarsPage, CustomersPage
- Full width layout by default

**Props**:

```typescript
interface DashboardLayoutProps {
  children: ReactNode;
  maxWidth?: 'container' | 'full' | '7xl' | '6xl' | '5xl'; // default: 'container' (full width)
  padding?: 'py-4' | 'py-6' | 'py-8' | 'py-12'; // default: 'py-6'
  spacing?: 'space-y-4' | 'space-y-6' | 'space-y-8'; // default: 'space-y-6'
}
```

**Spacing Details**:

- **Horizontal**: Fixed `px-6` (24px left/right) - matches other dashboard pages
- **Vertical**: Configurable `py-6` (24px top/bottom) by default
- **Children**: Configurable `space-y-6` (24px gap) by default

**Example**:

```tsx
import { DashboardLayout, PageLayout } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/button';

function MyPage() {
  return (
    <DashboardLayout>
      <PageLayout
        title="Rezervacije"
        description="Upravljajte rezervacijama"
        action={<Button>Kreiraj Novu</Button>}
      >
        {/* Your page content */}
        <div>...</div>
      </PageLayout>
    </DashboardLayout>
  );
}
```

**Custom Configuration**:

```tsx
<DashboardLayout
  maxWidth="7xl" // Wider container
  padding="py-8" // More padding
  spacing="space-y-8" // Larger spacing
>
  {children}
</DashboardLayout>
```

---

### 2. PageLayout

**Purpose**: Consistent page header with title, description, and actions

**Features**:

- Standardized page title and description
- Optional action button/element
- Responsive spacing

**Props**:

```typescript
interface PageLayoutProps {
  title: string; // Page title (required)
  description?: string; // Optional subtitle
  action?: ReactNode; // Optional action button
  children: ReactNode; // Page content
  spacing?: 'space-y-4' | 'space-y-6' | 'space-y-8'; // default: 'space-y-6'
}
```

**Example**:

```tsx
import { PageLayout } from '@/shared/components/layout';
import { PlusIcon } from '@heroicons/react/solid';

<PageLayout
  title="Rezervacije"
  description="Upravljajte i pratite sve rezervacije"
  action={
    <Button onClick={() => navigate('/bookings/create')}>
      <PlusIcon className="h-4 w-4 mr-2" />
      Kreiraj Rezervaciju
    </Button>
  }
>
  <div className="space-y-4">
    {/* Filters */}
    <FilterSection />

    {/* Table */}
    <DataTable data={bookings} />
  </div>
</PageLayout>;
```

---

### 3. AuthLayout

**Purpose**: Centered layout for authentication pages (login, register)

**Features**:

- Centered card with max-width
- Custom background support
- Shadow and border styling
- Responsive padding

**Props**:

```typescript
interface AuthLayoutProps {
  children: ReactNode;
  backgroundClass?: string; // default: 'bg-gradient-to-br from-background to-muted'
}
```

**Example** (Login Page):

```tsx
import { AuthLayout } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

function LoginPage() {
  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center">Prijavite se</h1>

        {/* Form */}
        <form className="space-y-4">
          <Input placeholder="Korisničko ime" />
          <Input type="password" placeholder="Lozinka" />
          <Button type="submit" className="w-full">
            Prijavi se
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
```

**Custom Background**:

```tsx
<AuthLayout backgroundClass="bg-gradient-to-r from-blue-500 to-purple-600">
  {children}
</AuthLayout>
```

---

## Common Patterns

### Pattern 1: Standard Dashboard Page

```tsx
import { DashboardLayout, PageLayout } from '@/shared/components/layout';

function CarsPage() {
  return (
    <DashboardLayout>
      <PageLayout
        title="Vozila"
        description="Upravljajte voznim parkom"
        action={<Button>Dodaj Vozilo</Button>}
      >
        <CarsList />
      </PageLayout>
    </DashboardLayout>
  );
}
```

### Pattern 2: Full-Width Dashboard Page

```tsx
<DashboardLayout maxWidth="full">
  <PageLayout title="Analitika">
    <AnalyticsDashboard />
  </PageLayout>
</DashboardLayout>
```

### Pattern 3: Form Page (No PageLayout)

```tsx
import { DashboardLayout } from '@/shared/components/layout';
import { PageHeader } from '@/shared/components/ui/page-header';

function CreateBookingPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Kreiraj Novu Rezervaciju"
        subtitle="Popunite formu"
        onBack={() => navigate(-1)}
      />
      <form className="mt-6 space-y-6">{/* Form fields */}</form>
    </DashboardLayout>
  );
}
```

### Pattern 4: Authentication Page

```tsx
import { AuthLayout } from '@/shared/components/layout';

function RegisterPage() {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center">Registracija</h1>
        <RegisterForm />
      </div>
    </AuthLayout>
  );
}
```

---

## Migration Guide

### Before (Old Pattern):

```tsx
function BookingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rezervacije</h1>
          <p className="text-muted-foreground">Opis</p>
        </div>
        <Button>Akcija</Button>
      </div>

      {/* Content */}
    </div>
  );
}
```

### After (New Pattern):

```tsx
import { DashboardLayout, PageLayout } from '@/shared/components/layout';

function BookingsPage() {
  return (
    <DashboardLayout>
      <PageLayout
        title="Rezervacije"
        description="Opis"
        action={<Button>Akcija</Button>}
      >
        {/* Content */}
      </PageLayout>
    </DashboardLayout>
  );
}
```

**Benefits**:

- ✅ Less code duplication
- ✅ Consistent spacing and styling
- ✅ Easy to modify globally
- ✅ Better maintainability

---

## Best Practices

### ✅ DO:

1. **Use DashboardLayout for all authenticated pages**

   ```tsx
   <DashboardLayout>
     <YourPageContent />
   </DashboardLayout>
   ```

2. **Use PageLayout for consistent headers**

   ```tsx
   <PageLayout title="..." description="..." action={...}>
     <Content />
   </PageLayout>
   ```

3. **Use AuthLayout for login/register pages**

   ```tsx
   <AuthLayout>
     <LoginForm />
   </AuthLayout>
   ```

4. **Customize only when necessary**
   ```tsx
   <DashboardLayout maxWidth="7xl" padding="py-8">
     {/* Wide dashboard with more padding */}
   </DashboardLayout>
   ```

### ❌ DON'T:

1. **Don't duplicate container classes**

   ```tsx
   // ❌ Bad - DashboardLayout already provides container
   <DashboardLayout>
     <div className="container mx-auto py-6">
       {/* ... */}
     </div>
   </DashboardLayout>

   // ✅ Good
   <DashboardLayout>
     {/* ... */}
   </DashboardLayout>
   ```

2. **Don't recreate page headers manually**

   ```tsx
   // ❌ Bad
   <DashboardLayout>
     <div className="flex justify-between">
       <h1>Title</h1>
       <Button>Action</Button>
     </div>
   </DashboardLayout>

   // ✅ Good
   <DashboardLayout>
     <PageLayout title="Title" action={<Button>Action</Button>}>
       {/* ... */}
     </PageLayout>
   </DashboardLayout>
   ```

3. **Don't mix layout styles**

   ```tsx
   // ❌ Bad - inconsistent padding and spacing
   <DashboardLayout padding="py-4">
     <PageLayout spacing="space-y-8">
       {/* Mismatched styles */}
     </PageLayout>
   </DashboardLayout>

   // ✅ Good - use defaults or configure both
   <DashboardLayout>
     <PageLayout>
       {/* Consistent defaults */}
     </PageLayout>
   </DashboardLayout>
   ```

---

## Component Locations

```
src/shared/components/layout/
├── DashboardLayout.tsx   # Authenticated page wrapper
├── AuthLayout.tsx        # Login/register layout
├── PageLayout.tsx        # Page header + content
├── AppSidebar.tsx        # Navigation sidebar
└── index.ts              # Exports
```

---

## Integration with Router

The layouts work seamlessly with React Router:

```tsx
// App.tsx
<main className="flex flex-col flex-1 overflow-y-auto">
  <AppRouter />
</main>;

// Individual pages handle their own layout
function BookingsPage() {
  return (
    <DashboardLayout>
      <PageLayout title="Rezervacije">{/* Content */}</PageLayout>
    </DashboardLayout>
  );
}
```

**Note**: App.tsx no longer needs `<div className="p-4">` wrapper since `DashboardLayout` handles padding.

---

## Examples in Codebase

- **BookingsPage**: Uses `DashboardLayout` + `PageLayout`
- **CreateBookingPage**: Uses `DashboardLayout` + custom `PageHeader`
- **LoginPage-with-layout-example**: Uses `AuthLayout`

---

## Summary

| Layout            | Use Case            | Key Features                     |
| ----------------- | ------------------- | -------------------------------- |
| `DashboardLayout` | Authenticated pages | Container, padding, spacing      |
| `PageLayout`      | Page headers        | Title, description, action       |
| `AuthLayout`      | Login/register      | Centered card, custom background |

**Import**:

```tsx
import {
  DashboardLayout,
  PageLayout,
  AuthLayout,
} from '@/shared/components/layout';
```

**Questions?** Check the component JSDoc comments or refer to the examples above.
