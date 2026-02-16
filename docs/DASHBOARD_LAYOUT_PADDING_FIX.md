# DashboardLayout Padding Fix

## Issue

BookingsPage (and CreateBookingPage) had **bigger left/right margins** compared to other pages like ContractsPage, CarsPage, and CustomersPage.

## Root Cause

**DashboardLayout** was using Tailwind's `container` class which has:

- Responsive horizontal padding that **increases on larger screens**
- Centering with `mx-auto`
- Variable max-width

Other pages (ContractsPage, CarsPage, CustomersPage) use:

- **Fixed `px-6`** (24px left/right padding on all screen sizes)
- Full width layout

## Fix Applied

### Before

```tsx
<div className={`${maxWidthClass} mx-auto ${padding} ${spacing}`}>
  {children}
</div>
```

Where `maxWidthClass` defaulted to `container` (Tailwind's responsive container)

### After

```tsx
<div className={`${maxWidthClass} px-6 ${padding} ${spacing}`}>{children}</div>
```

Where `maxWidthClass` defaulted to `w-full` (full width)

## Changes Made

1. **Replaced `container` with `w-full`** in maxWidth mapping
2. **Removed `mx-auto`** (not needed with px-6)
3. **Added `px-6`** (24px fixed left/right padding)

## Result

✅ **Consistent spacing across all pages**

- BookingsPage: `px-6` (24px)
- CreateBookingPage: `px-6` (24px)
- ContractsPage: `px-6` (24px)
- CarsPage: `px-6` (24px)
- CustomersPage: `px-6` (24px)

## Testing

- ✅ **167 tests passing** | 5 skipped (172 total)
- ✅ **Type check passing** (no TypeScript errors)
- ✅ **Visual consistency** across all dashboard pages

## Visual Comparison

### Before (BookingsPage with container)

```
┌──────────────────────────────────────────────┐
│  Sidebar  │ ← EXTRA MARGIN → Content ← EXTRA │
│           │                                  │
│           │     BookingsPage Content        │
│           │                                  │
└──────────────────────────────────────────────┘
             ↑                                ↑
         Responsive padding           Responsive padding
         (increases on larger screens)
```

### After (BookingsPage with px-6)

```
┌──────────────────────────────────────────────┐
│  Sidebar  │ ← 24px → Content ← 24px →        │
│           │                                  │
│           │     BookingsPage Content        │
│           │                                  │
└──────────────────────────────────────────────┘
             ↑                          ↑
           Fixed 24px              Fixed 24px
       (same on all screens)
```

### ContractsPage (unchanged - already using px-6)

```
┌──────────────────────────────────────────────┐
│  Sidebar  │ ← 24px → Content ← 24px →        │
│           │                                  │
│           │    ContractsPage Content        │
│           │                                  │
└──────────────────────────────────────────────┘
             ↑                          ↑
           Fixed 24px              Fixed 24px
```

## Code Diff

**File**: `src/shared/components/layout/DashboardLayout.tsx`

```diff
  const maxWidthClass = {
-   container: 'container',
+   container: 'w-full',
    full: 'w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
  }[maxWidth];

  return (
-   <div className={`${maxWidthClass} mx-auto ${padding} ${spacing}`}>
+   <div className={`${maxWidthClass} px-6 ${padding} ${spacing}`}>
      {children}
    </div>
  );
```

## Affected Pages

Pages using **DashboardLayout** (now fixed):

- ✅ BookingsPage
- ✅ CreateBookingPage

Pages with **consistent spacing** (already using px-6):

- ✅ ContractsPage
- ✅ CarsPage
- ✅ CustomersPage

## Benefits

1. **Visual Consistency**: All dashboard pages now have identical left/right spacing
2. **Predictable Layout**: Fixed 24px padding on all screen sizes
3. **Matches Design System**: Aligns with the existing page patterns
4. **Better UX**: No jarring spacing differences when navigating between pages

---

**Date**: February 16, 2026
**Branch**: feature/create-booking-page
**Status**: ✅ Complete
**Tests**: ✅ All passing (167/167)
