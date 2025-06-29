# 🚀Разработка интерфейса для Сервиса межгалактической аналитики


## Раздел тестирования

### Unit & Integration тесты
- **Vitest** - test runner
- **React Testing Library** - тестирование компонентов
- **@testing-library/user-event** - симуляция действий пользователя
- **jsdom** - DOM окружение

### E2E тесты
- **Playwright** - кроссбраузерное тестирование
- **TypeScript** - типизация тестов

### Coverage
- **@vitest/coverage-v8** - отчеты о покрытии кода

## Инструкции по запуску

### Установка
```bash
npm install

# Установка Playwright (для E2E тестов)
npx playwright install
```

### Запуск серверов
Для корректной работы E2E тестов необходимо запустить серверы:

```bash
# Клиентское приложение (терминал 1)
npm run dev
# Приложение будет доступно на http://localhost:5173

# Backend сервер (терминал 2)
# Запустите ваш backend сервер для API запросов
# Убедитесь что сервер отвечает на /api/report и /api/generate
```

### Все тесты
```bash
# Unit + Integration тесты (107)
npm run test

# E2E тесты (87)
npm run test:e2e
```

### Режимы разработки
```bash
# Watch mode
npm run test:watch

# Coverage отчет
npm run coverage

# E2E с UI
npm run test:e2e-ui

# E2E в браузере
npm run test:e2e-headed
```

### Отдельные группы
```bash
# Только unit тесты
npx vitest run src/utils src/hooks

# Только integration тесты
npx vitest run src/components src/ui

# Конкретная страница E2E
npx playwright test src/pages/Home

# Конкретный браузер
npx playwright test --project=chromium
```

### Отладка
```bash
# Verbose вывод
npx vitest run --reporter=verbose

# E2E с отладкой
npx playwright test --debug

# Test generator
npx playwright codegen localhost:5173
```