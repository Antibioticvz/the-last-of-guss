import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Crown, Medal, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { socketService } from '../services/socket';
import type { User } from '../types';

interface LeaderboardPageProps {
  user: User;
  onLogout: () => void;
}
interface LeaderboardEntry {
  userId: string;
  username: string;
  totalScore: number;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = () => {
      try {
        const mockLeaderboard: LeaderboardEntry[] = [
          { userId: user.id, username: user.username, totalScore: 0 },
        ];
        setLeaderboard(mockLeaderboard);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
    socketService.onLeaderboardUpdate((updated) => setLeaderboard(updated));
    return () => {
      socketService.off('leaderboardUpdate');
    };
  }, [user.id, user.username]);

  const getRankIcon = (rank: number) => {
    const size = 18;
    switch (rank) {
      case 1:
        return <Crown size={size} className="text-yellow-500" />;
      case 2:
        return <Trophy size={size} className="text-gray-400" />;
      case 3:
        return <Medal size={size} className="text-amber-700" />;
      default:
        return (
          <span className="text-xs font-medium text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const highlightClass = (rank: number) => {
    if (rank === 1)
      return 'border-yellow-400/50 bg-yellow-50 dark:bg-yellow-400/5';
    if (rank === 2) return 'border-gray-300/50 bg-gray-50 dark:bg-gray-400/5';
    if (rank === 3)
      return 'border-amber-600/40 bg-amber-50 dark:bg-amber-600/5';
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          Загрузка лидерборда...
        </div>
      </div>
    );
  }

  const userRank = leaderboard.findIndex((e) => e.userId === user.id) + 1;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/rounds" className="gap-1">
              <ArrowLeft className="size-4" /> Назад
            </Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">🏆 Лидерборд</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {userRank > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ваш результат</CardTitle>
              <CardDescription>Текущее положение в таблице</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex flex-col items-center w-14">
                  <div className="flex items-center justify-center size-10 rounded-md border bg-muted/40">
                    {getRankIcon(userRank)}
                  </div>
                  <span className="mt-1 text-[10px] text-muted-foreground uppercase tracking-wide">
                    Ранг
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    {user.username}
                    {user.role === 'NIKITA' && (
                      <Badge variant="secondary">NIKITA</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Всего очков: {leaderboard[userRank - 1]?.totalScore ?? 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Топ игроки</CardTitle>
            <CardDescription>Обновляется в реальном времени</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {leaderboard.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Пока нет игроков. Станьте первым!
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {leaderboard.map((entry, i) => {
                  const rank = i + 1;
                  const isCurrent = entry.userId === user.id;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 rounded-lg border p-3 text-sm transition-colors ${highlightClass(rank)} ${isCurrent ? 'ring-2 ring-primary/30' : ''}`}
                    >
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(rank)}
                      </div>
                      <div className="flex-1 font-medium flex items-center gap-2">
                        {entry.username}
                        {isCurrent && (
                          <Badge variant="outline" className="text-xs px-1">
                            Вы
                          </Badge>
                        )}
                      </div>
                      <div className="font-mono text-right tabular-nums text-primary font-semibold min-w-[72px]">
                        {entry.totalScore}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Игроков</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-2xl font-bold">{leaderboard.length}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Макс очков</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-2xl font-bold">
                {leaderboard[0]?.totalScore ?? 0}
              </span>
            </CardContent>
          </Card>
          {userRank > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ваш ранг</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-2xl font-bold">#{userRank}</span>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
