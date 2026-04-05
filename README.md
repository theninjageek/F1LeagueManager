*This app is built with the help of variuos AIs as I'm learning how to use them as I learn to code. I thought it would be fun to learn by building an app to manage my private/casual F1 e-sports league. 

# 🏎️ F1 E-Sports League Manager

A web dashboard for managing and displaying F1 E-Sports league standings, race calendars, and detailed event results.

## 🏁 Features

* **Dynamic Standings:** Real-time calculation of Driver and Constructor championships.
* **Interactive Calendar:** Full season schedule with track silhouettes and automated "Upcoming Race" countdowns.
* **Multi-Session Results:** Support for Practice, Qualifying, Sprint Races, and Grand Prix sessions with automated Grid/Points logic.
* **Admin Paddock:** A suite of tools for Race Control to manage drivers, teams, and session data.
* **Fastest Lap Tracking:** Visual indicators (Purple glow) for the fastest lap holders in race sessions.

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, React Router, TanStack Query.
* **Backend:** Node.js, Express, PostgreSQL.
* **State Management:** React Hooks & Context API.
* **Icons/Assets:** Custom AVIF track silhouettes and F1-style typography.

## 🚀 Getting Started

### 1. Prerequisites
* Node.js (v18+)
* PostgreSQL Database

### 2. Installation
Clone the repository and install dependencies for both the frontend and backend:

The `schema.sql` is the SQL file used to bootstrap the postgres database and seed the teams and AI/real drivers.

Copy the `.env.sample` to `.env` to set database connections.

```bash
# Install Frontend
cd frontend
npm install

# Install Backend
cd backend
npm install


🛡️ License
This project is for private league management. All F1 branding elements are for aesthetic/parody purposes within the E-Sports community.
