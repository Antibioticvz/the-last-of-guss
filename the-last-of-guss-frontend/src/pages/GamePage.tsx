import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { User, GameState, Round } from '../types';
import { gameService } from '../services/api';
import { socketService } from '../services/socket';
import { Trophy, LogOut, Target, Timer } from 'lucide-react';

interface GamePageProps {
  user: User;
  onLogout: () => void;
}

const GamePage: React.FC<GamePageProps> = ({ user, onLogout }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: null,
    timeLeft: 0,
    canTap: false,
    userScore: 0,
    leaderboard: []
  });
  const [tapCount, setTapCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadGameState = useCallback(async () => {
    try {
      const state = await gameService.getGameState();
      setGameState(state);
    } catch (error) {
      console.error('Failed to load game state:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGameState();

    // Setup socket listeners
    socketService.onRoundStart((round: Round) => {
      setGameState(prev => ({ ...prev, currentRound: round, canTap: true }));
      setTapCount(0);
    });

    socketService.onRoundEnd(() => {
      setGameState(prev => ({ ...prev, currentRound: null, canTap: false, timeLeft: 0 }));
    });

    socketService.onGameStateUpdate((state: GameState) => {
      setGameState(state);
    });

    socketService.onLeaderboardUpdate((leaderboard) => {
      setGameState(prev => ({ ...prev, leaderboard }));
    });

    return () => {
      socketService.off('roundStart');
      socketService.off('roundEnd');
      socketService.off('gameStateUpdate');
      socketService.off('leaderboardUpdate');
    };
  }, [loadGameState]);

  const handleTap = async () => {
    if (!gameState.canTap || !gameState.currentRound) return;

    try {
      const result = await gameService.tap(gameState.currentRound.id);
      setTapCount(prev => prev + 1);
      setGameState(prev => ({ ...prev, userScore: prev.userScore + result.score }));
    } catch (error) {
      console.error('Tap failed:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="game-page loading">
        <div className="loading-spinner">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="user-info">
          <h2>🎯 The Last of Guss</h2>
          <span className="username">{user.username}</span>
          {user.role === 'NIKITA' && <span className="nikita-badge">👑 NIKITA</span>}
        </div>
        <nav className="game-nav">
          <Link to="/leaderboard" className="nav-link">
            <Trophy size={16} />
            Leaderboard
          </Link>
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={16} />
            Logout
          </button>
        </nav>
      </header>

      <main className="game-main">
        <div className="game-status">
          {gameState.currentRound ? (
            <div className="round-active">
              <div className="timer">
                <Timer size={20} />
                <span>{formatTime(gameState.timeLeft)}</span>
              </div>
              <div className="round-info">
                <h3>Round Active!</h3>
                <p>Tap as fast as you can!</p>
              </div>
            </div>
          ) : (
            <div className="round-waiting">
              <h3>Waiting for next round...</h3>
              <p>Get ready to tap!</p>
            </div>
          )}
        </div>

        <div className="tap-area">
          <button
            className={`tap-button ${gameState.canTap ? 'active' : 'disabled'}`}
            onClick={handleTap}
            disabled={!gameState.canTap}
          >
            <Target size={48} />
            <span>TAP!</span>
          </button>
          
          <div className="tap-stats">
            <div className="stat">
              <label>This Round</label>
              <span>{tapCount}</span>
            </div>
            <div className="stat">
              <label>Total Score</label>
              <span>{gameState.userScore}</span>
            </div>
          </div>
        </div>

        <div className="mini-leaderboard">
          <h3>Top Players</h3>
          <div className="leaderboard-list">
            {gameState.leaderboard.slice(0, 5).map((player, index) => (
              <div key={player.userId} className="leaderboard-item">
                <span className="rank">#{index + 1}</span>
                <span className="username">{player.username}</span>
                <span className="score">{player.totalScore}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamePage;