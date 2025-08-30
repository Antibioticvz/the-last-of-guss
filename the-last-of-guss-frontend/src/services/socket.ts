import { io, Socket } from 'socket.io-client';
import { GameState, Round } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    this.socket = io('http://localhost:3000', {
      auth: {
        token: token,
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

  onLeaderboardUpdate(callback: (leaderboard: Array<{ userId: string; username: string; totalScore: number }>) => void) {
    this.socket?.on('leaderboardUpdate', callback);
  }

  // Remove listeners
  off(event: string) {
    this.socket?.off(event);
  }

  // Send events
  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }
}

export const socketService = new SocketService();
export default socketService;