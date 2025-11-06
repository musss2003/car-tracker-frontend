# 🚗 Car Tracker - Vehicle Rental Management System# 🚗 Car Tracker Frontend



[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://reactjs.org/)A modern, responsive frontend application for managing car rental contracts, customers, and vehicles. Built with **React**, **TypeScript**, and **Vite**, and styled using **Chakra UI** and **TailwindCSS**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

[![Vite](https://img.shields.io/badge/Vite-6.3-purple?logo=vite)](https://vitejs.dev/)> This is the **frontend only**. You’ll need to run the [backend repository](#musss2003/car-tracker-backend) alongside it for full functionality.

[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)---



A modern, enterprise-grade **car rental management system** with comprehensive features for managing vehicles, customers, contracts, and rental operations. Built with cutting-edge technologies and best practices.## 📦 Tech Stack



> 🔗 **Full Stack Application**: This is the frontend. Pair it with the [Car Tracker Backend](https://github.com/musss2003/car-tracker-backend) for complete functionality.- ⚛️ **React** with TypeScript

- ⚡ **Vite** (for fast builds and dev experience)

---- 🎨 **Chakra UI** (UI and animation)

- 🌐 **Axios** (HTTP client)

## ✨ Features- ⚙️ **React Router v6**

- 📅 **React Big Calendar**

### 🎯 Core Functionality- 📊 **Recharts**

- 🔐 **Secure Authentication** - JWT-based auth with session management- 🔐 **JWT Authentication** (via custom backend)

- 📋 **Contract Management** - Create, edit, and track rental contracts with conflict detection- ✅ **React Hook Form** + **Yup** for validation

- 👥 **Customer Management** - Complete customer profiles with document uploads- 🔬 **Vitest** & **@testing-library/react** for testing

- 🚘 **Vehicle Fleet Management** - Track cars, availability, and maintenance

- 📊 **Dashboard Analytics** - Real-time insights with charts and statistics---

- 🔔 **Smart Notifications** - Grouped by time (Today, Yesterday, Older)

- 📄 **Document Generation** - Export contracts as PDF with jsPDF## 🚀 Getting Started

- 📅 **Calendar View** - Visual contract timeline with React Big Calendar

- 🔍 **Advanced Search & Filtering** - Multi-criteria search across all modules### 1. Clone the repository

- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS

```bash

### 🎨 UI/UX Excellencegit clone https://github.com/your-username/car-tracker-frontend.git

- ⚡ **Lightning Fast** - Optimized with Vite and lazy loadingcd car-tracker-frontend

- 🎭 **Modern Components** - Built with Radix UI and shadcn/ui design system2. Install dependencies

- 🌗 **Theme Support** - Light/dark mode with theme managerbash

- ♿ **Accessible** - WCAG compliant componentsCopy

- 📐 **Consistent Design** - Reusable component libraryEdit

npm install

---3. Configure environment variables

Create a .env file in the root directory and add the following:

## 🛠️ Tech Stack

env

### Frontend CoreCopy

- **React 18.3** - Modern React with hooks and concurrent featuresEdit

- **TypeScript 5.x** - Type-safe developmentVITE_API_URL=http://localhost:5001/api

- **Vite 6.3** - Next-generation frontend toolingChange the URL to your backend’s actual API if needed.

- **React Router v6** - Client-side routing with lazy loading

4. Run the development server

### UI & Stylingbash

- **TailwindCSS 4.1** - Utility-first CSS frameworkCopy

- **Radix UI** - Unstyled, accessible component primitivesEdit

- **shadcn/ui** - Beautiful, reusable componentsnpm run dev

- **Lucide React** - Modern icon libraryThis will start the app at: http://localhost:5173

- **Headless UI** - Unstyled UI components

📁 Project Structure

### State & Data Managementbash

- **React Hook Form** - Performant form managementCopy

- **Yup** - Schema validationEdit

- **Axios** - HTTP client with interceptors├── public/

- **JWT Decode** - Token management├── src/

│   ├── assets/            # Images and icons

### Data Visualization & Documents│   ├── components/        # Reusable UI components

- **Recharts** - Chart library for analytics│   ├── features/          # Feature-specific modules (e.g. contracts, customers)

- **React Big Calendar** - Event calendar│   ├── hooks/             # Custom React hooks

- **jsPDF** - PDF generation│   ├── pages/             # Page views

- **jsPDF AutoTable** - Table generation for PDFs│   ├── routes/            # Route configuration

- **docx** - Word document generation│   ├── services/          # Axios API wrappers

│   ├── types/             # TypeScript types

### Development & Testing│   ├── utils/             # Utility functions

- **Vitest** - Unit test framework│   ├── App.tsx            # App entry point

- **@testing-library/react** - Component testing│   └── main.tsx           # Vite entry

- **ESLint** - Code linting├── .env

- **Prettier** - Code formatting├── package.json

└── README.md

---🧪 Running Tests

We use Vitest for unit and integration testing.

## 📁 Project Architecture

bash

We follow a **feature-first, domain-driven architecture** for maximum scalability and maintainability:Copy

Edit

```# Run all tests

src/npm run test

├── app/                    # Application core

│   ├── App.tsx            # Root component# Watch mode

│   ├── main.tsx           # Entry pointnpm run test:watch

│   └── routes/            # Route configuration📚 Key Features

│       ├── AppRoutes.tsx🔐 Login/Logout with session-checking

│       └── ProtectedRoute.tsx

│📄 Create, edit, and manage rental contracts

├── features/              # Feature modules (domain-driven)

│   ├── auth/             # Authentication👤 View and edit customer profiles

│   ├── contracts/        # Contract management

│   ├── cars/             # Vehicle management🚘 Manage car details and availability

│   ├── customers/        # Customer management

│   ├── notifications/    # Notification system🧾 Generate contract PDFs (docx and PDF)

│   ├── users/            # User management

│   └── dashboard/        # Dashboard & analytics📊 Dashboard with charts and summaries

│

├── shared/               # Shared resources🔔 Notifications grouped by date (Today, Yesterday, etc.)

│   ├── components/       # Reusable UI components

│   │   ├── ui/          # Base primitives (buttons, inputs, etc.)🔍 Search, filter, and sort functionality on tables

│   │   ├── form/        # Form components

│   │   ├── layout/      # Layout components☁️ File upload (e.g., customer documents, contract photos)

│   │   ├── feedback/    # Loading, errors, toasts

│   │   └── data-display/ # Tables, cards, badges📦 Available Scripts

│   ├── hooks/           # Custom React hooksCommand	Description

│   ├── utils/           # Utility functionsnpm run dev	Start the development server

│   ├── lib/             # Third-party configurationsnpm run build	Build the app for production

│   └── types/           # Global TypeScript typesnpm run preview	Preview the production build

│npm run test	Run all tests using Vitest

├── assets/              # Static assetsnpm run test:watch	Run tests in watch mode

├── config/              # App configuration

└── styles/              # Global styles🔧 Backend API

```The frontend expects an API running on http://localhost:5001/api. You can configure this via .env.



### Feature Module StructureBackend endpoints expected:



Each feature follows a consistent structure:/auth/login



```/auth/session-check

features/[feature-name]/

├── components/          # Feature-specific components/customers

├── hooks/              # Feature-specific hooks

├── pages/              # Feature pages/contracts

├── services/           # API calls

├── types/              # TypeScript types/cars

├── utils/              # Feature utilities

└── index.ts            # Public API exports/notifications

```

/upload

---

Please refer to the backend repository for details and setup.

## 🚀 Getting Started

✅ To-Do / Improvements

### Prerequisites Add role-based access (admin vs user)



- **Node.js** 18+ and npm/yarn Dark mode toggle

- **Backend API** running (see [backend repo](https://github.com/musss2003/car-tracker-backend))

 Offline support (PWA)

### Installation

 Integration with cloud storage (e.g., S3)

1. **Clone the repository**

```bash Unit tests for more components

git clone https://github.com/musss2003/car-tracker-frontend.git

cd car-tracker-frontend🤝 Contributing

```Pull requests are welcome. For major changes, open an issue first to discuss what you’d like to change.



2. **Install dependencies**📄 License

```bashMIT

npm install

```👨‍💻 Author

Mustafa Sinanović

3. **Configure environment**GitHub: @musss2003



Create a `.env` file in the root:```


```env
VITE_API_URL=http://localhost:5001/api
```

4. **Start development server**
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
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint code with ESLint |
| `npm run format` | Format code with Prettier |

---

## 🧪 Testing

We use **Vitest** and **React Testing Library** for comprehensive testing:

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
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
- Email: mustafa.sinanovic@example.com

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The UI library
- [Vite](https://vitejs.dev/) - Build tool
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Primitive components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Contract Management
![Contracts](docs/screenshots/contracts.png)

### Vehicle Fleet
![Cars](docs/screenshots/cars.png)

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

[⬆ back to top](#-car-tracker---vehicle-rental-management-system)

</div>
