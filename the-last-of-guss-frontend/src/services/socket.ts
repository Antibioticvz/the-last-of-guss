import { io, type Socket } from 'socket.io-client';
import type { GameState, Round } from '../types';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(token?: string) {
    this.socket = io(API_BASE_URL, {
      auth: {
        token: token ?? '',
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Game events
  onRoundStart(callback: (round: Round) => void) {
    this.socket?.on('roundStart', callback);
  }

  onRoundEnd(callback: (round: Round) => void) {
    this.socket?.on('roundEnd', callback);
  }

  onGameStateUpdate(callback: (gameState: GameState) => void) {
    this.socket?.on('gameStateUpdate', callback);
  }

  onTap(callback: (data: { userId: string; score: number }) => void) {
    this.socket?.on('tap', callback);
  }

  onLeaderboardUpdate(
    callback: (
      leaderboard: Array<{
        userId: string;
        username: string;
        totalScore: number;
      }>,
    ) => void,
  ) {
    this.socket?.on('leaderboardUpdate', callback);
  }

  // Remove listeners
  off(event: string) {
    this.socket?.off(event);
  }

  // Send events
  emit(event: string, data?: unknown) {
    this.socket?.emit(event, data);
  }
}

export const socketService = new SocketService();
export default socketService;
