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

# Сброс базы данных и применение миграций
npx prisma migrate reset --force

# Заполнение базы тестовыми пользователями
npm run db:seed
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

## 👤 Пользователи и роли

### Система ролей

Приложение поддерживает 3 типа ролей:

- **USER** - Обычные пользователи (могут играть)
- **ADMIN** - Администраторы (могут создавать раунды)
- **NIKITA** - Специальная роль (тапы не засчитываются, но участие возможно)

### Автоматическое назначение ролей при регистрации

- Если username содержит `"admin"` (любой регистр) → роль `ADMIN`
- Если username равен `"Никита"` → роль `NIKITA`
- Во всех остальных случаях → роль `USER`

### Тестовые пользователи (через сиды)

После выполнения `npm run db:seed` в базе будут созданы:

| Username  | Password      | Роль   | Описание                                  |
| --------- | ------------- | ------ | ----------------------------------------- |
| `admin`   | `password123` | ADMIN  | Администратор (может создавать раунды)    |
| `player1` | `password123` | USER   | Обычный игрок                             |
| `Никита`  | `password123` | NIKITA | Специальный пользователь (тапы = 0 очков) |

### Примеры регистрации новых пользователей

```bash
# Обычный пользователь
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "player2", "password": "mypassword"}'
# Получит роль: USER

# Администратор
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "mypassword"}'
# Получит роль: ADMIN (содержит "admin")

# Никита
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "Никита", "password": "mypassword"}'
# Получит роль: NIKITA
```

### Команды для работы с базой данных

```bash
# Полный сброс БД и пересоздание тестовых пользователей
npm run db:reset

# Только заполнение тестовыми данными (без сброса)
npm run db:seed

# Просмотр данных в удобном интерфейсе
npx prisma studio
```

## 📡 API Эндпоинты

### Аутентификация

- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Вход в систему
- `POST /auth/logout` - Выход из системы
- `GET /auth/profile` - Получение профиля (защищенный)

### Пример входа

```bash
# Вход администратором
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}' \
  -c cookies.txt

# Вход обычным игроком
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "player1", "password": "password123"}' \
  -c cookies.txt
```

### В разработке

- `POST /rounds` - Создание раунда (только ADMIN)
- `GET /rounds` - Список раундов
- `GET /rounds/:id` - Детали раунда
- `POST /rounds/:id/tap` - Тап по гусю

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
