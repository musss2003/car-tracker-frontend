# 🚗 Car Tracker – Vehicle Rental Management System# 🚗 Car Tracker – Vehicle Rental Management System (Frontend)



[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://reactjs.org/)
A modern, responsive frontend application for managing **car rental contracts**, **customers**, and **vehicles**.  

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

Built with **React**, **TypeScript**, and **Vite**, and styled using **Chakra UI** and **TailwindCSS**.

[![Vite](https://img.shields.io/badge/Vite-6.3-purple?logo=vite)](https://vitejs.dev/)

[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)> 
⚠️ This is the **frontend only**. You’ll need to run the **backend repository** alongside it for full functionality.



A modern, responsive **car rental management system** for managing contracts, customers, and vehicle fleets. Built with cutting-edge technologies and best practices for scalability and maintainability.---



> 🔗 **Full Stack Application**: This is the frontend. Pair it with the [Car Tracker Backend](https://github.com/musss2003/car-tracker-backend) for complete functionality.## 📦 Tech Stack



### 🧩 Core

- ⚛️ **React 18.3** – Modern React with hooks and concurrent features  

## ✨ Features- 🟦 **TypeScript 5.x** – Type-safe development  

- ⚡ **Vite 6.3** – Next-generation frontend tooling  

### 🎯 Core Functionality- 🌐 **React Router v6** – Client-side routing with lazy loading  



- 🔐 **Secure Authentication** - JWT-based auth with session management### 🎨 UI & Styling

- 📋 **Contract Management** - Create, edit, and track rental contracts with conflict detection- 💅 **TailwindCSS 4.1** – Utility-first CSS framework  

- 👥 **Customer Management** - Complete customer profiles with document uploads- 🎭 **Chakra UI** – Modern UI components and animations  

- 🚘 **Vehicle Fleet Management** - Track cars, availability, and maintenance- 🧩 **Radix UI** + **shadcn/ui** – Accessible, reusable components  

- 📊 **Dashboard Analytics** - Real-time insights with charts and statistics- 🖼️ **Lucide React** – Modern icon library  

- 🔔 **Smart Notifications** - Grouped by time (Today, Yesterday, Older)

- 📄 **Document Generation** - Export contracts as PDF with jsPDF### 📊 Data & State

- 📅 **Calendar View** - Visual contract timeline with React Big Calendar- 📋 **React Hook Form** + **Yup** – Form management and validation  

- 🔍 **Advanced Search & Filtering** - Multi-criteria search across all modules- 📡 **Axios** – HTTP client with interceptors  

- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS- 🔐 **JWT Decode** – Token management  



### 🎨 UI/UX Excellence### 📈 Visualization & Documents

- 📊 **Recharts** – Analytics and dashboards  

- ⚡ **Lightning Fast** - Optimized with Vite and lazy loading- 📅 **React Big Calendar** – Contract timeline visualization  

- 🎭 **Modern Components** - Built with Radix UI and shadcn/ui design system- 📄 **jsPDF**, **jsPDF-AutoTable**, **docx** – PDF & Word document generation  

- 🌗 **Theme Support** - Light/dark mode with theme manager

- ♿ **Accessible** - WCAG compliant components### 🧪 Development & Testing

- 📐 **Consistent Design** - Reusable component library- 🧩 **Vitest** – Unit testing  

- 🧪 **@testing-library/react** – Component testing  

- ✨ **ESLint** + **Prettier** – Code linting and formatting  



## 🛠️ Tech Stack



### Frontend Core## 🚀 Getting Started



- **React 18.3** - Modern React with hooks and concurrent features### 1️⃣ Clone the repository

- **TypeScript 5.x** - Type-safe development```bash

- **Vite 6.3** - Next-generation frontend toolinggit clone https://github.com/musss2003/car-tracker-frontend.git

- **React Router v6** - Client-side routing with lazy loadingcd car-tracker-frontend


### UI & Styling

- **TailwindCSS 4.1** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component primitives
- **shadcn/ui** - Beautiful, reusable components
- **Lucide React** - Modern icon library
- **Headless UI** - Unstyled UI components

### State & Data Management

- **React Hook Form** - Performant form management
- **Yup** - Schema validation
- **Axios** - HTTP client with interceptors
- **JWT Decode** - Token management

### Data Visualization & Documents

- **Recharts** - Chart library for analytics
- **React Big Calendar** - Event calendar
- **jsPDF** - PDF generation
- **jsPDF AutoTable** - Table generation for PDFs
- **docx** - Word document generation

### Development & Testing

- **Vitest** - Unit test framework
- **@testing-library/react** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 📁 Project Architecture

We follow a **feature-first, domain-driven architecture** for maximum scalability and maintainability:

```
src/
├── app/                    # Application core
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── routes/            # Route configuration
│       ├── AppRoutes.tsx
│       └── ProtectedRoute.tsx
│
├── features/              # Feature modules (domain-driven)
│   ├── auth/             # Authentication
│   ├── contracts/        # Contract management
│   ├── cars/             # Vehicle management
│   ├── customers/        # Customer management
│   ├── notifications/    # Notification system
│   ├── users/            # User management
│   └── dashboard/        # Dashboard & analytics
│
├── shared/               # Shared resources
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base primitives (buttons, inputs, etc.)
│   │   ├── form/        # Form components
│   │   ├── layout/      # Layout components
│   │   ├── feedback/    # Loading, errors, toasts
│   │   └── data-display/ # Tables, cards, badges
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── lib/             # Third-party configurations
│   └── types/           # Global TypeScript types
│
├── assets/              # Static assets
├── config/              # App configuration
└── styles/              # Global styles
```

### Feature Module Structure

Each feature follows a consistent structure:

```
features/[feature-name]/
├── components/          # Feature-specific components
├── hooks/              # Feature-specific hooks
├── pages/              # Feature pages
├── services/           # API calls
├── types/              # TypeScript types
├── utils/              # Feature utilities
└── index.ts            # Public API exports
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Backend API** running (see [backend repo](https://github.com/musss2003/car-tracker-backend))

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/musss2003/car-tracker-frontend.git
cd car-tracker-frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment**

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5001/api
```

**4. Start development server**

```bash
npm run dev
```

The app will open at **http://localhost:5173**

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run test suite with Vitest |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run prettier:check` | Check code formatting |
| `npm run prettier:write` | Format code with Prettier |

---

## 🧪 Testing

We use **Vitest** and **React Testing Library** for comprehensive testing:

```bash
# Run all tests
npm run test

# Coverage report
npm run test:coverage

# Check formatting
npm run prettier:check
```

### Test Structure

Tests are co-located with their components:

```
src/features/contracts/
├── components/
│   ├── DateRangeValidator.tsx
│   └── DateRangeValidator.test.tsx    ✅
```

---

## 🔗 API Integration

The frontend expects the following API endpoints from the backend:

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/session-check` - Validate session
- `POST /api/auth/logout` - User logout

### Resources

- `/api/contracts` - Contract CRUD operations
- `/api/cars` - Vehicle management
- `/api/customers` - Customer management
- `/api/users` - User management
- `/api/notifications` - Notification system
- `/api/upload` - File upload handling

Refer to the [API Documentation](https://github.com/musss2003/car-tracker-backend) for detailed endpoint specs.

---

## 🎨 Design System

### Component Library

We use **shadcn/ui** components built on top of **Radix UI**:

- ✅ Fully typed with TypeScript
- ♿ Accessible by default (ARIA)
- 🎨 Customizable with Tailwind
- 📦 Tree-shakeable

### Key Components

- Form controls (Input, Select, Checkbox, etc.)
- Data display (Table, Card, Badge, Avatar)
- Overlays (Dialog, Alert, Dropdown)
- Feedback (Toast, Loading, Error states)
- Layout (Page Header, Form Section, Info Grid)

---

## 🔐 Authentication Flow

1. User logs in with credentials
2. Backend returns JWT access token + refresh token
3. Tokens stored in localStorage
4. Axios interceptor attaches token to requests
5. Protected routes check authentication state
6. Auto-refresh on token expiration
7. Session validation on app load

---

## 📊 Key Features Deep Dive

### Contract Management

- ✅ Date range validation with conflict detection
- ✅ Real-time car availability checking
- ✅ Automatic price calculation
- ✅ Photo uploads for contracts
- ✅ PDF contract generation
- ✅ Contract status tracking

### Customer Management

- ✅ Complete customer profiles
- ✅ Document uploads (ID, driver's license)
- ✅ Contract history per customer
- ✅ Search and filter customers
- ✅ Customer photo management

### Vehicle Fleet

- ✅ Car details and specifications
- ✅ Real-time availability calendar
- ✅ Maintenance tracking
- ✅ Photo gallery per vehicle
- ✅ Pricing management

### Dashboard

- 📊 Revenue charts (daily, monthly, yearly)
- 📈 Active contracts overview
- 🚗 Fleet utilization metrics
- 👥 Customer growth analytics
- 🔔 Recent activity feed

---

## 🚧 Roadmap

### Phase 1 (Current)

- ✅ Core CRUD operations
- ✅ Authentication & authorization
- ✅ Responsive design
- ✅ Feature-first architecture

### Phase 2 (In Progress)

- 🔲 Role-based access control (Admin, Manager, User)
- 🔲 Advanced reporting & analytics
- 🔲 Email notifications
- 🔲 Contract templates

### Phase 3 (Planned)

- 🔲 Mobile app (React Native)
- 🔲 PWA support (offline mode)
- 🔲 Multi-language support (i18n)
- 🔲 Payment integration
- 🔲 SMS notifications
- 🔲 Advanced search with filters

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Keep PRs focused and small

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Mustafa Sinanović**

- GitHub: [@musss2003](https://github.com/musss2003)
- LinkedIn: [Mustafa Sinanović](https://www.linkedin.com/in/mustafa-sinanovic)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The UI library
- [Vite](https://vitejs.dev/) - Build tool
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Primitive components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

## 💡 Tips for Development

### Hot Module Replacement (HMR)

Vite provides instant HMR - changes reflect immediately without full page reload.

### TypeScript Tips

- Use strict mode for better type safety
- Define interfaces in feature `/types` folders
- Export types through feature `index.ts`

### Performance Optimization

- Components are lazy-loaded by route
- Images optimized with Vite
- Code splitting by feature
- Memoization where needed

### Debugging

```bash
# Open React DevTools
# Available in Chrome/Firefox

# Check network requests
# Use browser DevTools Network tab

# Inspect component tree
# Use React DevTools Component tab
```

---

<div align="center">

**Built with ❤️ by Mustafa Sinanović**

[⬆ back to top](#-car-tracker--vehicle-rental-management-system)

</div>
