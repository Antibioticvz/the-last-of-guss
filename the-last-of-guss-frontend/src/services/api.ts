import axios from 'axios';
import type { AuthResponse, LoginDto, RegisterDto, User, Round, GameState } from '../types';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterDto): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const gameService = {
  async getCurrentRound(): Promise<Round | null> {
    const response = await api.get('/rounds/current');
    return response.data;
  },

  async getGameState(): Promise<GameState> {
    const response = await api.get('/game/state');
    return response.data;
  },

  async tap(roundId: string): Promise<{ score: number }> {
    const response = await api.post('/game/tap', { roundId });
    return response.data;
  },

  async getLeaderboard(): Promise<Array<{ userId: string; username: string; totalScore: number }>> {
    const response = await api.get('/game/leaderboard');
    return response.data;
  },
};

export default api;