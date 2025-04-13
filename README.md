# 🍽️ Restaurant Admin Web App (Frontend)

This is the frontend interface of the Restaurant Admin System. It is built using React and provides role-based access for staff such as waiters, kitchen personnel, cashiers, and administrators to manage restaurant operations effectively.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Features

### 👨‍🍳 Waiters
- Open tables with guest count and optional comments
- Create **multiple orders per table**
- Add notes per item
- View unavailable or low-stock items instantly (real-time)
- Toast alerts for stock issues
- View daily analytics grouped by table: revenue, tips, comensales
- Select custom date ranges for analytics

### 🧑‍🍳 Kitchen & Bar
- (Planned) Visual dashboard to prepare items
- (Planned) Update item status to "ready"
- (Planned) View performance and item output per area

### 💳 Cashiers
- Access orders ready for payment
- Add tips and split payment across methods
- Validate total amount matches order value before closing

### 🧑‍💼 Administrators
- View business-wide analytics: sales, popular items, tips by waiter
- (Planned) Manage menu items, categories and pricing
- (Planned) Edit user roles and restaurant settings (e.g. low stock threshold)
- (Planned) Role and permission management UI

---

## Technologies Used

- **React** – JavaScript framework
- **Chakra UI** – Component and layout library
- **Axios** – REST API client
- **Day.js** – Date manipulation
- **React Router** – Navigation and routing
- **Jest** – Unit/integration testing
- **ESLint & Prettier** – Code linting and formatting

---

## Installation

```bash
# Clone repository
$ git clone https://github.com/MauLom/restaurant-admin-web.git
$ cd restaurant-admin-web

# Install dependencies
$ npm install
```

---

## Running the Application

```bash
# Start the app
$ npm start
```

It will be available at `http://localhost:3000` by default.

---

## Environment Variables

Create a `.env` file in the root with:

```env
REACT_APP_API_URL=http://localhost:5000/api
JWT_SECRET=your_jwt_secret_here
```

> ⚠️ Replace the example values with your actual configuration. Never commit real secrets or credentials.

---

## Project Structure

```bash
src/
├── features/
│   ├── orders/
│   ├── tables/
│   ├── analytics/
│   ├── inventory/
│   └── admin/ (planned)
├── components/
├── context/
├── services/api.js
├── hooks/
└── App.js
```

---

## API Endpoints

The frontend communicates with the backend API documented in the backend `README.md`. See `/services/api.js` for centralized endpoint management.

---

## License

MIT License. © Your Company or Team Name

