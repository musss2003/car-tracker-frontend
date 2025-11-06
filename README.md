Here’s a **clean, professional, and fully formatted** version of your `README.md` — ready to copy-paste directly into your repository:

---

````markdown
# 🚗 Car Tracker – Vehicle Rental Management System (Frontend)

A modern, responsive frontend application for managing **car rental contracts**, **customers**, and **vehicles**.  
Built with **React**, **TypeScript**, and **Vite**, and styled using **Chakra UI** and **TailwindCSS**.

> ⚠️ This is the **frontend only**. You’ll need to run the **backend repository** alongside it for full functionality.

---

## 📦 Tech Stack

### 🧩 Core
- ⚛️ **React 18.3** – Modern React with hooks and concurrent features  
- 🟦 **TypeScript 5.x** – Type-safe development  
- ⚡ **Vite 6.3** – Next-generation frontend tooling  
- 🌐 **React Router v6** – Client-side routing with lazy loading  

### 🎨 UI & Styling
- 💅 **TailwindCSS 4.1** – Utility-first CSS framework  
- 🎭 **Chakra UI** – Modern UI components and animations  
- 🧩 **Radix UI** + **shadcn/ui** – Accessible, reusable components  
- 🖼️ **Lucide React** – Modern icon library  

### 📊 Data & State
- 📋 **React Hook Form** + **Yup** – Form management and validation  
- 📡 **Axios** – HTTP client with interceptors  
- 🔐 **JWT Decode** – Token management  

### 📈 Visualization & Documents
- 📊 **Recharts** – Analytics and dashboards  
- 📅 **React Big Calendar** – Contract timeline visualization  
- 📄 **jsPDF**, **jsPDF-AutoTable**, **docx** – PDF & Word document generation  

### 🧪 Development & Testing
- 🧩 **Vitest** – Unit testing  
- 🧪 **@testing-library/react** – Component testing  
- ✨ **ESLint** + **Prettier** – Code linting and formatting  

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/musss2003/car-tracker-frontend.git
cd car-tracker-frontend
````

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5001/api
```

> Change the API URL if your backend runs on a different host or port.

### 4️⃣ Start the development server

```bash
npm run dev
```

The app will be available at: [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
src/
├── assets/            # Images and icons
├── components/        # Shared UI components
├── features/          # Domain-based feature modules
│   ├── auth/          # Authentication
│   ├── contracts/     # Contract management
│   ├── cars/          # Vehicle management
│   ├── customers/     # Customer management
│   ├── notifications/ # Notification system
│   ├── users/         # User management
│   └── dashboard/     # Dashboard & analytics
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── routes/            # App routing
├── services/          # Axios API wrappers
├── types/             # TypeScript types
├── utils/             # Helper utilities
└── App.tsx / main.tsx # Entry points
```

We follow a **feature-first, domain-driven architecture** for scalability and maintainability.

---

## 🧪 Running Tests

We use **Vitest** for unit and integration testing.

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Example:

```
src/features/contracts/
├── components/
│   ├── DateRangeValidator.tsx
│   └── DateRangeValidator.test.tsx ✅
```

---

## 🔗 API Integration

The frontend expects a backend API at `http://localhost:5001/api`.

### Authentication

* `POST /api/auth/login` – User login
* `POST /api/auth/register` – Register new user
* `GET /api/auth/session-check` – Validate session
* `POST /api/auth/logout` – Logout

### Core Resources

* `/api/contracts` – Manage rental contracts
* `/api/cars` – Vehicle management
* `/api/customers` – Customer management
* `/api/users` – User management
* `/api/notifications` – Notification system
* `/api/upload` – File uploads

---

## 📜 Available Scripts

| Command              | Description               |
| -------------------- | ------------------------- |
| `npm run dev`        | Start development server  |
| `npm run build`      | Build production bundle   |
| `npm run preview`    | Preview production build  |
| `npm run test`       | Run all tests             |
| `npm run test:watch` | Run tests in watch mode   |
| `npm run lint`       | Lint code with ESLint     |
| `npm run format`     | Format code with Prettier |

---

## 🎨 Design System

We use **shadcn/ui** components built on **Radix UI**, fully typed with TypeScript and styled with Tailwind.

**Key Components:**

* Form controls (Input, Select, Checkbox)
* Data display (Table, Card, Badge)
* Overlays (Dialog, Alert)
* Feedback (Toast, Loading, Error)
* Layout (Header, Section, Grid)

---

## 🔐 Authentication Flow

1. User logs in → Backend returns JWT + refresh token
2. Tokens stored in localStorage
3. Axios interceptors attach token to each request
4. Protected routes validate authentication state
5. Auto-refresh on token expiration

---

## 📊 Key Features

### 🧾 Contract Management

* Date range validation with conflict detection
* Real-time car availability checking
* Automatic price calculation
* PDF/Word contract generation

### 👥 Customer Management

* Profile management & document uploads
* Contract history per customer
* Search & filtering

### 🚘 Vehicle Fleet

* Manage cars, availability, and maintenance
* Photo gallery per car
* Pricing management

### 📈 Dashboard

* Revenue charts and insights
* Active contracts overview
* Fleet utilization metrics
* Customer analytics

### 🔔 Notifications

* Grouped by date: Today, Yesterday, Older

---

## 🚧 Roadmap

**Phase 1 (✅ Completed):**
Core CRUD, Authentication, Responsive UI, Architecture setup

**Phase 2 (🚧 In Progress):**
Role-based access, Reporting, Email notifications

**Phase 3 (📅 Planned):**
PWA support, Mobile app, Multi-language, Payment integration

---

## 🤝 Contributing

Pull requests are welcome!
For major changes, please open an issue first to discuss your ideas.

**Development Guidelines:**

* Follow existing code style
* Write tests for new features
* Use conventional commits
* Keep PRs focused

---

## 📝 License

Licensed under the **MIT License**.
See the [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 Author

**Mustafa Sinanović**

* GitHub: [@musss2003](https://github.com/musss2003)
* LinkedIn: [Mustafa Sinanović](https://www.linkedin.com/in/mustafa-sinanovic)
* Email: [mustafa.sinanovic@example.com](mailto:mustafa.sinanovic@example.com)

---

## 🙏 Acknowledgments

* [React](https://react.dev)
* [Vite](https://vitejs.dev)
* [shadcn/ui](https://ui.shadcn.com)
* [Radix UI](https://www.radix-ui.com)
* [Tailwind CSS](https://tailwindcss.com)

---

## 📸 Screenshots

| Dashboard                                 | Contracts                                 | Cars                            |
| ----------------------------------------- | ----------------------------------------- | ------------------------------- |
| ![Dashboard](./screenshots/dashboard.png) | ![Contracts](./screenshots/contracts.png) | ![Cars](./screenshots/cars.png) |

---

## 💡 Tips for Development

* Use **strict TypeScript mode** for better type safety
* Components are **lazy-loaded by route**
* Use **React DevTools** for debugging
* Keep interfaces organized under `src/types`
* Use **Vite HMR** for instant updates

---

> Built with ❤️ by **Mustafa Sinanović**

⬆ [Back to top](#-car-tracker--vehicle-rental-management-system-frontend)

```

---

Would you like me to make it **dark-themed (with emojis and badges)** for a more **GitHub-showcase style** version too?
```
