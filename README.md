# 🎯 The Last of Guss

Welcome to **The Last of Guss** - the ultimate competitive tapping game! This is a real-time multiplayer game where players compete to tap as fast as possible during timed rounds.

## 📋 Project Overview

This project consists of two main parts:

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend**: Vite + React + TypeScript + Socket.IO

## 🚀 Quick Start

### Prerequisites

- Node.js 20.11.1+ (20.19+ recommended)
- npm or yarn
- PostgreSQL database

### 🔧 Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd the-last-of-guss
   ```

2. **Setup Backend**

   ```bash
   cd the-last-of-guss-backend
   npm install

   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database connection details

   # Setup database
   npx prisma migrate dev
   npx prisma generate

   # Start backend server
   npm run start:dev
   ```

3. **Setup Frontend**

   ```bash
   cd ../the-last-of-guss-frontend
   npm install

   # Start frontend development server
   npm run dev
   ```

4. **Access the Game**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🎮 How to Play

1. **Register/Login**: Create an account or log in to existing one
2. **Wait for Round**: Rounds start automatically at scheduled intervals
3. **Tap Fast**: When a round starts, tap the button as fast as you can!
4. **Compete**: See your score and compete on the leaderboard
5. **Special Role**: If you're NIKITA, you get the crown! 👑

## 🏗️ Architecture

### Backend Features

- JWT Authentication
- Real-time WebSocket connections
- Automatic round management
- Leaderboard tracking
- Role-based permissions (USER, ADMIN, NIKITA)

### Frontend Features

- Modern React with TypeScript
- Real-time game updates via Socket.IO
- Responsive design
- Dark theme UI
- Interactive leaderboard

## 🔄 Development Stages

This project follows a structured development plan:

- ✅ **Stage 0**: Project setup and basic structure
- 🚧 **Stage 1**: Authentication system
- 🚧 **Stage 2**: Game mechanics and rounds
- 🚧 **Stage 3**: Real-time communication
- 🚧 **Stage 4**: Admin panel and controls
- 🚧 **Stage 5**: Testing and deployment

## 📱 Tech Stack

### Backend

- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend

- **Vite** - Build tool
- **React 18** - UI library
- **TypeScript** - Type safety
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation
- **Lucide React** - Icons
- **Axios** - HTTP client

## 🎯 Game Rules

- Rounds last for configurable duration (default: 30 seconds)
- Each tap during an active round awards points
- Players can only tap during active rounds
- Leaderboard shows total accumulated scores
- Special recognition for the NIKITA role

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and entertainment purposes.

---

**Ready to become the last of Guss?** 🏆
