import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, apiService } from '../services/api';
import type { Round, User } from '../types';

const RoundsListPage: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [roundsData, userData] = await Promise.all([
        apiService.getRounds(),
        apiService.getProfile(),
      ]);
      setRounds(roundsData.rounds);
      setUser(userData);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        void navigate('/login');
      } else {
        setError(
          err instanceof ApiError ? err.message : 'Ошибка загрузки данных',
        );
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateRound = async () => {
    try {
      setCreating(true);
      setError('');
      const response = await apiService.createRound();
      void navigate(`/rounds/${response.round.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Ошибка создания раунда',
      );
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      void navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      void navigate('/login');
    }
  };

  const getStatusBadge = (round: Round) => {
    const now = new Date();
    const startTime = new Date(round.startTime);
    const endTime = new Date(round.endTime);

    if (now < startTime) {
      return <Badge variant="warning">Ожидание</Badge>;
    } else if (now >= startTime && now <= endTime) {
      return <Badge variant="success">Активен</Badge>;
    } else {
      return <Badge variant="muted">Завершен</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка раундов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              🦆 The Last of Guss
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Список игровых раундов
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">{user?.username}</strong>
              {user?.role === 'ADMIN' && (
                <Badge variant="outline" className="ml-2">
                  Админ
                </Badge>
              )}
              {user?.role === 'NIKITA' && (
                <Badge variant="secondary" className="ml-2">
                  Никита
                </Badge>
              )}
            </span>
            <Button variant="outline" onClick={() => void handleLogout()}>
              Выйти
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Create Round Button */}
        {user?.role === 'ADMIN' && (
          <div className="mb-6 text-right">
            <Button
              onClick={() => void handleCreateRound()}
              disabled={creating}
            >
              {creating ? 'Создание...' : '+ Создать раунд'}
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive/50">
            <CardContent className="p-4 text-destructive text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Rounds Grid */}
        {rounds.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🦆</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Нет доступных раундов
            </h3>
            <p className="text-gray-600">
              {user?.role === 'ADMIN'
                ? 'Создайте первый раунд, чтобы начать игру!'
                : 'Ожидайте создания нового раунда администратором.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rounds.map((round) => (
              <Card
                key={round.id}
                onClick={() => {
                  void navigate(`/rounds/${round.id}`);
                }}
                className="cursor-pointer transition-all hover:shadow-md"
              >
                <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">Раунд</CardTitle>
                    <CardDescription>
                      ID: {round.id.slice(0, 8)}...
                    </CardDescription>
                  </div>
                  {getStatusBadge(round)}
                </CardHeader>
                <CardContent className="pt-0 text-sm space-y-3">
                  <div>
                    <div className="text-muted-foreground">Начало</div>
                    <div className="font-medium">
                      {formatTime(round.startTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Окончание</div>
                    <div className="font-medium">
                      {formatTime(round.endTime)}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end pt-0">
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Перейти →
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => void loadData()}>
            🔄 Обновить список
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RoundsListPage;
