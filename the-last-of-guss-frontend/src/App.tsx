import { useEffect, useState } from "react"
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom"
import "./App.css"
import GamePage from "./pages/GamePage"
import LeaderboardPage from "./pages/LeaderboardPage"
import LoginPage from "./pages/LoginPage"
import { authService } from "./services/api"
import { socketService } from "./services/socket"
import type { User } from "./types"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      authService
        .getProfile()
        .then(userData => {
          setUser(userData)
          socketService.connect(token)
        })
        .catch(() => {
          localStorage.removeItem("token")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (token: string, userData: User) => {
    localStorage.setItem("token", token)
    setUser(userData)
    socketService.connect(token)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    socketService.disconnect()
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/game" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/game"
            element={
              user ? (
                <GamePage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/leaderboard"
            element={
              user ? (
                <LeaderboardPage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/"
            element={<Navigate to={user ? "/game" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
