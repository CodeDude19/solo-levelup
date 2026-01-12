# THE SYSTEM

A high-stakes, RPG-style productivity app designed to gamify discipline. Built with React, Tailwind CSS, and Lucide-React.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deploy to GitHub Pages

### Option 1: Using GitHub Actions (Recommended)

1. Push your code to GitHub
2. Go to your repository Settings > Pages
3. Under "Source", select "GitHub Actions"
4. Create `.github/workflows/deploy.yml` with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Option 2: Manual Deployment

1. Build the project: `npm run build`
2. Push the `dist` folder contents to a `gh-pages` branch
3. Enable GitHub Pages from the `gh-pages` branch

## Features

- **Player Dashboard**: Track your level, rank, XP, and gold
- **Quest System**: Create tasks with rewards and penalties
- **Awakening**: Define your vision and anti-vision for motivation
- **Habit Tracker**: Build streaks with daily habits and view your activity heatmap
- **Rewards Shop**: Spend earned gold on custom rewards

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React Icons
- LocalStorage for persistence

## Mobile-First Design

Optimized for iPhone (390x844) viewport with bottom navigation.
