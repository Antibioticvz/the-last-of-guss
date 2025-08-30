import React from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import './App.css';
import GamePage from './pages/GamePage';
import LoginPage from './pages/LoginPage';
import RoundsListPage from './pages/RoundsListPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Game Routes */}
          <Route path="/rounds" element={<RoundsListPage />} />
          <Route path="/rounds/:roundId" element={<GamePage />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
