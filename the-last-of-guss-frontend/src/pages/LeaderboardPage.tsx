import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { gameService } from '../services/api';
import { socketService } from '../services/socket';
import { ArrowLeft, Crown, Trophy, Medal } from 'lucide-react';

interface LeaderboardPageProps {
  user: User;
  onLogout: () => void;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  totalScore: number;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ user, onLogout }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await gameService.getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();

    // Listen for real-time leaderboard updates
    socketService.onLeaderboardUpdate((updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);
    });

    return () => {
      socketService.off('leaderboardUpdate');
    };
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="rank-icon gold" size={20} />;
      case 2:
        return <Trophy className="rank-icon silver" size={20} />;
      case 3:
        return <Medal className="rank-icon bronze" size={20} />;
      default:
        return <span className="rank-number">#{rank}</span>;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'rank-1';
      case 2:
        return 'rank-2';
      case 3:
        return 'rank-3';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-page loading">
        <div className="loading-spinner">Loading leaderboard...</div>
      </div>
    );
  }

  const userRank = leaderboard.findIndex(entry => entry.userId === user.id) + 1;

  return (
    <div className="leaderboard-page">
      <header className="page-header">
        <Link to="/game" className="back-button">
          <ArrowLeft size={20} />
          Back to Game
        </Link>
        <h1>🏆 Leaderboard</h1>
      </header>

      <main className="leaderboard-main">
        {userRank > 0 && (
          <div className="user-stats">
            <h2>Your Ranking</h2>
            <div className="user-rank-card">
              <div className="rank">{getRankIcon(userRank)}</div>
              <div className="user-info">
                <span className="username">{user.username}</span>
                {user.role === 'NIKITA' && <span className="nikita-badge">👑 NIKITA</span>}
              </div>
              <div className="score">
                {leaderboard[userRank - 1]?.totalScore || 0} points
              </div>
            </div>
          </div>
        )}

        <div className="leaderboard-section">
          <h2>Top Players</h2>
          <div className="leaderboard-list">
            {leaderboard.length === 0 ? (
              <div className="empty-leaderboard">
                <p>No players yet. Be the first to play!</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.userId === user.id;
                
                return (
                  <div
                    key={entry.userId}
                    className={`leaderboard-entry ${getRankClass(rank)} ${isCurrentUser ? 'current-user' : ''}`}
                  >
                    <div className="rank-section">
                      {getRankIcon(rank)}
                    </div>
                    <div className="player-info">
                      <span className="username">
                        {entry.username}
                        {isCurrentUser && <span className="you-indicator">(You)</span>}
                      </span>
                    </div>
                    <div className="score-section">
                      <span className="score">{entry.totalScore}</span>
                      <span className="points-label">points</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="leaderboard-stats">
          <div className="stat">
            <span className="stat-label">Total Players</span>
            <span className="stat-value">{leaderboard.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Highest Score</span>
            <span className="stat-value">{leaderboard[0]?.totalScore || 0}</span>
          </div>
          {userRank > 0 && (
            <div className="stat">
              <span className="stat-label">Your Rank</span>
              <span className="stat-value">#{userRank}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;