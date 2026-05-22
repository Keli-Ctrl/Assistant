# Setup Instructions

This document provides step-by-step instructions to set up the Telegram AI SaaS project locally.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: Version 18.x or later.
- **npm**: Usually comes with Node.js.
- **PostgreSQL**: A running instance of PostgreSQL database.

## Step-by-Step Setup

### 1. Clone the Repository

Clone the project to your local machine:
```bash
git clone <repository-url>
cd telegram-ai-saas
```

### 2. Install Dependencies

Install the required npm packages:
```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file to create your own `.env` file:
```bash
cp .env.example .env
```

Open the `.env` file and fill in the following variables:

- `DATABASE_URL`: The connection string for your PostgreSQL database.
- `TELEGRAM_BOT_TOKEN`: The token provided by @BotFather when you create your bot.
- `GOOGLE_API_KEY`: Your API key for the Gemini AI from Google AI Studio.

### 4. Database Setup

Run the Prisma migrations to set up your database schema:
```bash
npx prisma migrate dev --name init
```

Generate the Prisma client:
```bash
npx prisma generate
```

### 5. Running the Development Server

Start the Next.js development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### 6. Webhook Testing Tips

To receive Telegram webhooks locally, you need a way to expose your local server to the internet. We recommend using **ngrok**:

1. Install ngrok: `npm install -g ngrok`
2. Run ngrok on port 3000: `ngrok http 3000`
3. Copy the `https` forwarding URL provided by ngrok.
4. Set your Telegram Webhook URL by calling:
   `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<ngrok-url>/api/webhook/telegram/<YOUR_BOT_TOKEN>`

## Troubleshooting

- **Database Connection**: Ensure your PostgreSQL service is running and the `DATABASE_URL` is correct.
- **Prisma Client**: If you encounter errors related to Prisma, try running `npx prisma generate` again.
- **Port Conflict**: If port 3000 is in use, you can run the server on a different port using `npm run dev -- -p <port>`.
