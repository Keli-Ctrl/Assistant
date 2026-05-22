# Telegram AI SaaS

A SaaS platform that allows businesses to deploy AI-powered Telegram bots using Google Gemini API.

## Getting Started

To get started with local development, please follow the detailed instructions in [setup.md](./setup.md).

### Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env`.
3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## More Information

This project is built with Next.js, Prisma, and PostgreSQL. It integrates with the Telegram Bot API and Google's Gemini API.
