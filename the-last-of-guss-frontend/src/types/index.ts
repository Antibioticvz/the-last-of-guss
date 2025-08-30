export interface User {
  id: string;
  username: string;
  role: 'USER' | 'ADMIN' | 'NIKITA';
  createdAt: string;
}

export interface Round {
  id: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
}

export interface Tap {
  id: string;
  userId: string;
  roundId: string;
  score: number;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
}

export interface GameState {
  currentRound: Round | null;
  timeLeft: number;
  canTap: boolean;
  userScore: number;
  leaderboard: Array<{
    userId: string;
    username: string;
    totalScore: number;
  }>;
}