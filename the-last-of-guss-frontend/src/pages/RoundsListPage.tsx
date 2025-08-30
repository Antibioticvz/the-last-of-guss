import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, apiService } from '../services/api';
import { Round, User } from '../types';

const RoundsListPage: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
        navigate('/login');
      } else {
        setError(
          err instanceof ApiError ? err.message : 'Ошибка загрузки данных',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRound = async () => {
    try {
      setCreating(true);
      setError('');
      const response = await apiService.createRound();
      navigate(`/rounds/${response.round.id}`);
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
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  const getStatusBadge = (round: Round) => {
    const now = new Date();
    const startTime = new Date(round.startTime);
    const endTime = new Date(round.endTime);

    if (now < startTime) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          Ожидание
        </span>
      );
    } else if (now >= startTime && now <= endTime) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          Активен
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
          Завершен
        </span>
      );
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
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🦆 The Last of Guss
            </h1>
            <p className="text-gray-600 mt-1">Список игровых раундов</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Добро пожаловать, <strong>{user?.username}</strong>
              {user?.role === 'ADMIN' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  Админ
                </span>
              )}
              {user?.role === 'NIKITA' && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                  Никита
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Create Round Button */}
        {user?.role === 'ADMIN' && (
          <div className="mb-6 text-right">
            <button
              onClick={handleCreateRound}
              disabled={creating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? 'Создание...' : '+ Создать раунд'}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
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
              <div
                key={round.id}
                onClick={() => navigate(`/rounds/${round.id}`)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-gray-800 truncate">Раунд</h3>
                  {getStatusBadge(round)}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Начало:</span>
                    <br />
                    {formatTime(round.startTime)}
                  </div>
                  <div>
                    <span className="font-medium">Окончание:</span>
                    <br />
                    {formatTime(round.endTime)}
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      ID: {round.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <span className="text-blue-600 text-sm font-medium">
                    Перейти к раунду →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadData}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            🔄 Обновить список
          </button>
        </div>
      </main>
    </div>
  );
};

export default RoundsListPage;
