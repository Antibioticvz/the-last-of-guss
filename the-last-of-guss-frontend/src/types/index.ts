// API Types for backend integration
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

export interface RoundWithStats extends Round {
  status: 'COOLDOWN' | 'ACTIVE' | 'COMPLETED';
  timeLeft: number;
  totalTaps: number;
  totalScore: number;
  myScore?: number;
  winner?: {
    username: string;
    score: number;
  } | null;
  taps?: Tap[];
}

export interface Tap {
  id: string;
  userId: string;
  roundId: string;
  score: number;
  createdAt: string;
  user: {
    username: string;
  };
}

// API Response Types
export interface LoginResponse {
  message: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface RoundsListResponse {
  rounds: Round[];
}

export interface RoundResponse {
  round: RoundWithStats;
}

export interface TapResponse {
  message: string;
  tapScore: number;
  totalScore: number;
}

export interface CreateRoundResponse {
  message: string;
  round: Round;
}

// API Error Type
export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
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
