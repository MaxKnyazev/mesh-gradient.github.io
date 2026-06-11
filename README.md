# Mesh Gradient Generator

Интерактивный генератор mesh-градиентов на React + TypeScript.

**Live:** [https://maxknyazev.github.io/mesh-gradient.github.io/](https://maxknyazev.github.io/mesh-gradient.github.io/)

## Возможности

- Квадратное поле с цветными точками и настраиваемым радиусом
- Линейная интерполяция: вес точки `max(0, 1 − distance / radius)`
- Измерительная точка — не влияет на градиент, показывает расстояния до других точек
- Экспорт и импорт конфигурации в JSON

## Разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Деплой

При пуше в ветку `main` GitHub Actions автоматически собирает проект и публикует в ветку `gh-pages`.

В настройках репозитория: **Settings → Pages → Source: Deploy from branch `gh-pages`**.
