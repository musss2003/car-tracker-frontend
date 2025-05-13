# 🚗 Car Tracker Frontend

A modern, responsive frontend application for managing car rental contracts, customers, and vehicles. Built with **React**, **TypeScript**, and **Vite**, and styled using **Chakra UI** and **TailwindCSS**.

> This is the **frontend only**. You’ll need to run the [backend repository](#backend-api) alongside it for full functionality.

---

## 📦 Tech Stack

- ⚛️ **React** with TypeScript
- ⚡ **Vite** (for fast builds and dev experience)
- 🎨 **Chakra UI** (UI and animation)
- 🌐 **Axios** (HTTP client)
- ⚙️ **React Router v6**
- 📅 **React Big Calendar**
- 📊 **Recharts**
- 🔐 **JWT Authentication** (via custom backend)
- ✅ **React Hook Form** + **Yup** for validation
- 🔬 **Vitest** & **@testing-library/react** for testing

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/car-tracker-frontend.git
cd car-tracker-frontend
2. Install dependencies
bash
Copy
Edit
npm install
3. Configure environment variables
Create a .env file in the root directory and add the following:

env
Copy
Edit
VITE_API_URL=http://localhost:5001/api
Change the URL to your backend’s actual API if needed.

4. Run the development server
bash
Copy
Edit
npm run dev
This will start the app at: http://localhost:5173

📁 Project Structure
bash
Copy
Edit
├── public/
├── src/
│   ├── assets/            # Images and icons
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-specific modules (e.g. contracts, customers)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page views
│   ├── routes/            # Route configuration
│   ├── services/          # Axios API wrappers
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── App.tsx            # App entry point
│   └── main.tsx           # Vite entry
├── .env
├── package.json
└── README.md
🧪 Running Tests
We use Vitest for unit and integration testing.

bash
Copy
Edit
# Run all tests
npm run test

# Watch mode
npm run test:watch
📚 Key Features
🔐 Login/Logout with session-checking

📄 Create, edit, and manage rental contracts

👤 View and edit customer profiles

🚘 Manage car details and availability

🧾 Generate contract PDFs (docx and PDF)

📊 Dashboard with charts and summaries

🔔 Notifications grouped by date (Today, Yesterday, etc.)

🔍 Search, filter, and sort functionality on tables

☁️ File upload (e.g., customer documents, contract photos)

📦 Available Scripts
Command	Description
npm run dev	Start the development server
npm run build	Build the app for production
npm run preview	Preview the production build
npm run test	Run all tests using Vitest
npm run test:watch	Run tests in watch mode

🔧 Backend API
The frontend expects an API running on http://localhost:5001/api. You can configure this via .env.

Backend endpoints expected:

/auth/login

/auth/session-check

/customers

/contracts

/cars

/notifications

/upload

Please refer to the backend repository for details and setup.

✅ To-Do / Improvements
 Add role-based access (admin vs user)

 Dark mode toggle

 Offline support (PWA)

 Integration with cloud storage (e.g., S3)

 Unit tests for more components

🤝 Contributing
Pull requests are welcome. For major changes, open an issue first to discuss what you’d like to change.

📄 License
MIT

👨‍💻 Author
Mustafa Sinanović
GitHub: @mustafa-s-2003

