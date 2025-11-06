src/
├── app/                          # 🆕 App-level configuration
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── routes/
│       ├── index.tsx             # All routes
│       └── ProtectedRoute.tsx
│
├── features/                     # 🆕 Feature modules (domain-driven)
│   ├── auth/
│   │   ├── components/           # Feature-specific components
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/                # Feature-specific hooks
│   │   │   └── useAuth.ts
│   │   ├── pages/                # Feature pages
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/             # Feature API calls
│   │   │   └── authService.ts
│   │   ├── types/                # Feature types
│   │   │   └── auth.types.ts
│   │   └── index.ts              # Public exports
│   │
│   ├── contracts/
│   │   ├── components/
│   │   │   ├── ContractCard.tsx
│   │   │   ├── ContractTable.tsx
│   │   │   ├── ContractFilters.tsx
│   │   │   ├── ContractForm/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── BasicInfo.tsx
│   │   │   │   ├── DateSelection.tsx
│   │   │   │   └── CarSelection.tsx
│   │   │   ├── DateRangeValidator.tsx       # Move from /ui
│   │   │   └── ContractStatusBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useContracts.ts
│   │   │   ├── useContractForm.ts
│   │   │   └── useContractStatus.ts
│   │   ├── pages/
│   │   │   ├── ContractsListPage.tsx        # Renamed from ContractsPage
│   │   │   ├── ContractDetailsPage.tsx
│   │   │   ├── CreateContractPage.tsx
│   │   │   └── EditContractPage.tsx
│   │   ├── services/
│   │   │   └── contractService.ts
│   │   ├── types/
│   │   │   └── contract.types.ts
│   │   ├── utils/
│   │   │   └── contractUtils.ts
│   │   └── index.ts
│   │
│   ├── cars/
│   │   ├── components/
│   │   │   ├── CarCard.tsx
│   │   │   ├── CarTable.tsx
│   │   │   ├── CarFilters.tsx
│   │   │   ├── CarAvailabilitySelect.tsx    # Move from /ui
│   │   │   ├── CarStatusBadge.tsx
│   │   │   └── CarForm/
│   │   ├── hooks/
│   │   │   ├── useCars.ts
│   │   │   └── useCarAvailability.ts
│   │   ├── pages/
│   │   │   ├── CarsListPage.tsx
│   │   │   ├── CarDetailsPage.tsx
│   │   │   ├── CreateCarPage.tsx
│   │   │   ├── EditCarPage.tsx
│   │   │   └── CarAvailabilityPage.tsx
│   │   ├── services/
│   │   │   └── carService.ts
│   │   ├── types/
│   │   │   └── car.types.ts
│   │   └── index.ts
│   │
│   ├── customers/
│   │   ├── components/
│   │   │   ├── CustomerCard.tsx
│   │   │   ├── CustomerTable.tsx
│   │   │   ├── CustomerSearchSelect.tsx     # Move from /ui
│   │   │   └── CustomerForm/
│   │   ├── hooks/
│   │   │   └── useCustomers.ts
│   │   ├── pages/
│   │   │   ├── CustomersListPage.tsx
│   │   │   ├── CustomerDetailsPage.tsx
│   │   │   ├── CreateCustomerPage.tsx
│   │   │   └── EditCustomerPage.tsx
│   │   ├── services/
│   │   │   └── customerService.ts
│   │   ├── types/
│   │   │   └── customer.types.ts
│   │   └── index.ts
│   │
│   ├── notifications/
│   │   ├── components/
│   │   │   ├── NotificationList.tsx
│   │   │   └── NotificationItem.tsx
│   │   ├── hooks/
│   │   │   └── useNotifications.ts
│   │   ├── pages/
│   │   │   └── NotificationsPage.tsx
│   │   ├── services/
│   │   │   └── notificationService.ts
│   │   ├── types/
│   │   │   └── notification.types.ts
│   │   └── index.ts
│   │
│   ├── users/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── userService.ts
│   │   └── types/
│   │       └── user.types.ts
│   │
│   └── dashboard/
│       ├── components/
│       │   ├── StatCard.tsx
│       │   ├── RecentActivity.tsx
│       │   └── Charts/
│       ├── pages/
│       │   └── DashboardPage.tsx
│       └── index.ts
│
├── shared/                       # 🆕 Shared across features
│   ├── components/               # Business-agnostic, reusable
│   │   ├── ui/                   # Base UI primitives (shadcn)
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── layout/               # Layout components
│   │   │   ├── PageHeader.tsx    # Move from /ui
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileHeader.tsx
│   │   │   └── AppShell.tsx
│   │   ├── form/                 # Generic form components
│   │   │   ├── FormSection.tsx   # Move from /ui
│   │   │   ├── FormField.tsx     # Move from /ui
│   │   │   └── PhotoUpload.tsx   # Move from /ui
│   │   ├── feedback/             # User feedback
│   │   │   ├── LoadingState.tsx  # Move from /ui
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── Toast.tsx
│   │   ├── data-display/         # Data presentation
│   │   │   ├── InfoGrid.tsx      # 🆕 To create
│   │   │   ├── InfoItem.tsx      # 🆕 To create
│   │   │   ├── StatusBadge.tsx   # 🆕 To create
│   │   │   └── Avatar.tsx
│   │   └── table/                # Table-related
│   │       ├── SortableHeader.tsx # 🆕 To create
│   │       ├── TableActions.tsx
│   │       └── Pagination.tsx
│   │
│   ├── hooks/                    # Generic hooks
│   │   ├── useFormValidation.ts
│   │   ├── usePhotoUpload.ts
│   │   ├── useMediaQuery.tsx
│   │   ├── useScreenSize.ts
│   │   ├── useDebounce.ts        # 🆕 Recommended
│   │   ├── useLocalStorage.ts    # 🆕 Recommended
│   │   └── usePagination.ts      # 🆕 Recommended
│   │
│   ├── lib/                      # Third-party lib configs
│   │   ├── utils.ts              # cn() helper, etc.
│   │   └── axios.ts              # Axios instance
│   │
│   ├── utils/                    # Pure utility functions
│   │   ├── date.utils.ts
│   │   ├── currency.utils.ts
│   │   ├── string.utils.ts
│   │   └── validation.utils.ts
│   │
│   ├── contexts/                 # Global contexts
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   └── types/                    # Global shared types
│       ├── common.types.ts
│       └── api.types.ts
│
├── config/                       # 🆕 App configuration
│   ├── constants.ts
│   ├── env.ts
│   └── routes.ts
│
└── assets/                       # Static assets
    ├── images/
    ├── icons/
    └── data/
        └── car_brands.json