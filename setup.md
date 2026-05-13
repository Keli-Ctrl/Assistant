# Setup Instructions

This document provides step-by-step instructions to set up the WhatsApp AI SaaS project locally.

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
cd whatsapp-ai-saas
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
- `WHATSAPP_VERIFY_TOKEN`: A string of your choice used to verify your webhook in the Meta Developer Portal.
- `WHATSAPP_API_TOKEN`: The access token provided by the Meta Developer Portal for your WhatsApp Business account.
- `WHATSAPP_APP_SECRET`: Your Meta App's secret key.
- `ANTHROPIC_API_KEY`: Your API key for the Claude AI from Anthropic.

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

To receive WhatsApp webhooks locally, you need a way to expose your local server to the internet. We recommend using **ngrok**:

1. Install ngrok: `npm install -g ngrok`
2. Run ngrok on port 3000: `ngrok http 3000`
3. Copy the `https` forwarding URL provided by ngrok.
4. In the Meta Developer Portal, set your Webhook URL to: `<ngrok-url>/api/webhook`
5. Use the `WHATSAPP_VERIFY_TOKEN` you defined in your `.env` for the verification step.

## Troubleshooting

- **Database Connection**: Ensure your PostgreSQL service is running and the `DATABASE_URL` is correct.
- **Prisma Client**: If you encounter errors related to Prisma, try running `npx prisma generate` again.
- **Port Conflict**: If port 3000 is in use, you can run the server on a different port using `npm run dev -- -p <port>`.
