# Shared Table Components System

## Overview
To avoid style interference and maintain consistency across all tables (CarTable, CustomersTable, ContractsTable), we've created a shared component system with standardized UI components.

## Problem Solved
- **Style Conflicts**: Different tables using different hardcoded CSS values
- **Inconsistent Icons**: Mixed icon sizes (some 0.875rem, some 1.25rem, some 2.5rem)
- **Code Duplication**: Similar functionality copied across tables
- **Theme Inconsistency**: Not using the centralized theme system

## New Shared Components

### 1. TableContainer
**Location**: `src/components/UI/Table/TableContainer.tsx`
**Purpose**: Consistent wrapper for all tables with standardized styling

```tsx
import { TableContainer } from '../../../components/UI';

<TableContainer>
  {/* Your table content */}
</TableContainer>
```

### 2. TableActions
**Location**: `src/components/UI/Table/TableActions.tsx`
**Purpose**: Standardized action buttons (Create, Export Excel, Export PDF)

```tsx
import { TableActions } from '../../../components/UI';

<TableActions
  onCreateClick={handleCreate}
  onExportExcel={handleExportExcel}
  onExportPDF={handleExportPDF}
  createLabel="Novi klijent"
  createIcon="user" // 'user' | 'plus' | 'document'
  loading={loading}
/>
```

### 3. SearchFilter
**Location**: `src/components/UI/Table/SearchFilter.tsx`
**Purpose**: Consistent search input with clear functionality

```tsx
import { SearchFilter } from '../../../components/UI';

<SearchFilter
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  placeholder="Pretražite klijente..."
/>
```

### 4. Pagination
**Location**: `src/components/UI/Table/Pagination.tsx`
**Purpose**: Standardized pagination controls

```tsx
import { Pagination } from '../../../components/UI';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

## Standardized Icon Sizes

All icons now use theme variables:
- `--icon-size-xs`: `1rem` (16px) - Small utility icons
- `--icon-size-sm`: `1.25rem` (20px) - Standard UI icons
- `--icon-size-md`: `1.5rem` (24px) - Medium emphasis icons
- `--icon-size-lg`: `1.75rem` (28px) - Large emphasis icons
- `--icon-size-xl`: `2rem` (32px) - Hero/loading icons

## CSS Class Structure

### Shared Classes
- `.table-container` - Main wrapper
- `.table-controls` - Header controls area
- `.data-table` - Main table element
- `.table-header` - Table header
- `.table-heading` - Header cells
- `.table-row` - Table rows
- `.table-cell` - Table cells
- `.action-buttons` - Action button container
- `.action-btn` - Individual action buttons

### Action Button Types
- `.action-btn.view` - View/details button (gray)
- `.action-btn.edit` - Edit button (blue)
- `.action-btn.delete` - Delete button (red)
- `.action-btn.download` - Download button (purple)

## Migration Guide

### Step 1: Import Shared Components
```tsx
import {
  TableContainer,
  TableActions,
  SearchFilter,
  Pagination
} from '../../../components/UI';
```

### Step 2: Replace Custom CSS with Shared Classes
**Before:**
```css
.custom-table-wrapper {
  background-color: white;
  border-radius: 0.5rem;
  /* ... custom styles */
}
```

**After:**
```tsx
<TableContainer>
  {/* Content automatically gets consistent styling */}
</TableContainer>
```

### Step 3: Use Standardized Action Components
**Before:**
```tsx
<button className="create-btn" onClick={handleCreate}>
  <PlusIcon className="btn-icon" />
  Dodaj novi
</button>
```

**After:**
```tsx
<TableActions
  onCreateClick={handleCreate}
  createLabel="Dodaj novi"
  createIcon="plus"
/>
```

### Step 4: Replace Custom Search with SearchFilter
**Before:**
```tsx
<div className="search-container">
  <SearchIcon className="search-icon" />
  <input
    type="text"
    placeholder="Pretražite..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
  />
  {/* Clear button logic */}
</div>
```

**After:**
```tsx
<SearchFilter
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  placeholder="Pretražite..."
/>
```

## Benefits

1. **Consistent Styling**: All tables look identical
2. **Icon Standardization**: No more mixed icon sizes
3. **Theme Integration**: Automatic theme support
4. **Reduced Code**: Less duplication across components
5. **Easy Maintenance**: Change once, update everywhere
6. **Better Performance**: Shared CSS reduces bundle size

## Files Updated

### ✅ Fixed Icon Sizes:
- `CustomersTable.css` - All icons standardized
- `CarTable.css` - All icons standardized
- `ContractsTable.css` - All icons standardized

### ✅ New Shared Components:
- `TableContainer.tsx` + `.css`
- `TableActions.tsx` + `.css`
- `SearchFilter.tsx` + `.css`
- `Pagination.tsx` + `.css`

### ✅ Theme Integration:
- All components now use `var(--icon-size-*)` variables
- Consistent color scheme across all tables
- Proper hover effects and transitions

## Next Steps

1. **Refactor Existing Tables**: Update CarTable, CustomersTable, and ContractsTable to use shared components
2. **Test Consistency**: Verify all tables have identical styling
3. **Remove Duplicate CSS**: Clean up old table-specific styles
4. **Add New Features**: Any new table functionality goes into shared components

This system ensures that all your tables maintain visual consistency and follow the same design patterns! 🎯✨