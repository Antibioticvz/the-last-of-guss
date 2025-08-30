# The Last of Guss - Backend

**Браузерная игра для соревнования в скорости кликов по виртуальному гусю**

## 🎯 Описание

Backend-сервер для игры "The Last of Guss", построенный на современном стеке технологий с акцентом на производительность, безопасность и масштабируемость.

## 🛠 Технологический стек

- **Framework:** NestJS (Node.js, TypeScript)
- **База данных:** PostgreSQL
- **ORM:** Prisma
- **Аутентификация:** JWT токены в HttpOnly cookies
- **Валидация:** class-validator, class-transformer
- **Безопасность:** bcrypt для хеширования паролей

## 🏗 Архитектура

Приложение следует архитектурным принципам:

- **Clean Architecture** с разделением слоев
- **SOLID принципы**
- **Dependency Injection** через NestJS
- **Модульная структура** для масштабируемости

### Основные модули:

- **AuthModule** - Аутентификация и авторизация
- **UsersModule** - Управление пользователями
- **RoundsModule** - Управление игровыми раундами (в разработке)

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd the-last-of-guss-backend

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками БД
```

### Настройка базы данных

```bash
# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma migrate dev --name init

# (Опционально) Заполнение тестовыми данными
npx prisma db seed
```

### Запуск

```bash
# Режим разработки
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

Сервер будет доступен по адресу: http://localhost:3000

## 📡 API Эндпоинты

### Аутентификация

- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Вход в систему
- `POST /auth/logout` - Выход из системы
- `GET /auth/profile` - Получение профиля (защищенный)

### Пользователи

- Система ролей: `USER`, `ADMIN`, `NIKITA`
- Автоматическое назначение ролей по username

### В разработке

- `POST /rounds` - Создание раунда (только ADMIN)
- `GET /rounds` - Список раундов
- `GET /rounds/:id` - Детали раунда
- `POST /rounds/:id/tap` - Тап по гусю

## 🔒 Безопасность

- **JWT токены** в HttpOnly cookies для защиты от XSS
- **Хеширование паролей** с помощью bcrypt
- **Валидация входных данных** на всех уровнях
- **CORS** настроен для фронтенда
- **Rate limiting** (планируется)

## 🧪 Тестирование

```bash
# Юнит тесты
npm run test

# E2E тесты
npm run test:e2e

# Покрытие тестами
npm run test:cov
```

## 📊 База данных

### Схема данных

- **Users** - Пользователи с ролями
- **Rounds** - Игровые раунды
- **Taps** - Клики пользователей

### Миграции

```bash
# Создание новой миграции
npx prisma migrate dev --name <migration_name>

# Применение миграций
npx prisma migrate deploy
```

## 🚀 Деплоймент

Приложение готово к развертыванию в production:

```bash
# Сборка
npm run build

# Запуск
NODE_ENV=production npm run start:prod
```

### Переменные окружения

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
JWT_SECRET="your-secret-key"
ROUND_DURATION=60000
COOLDOWN_DURATION=30000
NODE_ENV=production
PORT=3000
```

## 🔧 Разработка

### Статус проекта

✅ **Этап 1: Аутентификация** - Завершен

- Регистрация и вход пользователей
- JWT аутентификация
- Система ролей
- Защищенные эндпоинты

🚧 **Этап 2: Игровая механика** - В разработке

- Управление раундами
- Система тапов
- Подсчет очков

📋 **Планируется**

- WebSocket для real-time обновлений
- Система лидерборда
- Админ панель

### Архитектурные решения

**Консистентность данных:**

- Транзакции Prisma для атомарных операций
- Optimistic locking для race conditions
- Валидация на уровне БД и приложения

**Масштабируемость:**

- Stateless архитектура
- Горизонтальное масштабирование
- Кеширование критических данных

## 👥 Команда

- Backend разработка: NestJS + PostgreSQL + Prisma
- Архитектура: Clean Architecture + SOLID
- Тестирование: Jest + Supertest

---

_Создано как демонстрация современных подходов к разработке backend приложений_
