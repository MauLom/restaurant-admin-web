# 🍽️ Restaurant Admin Web App

This is the frontend interface of the Restaurant Admin System. It is built using React and provides role-based access for staff such as waiters, kitchen personnel, cashiers, and administrators to manage restaurant operations effectively.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Features

### 👨‍🍳 Waiters
- Open tables with guest count and optional comments.
- Create **multiple orders** for the same table.
- Add item notes and manage item quantities dynamically.
- See product availability and **stock warnings** instantly.
- Get toast alerts when adding over stock limits.
- View **daily analytics** by table: revenue, tips, and order count.
- Select historical dates for performance tracking.

### 🧑‍🍳 Kitchen & Bar
- (Planned) Visual interface to view and update item prep status.

### 💳 Cashiers
- See all pending orders for payment per table.
- Input **multiple payment methods** (e.g., cash + card).
- Add tips and finalize payments with clear validation.

### 🧑‍💼 Administrators
- Visualize analytics (sales, top items, tips per waiter).
- (Planned) Manage menu items, categories, and prices.
- (Planned) Manage users, roles, and system settings.
- Configure operational thresholds like low stock alerts.

## Technologies Used

- **React** – SPA framework for building the interface
- **Chakra UI** – Modular and accessible component library
- **Axios** – HTTP client for REST API interaction
- **React Router** – Navigation and route handling
- **Redux** – (Optional) For complex state management (in progress)
- **Day.js** – For date handling
- **Jest** – Unit/integration testing
- **ESLint & Prettier** – Code quality tools

## Project Highlights

- Feature-based architecture (`features/orders`, `features/inventory`, etc.)
- Centralized API handler (`/services/api.js`)
- Toasts for user feedback and inventory warnings
- Context support (`UserContext`, `LanguageContext`)
- Responsive design for tablets and point-of-sale stations
