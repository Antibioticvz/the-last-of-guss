import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, apiService } from '../services/api';
import type { RoundWithStats, User } from '../types';

const GamePage: React.FC = () => {
  const { roundId } = useParams<{ roundId: string }>();
  const navigate = useNavigate();

  const [round, setRound] = useState<RoundWithStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tapping, setTapping] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastTapScore, setLastTapScore] = useState<number | null>(null);

  const loadRoundData = useCallback(async () => {
    if (!roundId) return;

    try {
      const [roundData, userData] = await Promise.all([
        apiService.getRound(roundId),
        apiService.getProfile().catch(() => null),
      ]);
      setRound(roundData.round);
      if (userData) setUser(userData);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        void navigate('/login');
      } else {
        setError(
          err instanceof ApiError ? err.message : 'Ошибка загрузки раунда',
        );
      }
    }
  }, [roundId, navigate]);

  useEffect(() => {
    void loadRoundData().finally(() => setLoading(false));
  }, [loadRoundData]);

  // Auto-refresh round data every 2 seconds
  useEffect(() => {
    if (!round) return;

    const interval = setInterval(() => {
      void loadRoundData();
    }, 2000);

    return () => clearInterval(interval);
  }, [round, loadRoundData]);

  const handleTap = async () => {
    if (!roundId || !round || round.status !== 'ACTIVE' || tapping) return;

    try {
      setTapping(true);
      setError('');

      const response = await apiService.tapRound(roundId);
      setLastTapScore(response.tapScore);

      // Update local score immediately for better UX
      setRound((prev) =>
        prev
          ? {
              ...prev,
              myScore: response.totalScore,
              totalTaps: prev.totalTaps + 1,
              totalScore: prev.totalScore + response.tapScore,
            }
          : null,
      );

      // Hide tap score after 1 second
      void setTimeout(() => setLastTapScore(null), 1000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка при тапе');
    } finally {
      setTapping(false);
    }
  };

  const formatTimeLeft = (timeLeft: number) => {
    const seconds = Math.max(0, Math.floor(timeLeft / 1000));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    if (!round) return { text: 'Загрузка...', color: 'text-muted-foreground' };

    switch (round.status) {
      case 'COOLDOWN':
        return {
          text: `До начала раунда: ${formatTimeLeft(round.timeLeft)}`,
          color: 'text-yellow-600',
        };
      case 'ACTIVE':
        return {
          text: `Раунд активен! Осталось: ${formatTimeLeft(round.timeLeft)}`,
          color: 'text-green-600',
        };
      case 'COMPLETED':
        return {
          text: 'Раунд завершен!',
          color: 'text-muted-foreground',
        };
      default:
        return { text: 'Неизвестный статус', color: 'text-muted-foreground' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка раунда...</p>
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Раунд не найден</CardTitle>
            <CardDescription>Возможно он был удалён</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="mt-2">
              <a href="/rounds">Вернуться к списку</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getStatusDisplay();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="link" asChild className="px-0 h-auto">
            <a href="/rounds">← Назад</a>
          </Button>
          <div className="text-right text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {user?.username}
            </span>
            {user?.role === 'NIKITA' && (
              <Badge variant="secondary" className="ml-2">
                Особая роль
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className={`text-3xl font-bold tracking-tight ${status.color}`}>
            {status.text}
          </h1>
          <p className="text-sm text-muted-foreground">
            Раунд ID: {roundId?.slice(0, 8)}...
          </p>
        </div>

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="p-4 text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2 relative overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center">
              {round.status === 'ACTIVE' ? (
                <>
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    🎯 <span>Тапайте по гусю!</span>
                  </h2>
                  <div className="relative inline-block">
                    {lastTapScore !== null && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <span
                          className={`text-2xl font-bold ${lastTapScore === 10 ? 'text-yellow-600' : 'text-green-600'}`}
                        >
                          +{lastTapScore}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      disabled={tapping}
                      onClick={() => void handleTap()}
                      className={`text-8xl h-auto w-auto p-4 hover:scale-110 active:scale-95 transition-transform select-none ${tapping ? 'opacity-50' : ''}`}
                    >
                      🦆
                    </Button>
                  </div>
                  <div className="mt-6 space-y-1 text-center">
                    <p className="text-muted-foreground text-sm">
                      Кликните по гусю, чтобы заработать очки!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      1 очко за тап • 10 очков за каждый 11-й тап
                    </p>
                  </div>
                </>
              ) : round.status === 'COOLDOWN' ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold mb-4">
                    ⏳ Подготовка к раунду
                  </h2>
                  <div className="text-7xl mb-6">🦆</div>
                  <p className="text-muted-foreground">
                    Раунд скоро начнется! Приготовьтесь тапать.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <h2 className="text-2xl font-semibold">🏁 Раунд завершен</h2>
                  <div className="text-7xl">🦆</div>
                  {round.winner ? (
                    <>
                      <p className="text-xl font-semibold text-yellow-600">
                        🏆 Победитель: {round.winner.username}
                      </p>
                      <p className="text-muted-foreground">
                        Счет победителя: {round.winner.score} очков
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      Ничья! Никто не набрал очков.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">📊 Мои очки</CardTitle>
                {user?.role === 'NIKITA' && (
                  <CardDescription>
                    * Ваши очки не засчитываются
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-bold text-primary">
                  {round.myScore ?? 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">🎮 Статистика</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Всего тапов</span>
                  <span className="font-medium">{round.totalTaps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Общий счёт</span>
                  <span className="font-medium">{round.totalScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Статус</span>
                  <span className="font-medium">
                    {round.status === 'ACTIVE'
                      ? 'Активен'
                      : round.status === 'COOLDOWN'
                        ? 'Ожидание'
                        : 'Завершен'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">📜 Правила</CardTitle>
                <CardDescription>Краткое описание</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs space-y-1 text-muted-foreground">
                <p>• 1 очко за каждый тап</p>
                <p>• 10 очков за каждый 11-й тап</p>
                <p>• Тапать можно только в активном раунде</p>
                <p>• Побеждает игрок с наибольшим счетом</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamePage;
