# Library Management System — Web Application Development (BIWA2110)

A full-stack library inventory and borrowing system built with React, React Router, Express, and MySQL.

## Features

- Dashboard with book totals, available copies, registered members, recent transactions, and low-stock warnings (fewer than 2 copies).
- Book management: create, list, edit, and delete books.
- Stock transactions: receive stock or borrow copies; stock is checked before borrowing; transaction history is recorded.
- User management: login, list users, create users, edit users, and delete users (admin only).
- React hooks, reusable components, controlled forms, form validation, Fetch API, and REST endpoints.
- Responsive layout for desktop and mobile.

## Requirements

- Node.js 18 or later
- MySQL 8 or compatible MySQL server
- npm

## 1. Create the database

Open MySQL Workbench or a MySQL terminal and run the SQL in `backend/database/schema.sql`.

This creates the `library_management` database and its tables.

## 2. Configure and run the backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update the MySQL credentials and JWT secret:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=library_management
JWT_SECRET=replace_this_with_a_long_random_secret
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

### Demo administrator

The SQL inserts a demonstration administrator:

- Membership ID: `ADMIN001`
- Password: `Admin123!`

Change this password after your first login. The demo account is for local coursework testing only.

## 3. Configure and run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite (normally `http://localhost:5173`).

The frontend sends API requests to `http://localhost:5000/api`. To change this, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/books` | List books |
| POST | `/api/books` | Add a book |
| PUT | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |
| GET | `/api/transactions` | Transaction history |
| POST | `/api/transactions` | Add stock or record a borrowing |
| GET | `/api/users` | List users (admin) |
| POST | `/api/users` | Create user (admin) |
| PUT | `/api/users/:id` | Update user (admin) |
| DELETE | `/api/users/:id` | Delete user (admin) |
| POST | `/api/auth/login` | Log in |

## Project structure

```text
library-management-system/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── main.jsx
│   └── package.json
└── backend/                  # Express REST API
    ├── database/schema.sql
    ├── middleware/
    ├── routes/
    ├── .env.example
    └── server.js
```

## Important coursework note

Before submission, run the application yourself, test each feature, replace the institution/student details if you add a report or screenshots, and make sure you understand the code. The assignment marking guide allocates marks to the student's own work. Do not claim that you personally implemented or tested features you have not checked.

## Suggested test sequence

1. Log in with the demo administrator.
2. Add a book with an initial quantity.
3. Edit its title or quantity details.
4. Receive stock for that book.
5. Borrow one copy and verify that available stock decreases.
6. Try borrowing more copies than are available; the API should reject it.
7. Create a member account from User Management.
8. Log out and log in using that member's membership ID and password.
9. Confirm that a member cannot access admin-only user management.
10. Test the layout at a narrow mobile width.
