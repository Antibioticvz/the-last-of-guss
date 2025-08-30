import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError, apiService } from '../services/api';
import type { RoundWithStats, User } from '../types';

const GamePage: React.FC = () => {
  const { roundId } = useParams<{ roundId: string }>();
  const navigate = useNavigate();

  const [round, setRound] = useState<RoundWithStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tapping, setTapping] = useState(false);
  const [tapAnimation, setTapAnimation] = useState(false);
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
        navigate('/login');
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
      setTapAnimation(true);
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

      // Reset animation after 200ms
      void setTimeout(() => setTapAnimation(false), 200);

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
    if (!round) return { text: 'Загрузка...', color: 'text-gray-600' };

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
          color: 'text-gray-600',
        };
      default:
        return { text: 'Неизвестный статус', color: 'text-gray-600' };
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Раунд не найден
          </h2>
          <p className="text-gray-600 mb-4">
            Возможно, раунд был удален или не существует
          </p>
          <Link
            to="/rounds"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Вернуться к списку раундов
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            to="/rounds"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Назад к раундам
          </Link>
          <div className="text-right">
            <span className="text-gray-700">
              <strong>{user?.username}</strong>
              {user?.role === 'NIKITA' && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                  Особая роль
                </span>
              )}
            </span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${status.color}`}>
            {status.text}
          </h1>
          <p className="text-gray-600">Раунд ID: {roundId?.slice(0, 8)}...</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        {/* Game Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Guss Section - Main Game */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              {round.status === 'ACTIVE' ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    🎯 Тапайте по гусю!
                  </h2>
                  <div className="relative inline-block">
                    {/* Tap Animation */}
                    {lastTapScore !== null && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <span
                          className={`text-2xl font-bold ${
                            lastTapScore === 10
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          +{lastTapScore}
                        </span>
                      </div>
                    )}

                    {/* Guss */}
                    <button
                      onClick={handleTap}
                      disabled={tapping}
                      className={`text-8xl hover:scale-110 active:scale-95 transition-transform duration-150 cursor-pointer select-none ${
                        tapAnimation ? 'animate-pulse' : ''
                      } ${tapping ? 'opacity-50' : ''}`}
                      style={{ lineHeight: 1 }}
                    >
                      🦆
                    </button>
                  </div>

                  <div className="mt-6 space-y-2">
                    <p className="text-gray-600">
                      Кликните по гусю, чтобы заработать очки!
                    </p>
                    <p className="text-sm text-gray-500">
                      1 очко за тап • 10 очков за каждый 11-й тап
                    </p>
                  </div>
                </>
              ) : round.status === 'COOLDOWN' ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    ⏳ Подготовка к раунду
                  </h2>
                  <div className="text-6xl mb-6">🦆</div>
                  <p className="text-gray-600">
                    Раунд скоро начнется! Приготовьтесь тапать.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    🏁 Раунд завершен
                  </h2>
                  <div className="text-6xl mb-6">🦆</div>
                  <div className="text-center space-y-2">
                    {round.winner ? (
                      <>
                        <p className="text-xl font-semibold text-yellow-600 mb-2">
                          🏆 Победитель: {round.winner.username}
                        </p>
                        <p className="text-lg text-gray-700">
                          Счет победителя: {round.winner.score} очков
                        </p>
                      </>
                    ) : (
                      <p className="text-lg text-gray-600">
                        Ничья! Никто не набрал очков.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* My Score */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                📊 Мои очки
              </h3>
              <div className="text-3xl font-bold text-blue-600">
                {round.myScore ?? 0}
              </div>
              {user?.role === 'NIKITA' && (
                <p className="text-sm text-purple-600 mt-2">
                  * Ваши очки не засчитываются
                </p>
              )}
            </div>

            {/* Round Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🎮 Статистика раунда
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Всего тапов:</span>
                  <span className="font-semibold">{round.totalTaps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Общий счет:</span>
                  <span className="font-semibold">{round.totalScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Статус:</span>
                  <span
                    className={`font-semibold ${
                      round.status === 'ACTIVE'
                        ? 'text-green-600'
                        : round.status === 'COOLDOWN'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {round.status === 'ACTIVE'
                      ? 'Активен'
                      : round.status === 'COOLDOWN'
                        ? 'Ожидание'
                        : 'Завершен'}
                  </span>
                </div>
              </div>
            </div>

            {/* Game Rules */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📜 Правила игры
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 1 очко за каждый тап</p>
                <p>• 10 очков за каждый 11-й тап</p>
                <p>• Тапать можно только в активном раунде</p>
                <p>• Побеждает игрок с наибольшим счетом</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamePage;
