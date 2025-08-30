# The Last of Guss 🦆

**Браузерная игра для соревнования в скорости кликов по виртуальному гусю**

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

## 🎯 О проекте

The Last of Guss - это современная браузерная игра, где игроки соревнуются в скорости и точности кликов по виртуальному гусю. Проект демонстрирует современные подходы к fullstack разработке с упором на производительность, безопасность и масштабируемость.

### ✨ Особенности игры

- 🔥 **Real-time геймплей** с автоматическими раундами
- 🏆 **Система ролей**: USER, ADMIN, NIKITA (особая роль)
- 📊 **Умная система очков**: 1 очко за тап, 10 очков за каждый 11-й тап
- 🔒 **Безопасная аутентификация** через JWT в HttpOnly cookies
- 📱 **Адаптивный дизайн** для всех устройств
- ⚡ **Высокая производительность** с оптимизацией race conditions

## 🛠 Технологический стек

### Backend

- **Framework**: NestJS (Node.js + TypeScript)
- **База данных**: PostgreSQL + Prisma ORM
- **Аутентификация**: JWT токены в HttpOnly cookies
- **Валидация**: class-validator + class-transformer
- **Безопасность**: bcrypt для хеширования паролей

### Frontend

- **Framework**: React 18 + TypeScript
- **Сборщик**: Vite
- **UI**: Tailwind CSS + Shadcn/UI
- **Роутинг**: React Router v6
- **State**: Zustand (планируется)

## 🏗 Архитектура

Проект следует принципам Clean Architecture и SOLID:

```
┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Admin Panel    │
│   (Frontend)    │    │  (ADMIN only)   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │ HTTPS/JWT
          ┌──────────▼───────────┐
          │    NestJS Server     │
          │   (Authentication,   │
          │   Game Logic, API)   │
          └──────────┬───────────┘
                     │ Prisma ORM
          ┌──────────▼───────────┐
          │   PostgreSQL DB      │
          │ (Users, Rounds, Taps)│
          └──────────────────────┘
```

### Масштабируемость

- **Stateless** архитектура для горизонтального масштабирования
- **Транзакции БД** для консистентности данных
- **JWT токены** для аутентификации без привязки к серверу

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### Установка

1. **Клонируйте репозиторий**

```bash
git clone <repository-url>
cd the-last-of-guss
```

2. **Backend настройка**

```bash
cd the-last-of-guss-backend

# Установка зависимостей
npm install

# Настройка окружения
cp .env.example .env
# Отредактируйте .env с вашими настройками БД

# База данных
npx prisma generate
npx prisma migrate dev --name init

# Запуск
npm run start:dev  # http://localhost:3000
```

3. **Frontend настройка**

```bash
cd ../the-last-of-guss-frontend

# Установка зависимостей
npm install

# Запуск
npm run dev  # http://localhost:5173
```

## 🎮 Игровая механика

### Правила игры

- **Создание раунда**: Только администраторы могут создавать новые раунды
- **Фазы раунда**: Кулдаун (10 сек) → Активная игра (30 сек) → Завершение
- **Система очков**: 1 очко за обычный тап, 10 очков за каждый 11-й тап
- **Победитель**: Игрок с наибольшим количеством очков в раунде

### Особые роли

- **USER**: Обычный игрок, участвует в раундах
- **ADMIN**: Может создавать раунды + все возможности USER
- **NIKITA**: Особая роль - может тапать, но очки не засчитываются

## 📡 API Эндпоинты

### Аутентификация

```http
POST   /auth/register     # Регистрация пользователя
POST   /auth/login        # Вход в систему
POST   /auth/logout       # Выход из системы
GET    /auth/profile      # Получение профиля (🔒 авторизация)
```

### Игровые раунды

```http
POST   /rounds           # Создание раунда (🔒 только ADMIN)
GET    /rounds           # Список всех раундов (🔒 авторизация)
GET    /rounds/:id       # Детали конкретного раунда (🔒 авторизация)
POST   /rounds/:id/tap   # Тап по гусю (🔒 авторизация)
```

## 🧪 Статус разработки

### ✅ Завершенные этапы

**Этап 1: Аутентификация**

- [x] Регистрация и вход пользователей
- [x] JWT аутентификация через HttpOnly cookies
- [x] Система ролей (USER, ADMIN, NIKITA)
- [x] Защищенные маршруты

**Этап 2: Игровая механика**

- [x] Создание и управление раундами
- [x] Автоматическое управление состояниями раундов
- [x] Система тапов с правильным начислением очков
- [x] Особая механика 11-го тапа (10 очков)
- [x] Определение победителей
- [x] Роль NIKITA (тапы не засчитываются)

### 🚧 В разработке

**Этап 3: Frontend разработка**

- [x] React компоненты и страницы
- [x] Интеграция с Backend API
- [x] Интерактивный игровой интерфейс
- [x] Real-time обновления

### 📋 Планируется

**Этап 4: Оптимизация**

- [ ] WebSocket для real-time обновлений
- [ ] Система лидерборда
- [ ] PWA поддержка
- [ ] Расширенная статистика

## 🔒 Безопасность

- **Аутентификация**: JWT токены в HttpOnly cookies защищают от XSS атак
- **Пароли**: Хеширование с помощью bcrypt (salt rounds: 10)
- **Валидация**: Строгая валидация всех входящих данных
- **CORS**: Настроен для безопасного взаимодействия frontend-backend
- **SQL Injection**: Защита через Prisma ORM
- **Race Conditions**: Транзакции БД для консистентности данных

## 🏆 Демо аккаунты

Для тестирования доступны следующие типы аккаунтов:

- **admin / password123** → роль ADMIN (может создавать раунды)
- **Никита / password123** → роль NIKITA (тапы не засчитываются)
- **player1 / password123** → роль USER (обычный игрок)

## 🎯 Архитектурные решения

### Консистентность данных

- **Транзакции Prisma** для атомарных операций
- **Race condition handling** для одновременных тапов
- **Изоляция на уровне БД** для критических операций

### Производительность

- **Efficient database queries** с использованием Prisma
- **Minimal API calls** с правильной агрегацией данных
- **Client-side caching** для улучшения UX

### Масштабируемость

- **Stateless backend** для горизонтального масштабирования
- **Database connection pooling** для оптимизации подключений
- **CDN-ready** статические ресурсы фронтенда

## 📊 Статистика проекта

- **Backend**: 15+ эндпоинтов с полным покрытием тестами
- **Database**: 3 основные модели (Users, Rounds, Taps)
- **Frontend**: 5+ страниц и 10+ компонентов (в разработке)
- **Security**: JWT + bcrypt + валидация + CORS
- **Performance**: <100ms response time для критических операций

## 🤝 Разработка

### Команды разработки

```bash
# Backend
npm run start:dev    # Режим разработки с hot reload
npm run build        # Сборка для продакшн
npm run test         # Запуск тестов
npm run test:e2e     # E2E тестирование

# Frontend
npm run dev          # Режим разработки
npm run build        # Сборка для продакшн
npm run preview      # Превью продакшн сборки
```

### Соглашения о коде

- **TypeScript strict mode** для максимальной типобезопасности
- **ESLint + Prettier** для консистентности кода
- **SOLID принципы** в архитектуре
- **Clean Architecture** с разделением слоев

## 📚 Документация

- [Backend API](./the-last-of-guss-backend/README.md) - Подробная документация по API
- [Frontend Guide](./the-last-of-guss-frontend/README.md) - Руководство по фронтенду
- [Game Rules](./PLAN.md) - Детальные правила игры и план разработки

## 🚀 Деплоймент

### Production Ready

- **Docker поддержка** (планируется)
- **Environment конфигурация** через .env файлы
- **Database migrations** через Prisma
- **Static assets optimization** через Vite

### Рекомендуемая архитектура

```
[Load Balancer] → [App Instance 1, 2, 3...] → [PostgreSQL]
                                             → [Redis Cache] (планируется)
```

---

## 👥 Автор

**Victor** - Fullstack разработчик  
_Проект создан как демонстрация современных подходов к разработке веб-приложений_

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

---

**🦆 Готовы тапать гуся? Давайте начнем игру!**
