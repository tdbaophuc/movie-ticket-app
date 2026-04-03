# 🎬 Movie Ticket App

A comprehensive full-stack solution for managing and booking movie tickets. This repository contains the mobile application for users, a web-based dashboard for administrators, and the backend API that powers both.

## 📦 Project Structure

This is a monorepo consisting of three main components:

- **`dnc-cinemas`**: The mobile application for end-users to browse movies, book tickets, and manage their reservations. Built with React Native and Expo.
- **`dnc-admin-dashboard`**: The web dashboard for cinema administrators to manage movies, schedules, bookings, and view statistics. Built with Next.js and Material UI.
- **`movie-ticket-app-backend`**: The RESTful API backend handling data storage, authentication, booking logic, and third-party integrations (email, PDF ticket generation). Built with Node.js, Express, and MongoDB.

## 🚀 Features

### Mobile App (dnc-cinemas)
- Browse currently showing and upcoming movies.
- View movie details, trailers, and reviews.
- Real-time seat selection and booking process.
- User authentication and profile management.
- View booking history and electronic tickets with QR codes.

### Admin Dashboard (dnc-admin-dashboard)
- **Analytics Dashboard**: Overview of cinema statistics and revenue charts.
- **Movie Management**: Add, update, or remove movies.
- **Schedule Management**: Manage movie showtimes across different theaters/rooms.
- **Booking Management**: View and verify customer bookings.
- **User Management**: Manage user accounts and roles.

### Backend API (movie-ticket-app-backend)
- RESTful API architecture.
- Secure authentication using JWT and password hashing (bcryptjs).
- Automated email dispatch for bookings and notifications (Nodemailer).
- PDF receipt generation (PDFKit) and QR Code integration.
- Automated background jobs (node-cron) context like booking cleanup.

## 🛠 Tech Stack

**Frontend (Mobile App)**
- React Native / Expo
- React Navigation
- NativeWind (Tailwind CSS for React Native)
- Axios for API requests

**Frontend (Admin Web)**
- Next.js (React Framework)
- Material UI (MUI) for component design
- Chart.js & React-Chartjs-2 for data visualization
- Axios

**Backend & Database**
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas cluster)
- [Expo Go](https://expo.dev/client) app installed on your iOS or Android device

## 💻 Installation & Local Setup

Clone the repository to your local machine:
```bash
git clone https://github.com/yourusername/movie-ticket-app.git
cd movie-ticket-app
```

### 1. Backend Setup

```bash
cd movie-ticket-app-backend
npm install
```
* **Environment Variables**: Create a `.env` file in the `movie-ticket-app-backend` directory and add your necessary environment variables:
  ```env
  PORT=8080
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  EMAIL_USER=your_email_address
  EMAIL_PASS=your_email_password
  ```
* **Run the server**:
  ```bash
  npm run dev
  ```
  The server will start on `http://localhost:8080` (or your defined port).

### 2. Admin Dashboard Setup

```bash
cd ../dnc-admin-dashboard
npm install
```
* **Run the dashboard**:
  ```bash
  npm run dev
  ```
  The dashboard will be available at `http://localhost:3000`.

### 3. Mobile App Setup

```bash
cd ../dnc-cinemas
npm install
```
* **Configuration**: Ensure the API base URL in the mobile app points to your local backend server's IP address (not `localhost`, but your network IP like `http://192.168.1.x:8080`).
* **Run Expo**:
  ```bash
  npm start
  ```
* Scan the generated QR code with the Expo Go app on your physical device or run it on an emulator.

## 📄 License
This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
