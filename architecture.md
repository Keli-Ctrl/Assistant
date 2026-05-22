# System Architecture: Telegram AI SaaS for Businesses

## Overview
A SaaS platform where businesses can sign up, provide their details, and deploy an AI-powered Telegram bot to handle customer inquiries.

## Tech Stack
- **Frontend**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes / Node.js
- **Database**: PostgreSQL (with Prisma ORM)
- **Authentication**: NextAuth.js
- **AI Integration**: Google Gemini API
- **Messaging Integration**: Telegram Bot API
- **Deployment**: Vercel (Frontend/API), Supabase/Neon (PostgreSQL)

## Database Schema (Relational)

### `Business`
- `id`: UUID (PK)
- `ownerId`: UUID (FK to User)
- `name`: String
- `description`: Text
- `services`: Text
- `prices`: Text
- `operatingHours`: String
- `location`: String
- `telegramBotToken`: String (Token provided by BotFather)
- `telegramBotUsername`: String
- `systemPromptOverride`: Text (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `User` (Business Owner)
- `id`: UUID (PK)
- `email`: String (Unique)
- `passwordHash`: String
- `name`: String
- `createdAt`: DateTime

### `Conversation`
- `id`: UUID (PK)
- `businessId`: UUID (FK to Business)
- `telegramChatId`: String
- `status`: Enum (ACTIVE, ESCALATED, RESOLVED)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `Message`
- `id`: UUID (PK)
- `conversationId`: UUID (FK to Conversation)
- `sender`: Enum (BOT, CUSTOMER, HUMAN)
- `content`: Text
- `timestamp`: DateTime

## System Components

### 1. Business Dashboard
- **Onboarding**: Form to collect business details and Telegram bot token.
- **Chat Viewer**: Real-time view of AI-customer conversations.
- **Settings**: Manage Telegram bot credentials and custom prompt tweaks.

### 2. Telegram Webhook Handler
- Receives `POST` requests from Telegram Bot API.
- Logic:
    1. Extract customer message and `chat_id`.
    2. Identify the business associated with the bot token that received the message.
    3. Fetch `Business` details and `Conversation` history (last 10 messages).
    4. Construct System Prompt:
       ```
       You are an AI assistant for [Business Name].
       Services: [Services]
       Prices: [Prices]
       Hours: [Hours]
       Location: [Location]
       Context: [Business Description]
       
       Goal: Help the customer. If they ask for something you can't handle or specifically ask for a human, say you are escalating and mark the status as escalated by including the tag [ESCALATE] in your response.
       ```
    5. Call Google Gemini API.
    6. Send Gemini's response back to the customer via Telegram Bot API (`sendMessage`).
    7. Save both messages to the `Message` table.

### 3. Escalation Workflow
- If Gemini determines an escalation is needed, it includes a specific tag (e.g., `[ESCALATE]`) in its response.
- The backend detects this tag, updates the `Conversation.status` to `ESCALATED`, and strips the tag before sending the message to the user.
- The Business Dashboard highlights escalated chats for the owner to intervene.

## API Integration Details
- **Google Gemini API**: Used for generating context-aware responses.
- **Telegram Bot API**: Used for sending/receiving messages. Requires creating a bot via @BotFather.
