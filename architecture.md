# System Architecture: WhatsApp AI SaaS for Businesses

## Overview
A SaaS platform where businesses can sign up, provide their details, and deploy an AI-powered WhatsApp bot to handle customer inquiries.

## Tech Stack
- **Frontend**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes / Node.js
- **Database**: PostgreSQL (with Prisma ORM)
- **Authentication**: NextAuth.js
- **AI Integration**: Claude API (Anthropic)
- **WhatsApp Integration**: WhatsApp Business API
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
- `whatsappNumberId`: String (ID provided by Meta)
- `whatsappPhoneNumber`: String
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
- `customerPhone`: String
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
- **Onboarding**: Form to collect business details.
- **Chat Viewer**: Real-time view of AI-customer conversations.
- **Settings**: Manage WhatsApp API credentials and custom prompt tweaks.

### 2. WhatsApp Webhook Handler
- Receives `POST` requests from WhatsApp Business API.
- Logic:
    1. Verify webhook signature.
    2. Extract customer message and business identifier (phone number).
    3. Fetch `Business` details and `Conversation` history (last 10 messages).
    4. Construct System Prompt:
       ```
       You are an AI assistant for [Business Name].
       Services: [Services]
       Prices: [Prices]
       Hours: [Hours]
       Location: [Location]
       Context: [Business Description]
       
       Goal: Help the customer. If they ask for something you can't handle or specifically ask for a human, say you are escalating and mark the status as escalated.
       ```
    5. Call Claude API.
    6. Send Claude's response back to the customer via WhatsApp API.
    7. Save both messages to the `Message` table.

### 3. Escalation Workflow
- If Claude determines an escalation is needed, it includes a specific tag or flag in its internal reasoning or response.
- The backend updates the `Conversation.status` to `ESCALATED`.
- The Business Dashboard highlights escalated chats for the owner to intervene.

## API Integration Details
- **Claude API**: Used for generating context-aware responses.
- **WhatsApp API**: Used for sending/receiving messages. Requires a Meta Developer App and a verified WhatsApp Business Account.
