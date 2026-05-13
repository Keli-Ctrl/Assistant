import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { generateAIResponse } from '@/lib/claude';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse(null, { status: 403 });
    }
  }

  return new NextResponse(null, { status: 400 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const body = JSON.parse(rawBody);

  // Signature verification
  const signature = request.headers.get('x-hub-signature-256');
  if (APP_SECRET && signature) {
    const elements = signature.split('=');
    const signatureHash = elements[1];
    const expectedHash = crypto
      .createHmac('sha256', APP_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signatureHash !== expectedHash) {
      console.warn('Webhook signature mismatch');
      // In production, you should return 403
    }
  }

  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];
  const metadata = value?.metadata;

  if (message && metadata) {
    const from = message.from; // Customer phone number
    const messageBody = message.text?.body;
    const phoneNumberId = metadata.phone_number_id; // Business WhatsApp ID

    if (!messageBody) return NextResponse.json({ status: 'ok' });

    try {
      // 1. Fetch business details
      const business = await prisma.business.findUnique({
        where: { whatsappNumberId: phoneNumberId },
      });

      if (!business) {
        console.error(`Business not found for phoneNumberId: ${phoneNumberId}`);
        return NextResponse.json({ status: 'ok' });
      }

      // 2. Find or create conversation
      let conversation = await prisma.conversation.findUnique({
        where: {
          businessId_customerPhone: {
            businessId: business.id,
            customerPhone: from,
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            businessId: business.id,
            customerPhone: from,
            status: 'ACTIVE',
          },
        });
      }

      // 3. Save customer message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: 'CUSTOMER',
          content: messageBody,
        },
      });

      // 4. Fetch conversation history (last 10 messages)
      const history = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });

      const formattedHistory = history
        .reverse()
        .map((msg) => ({
          role: msg.sender === 'CUSTOMER' ? ('user' as const) : ('assistant' as const),
          content: msg.content,
        }));

      // 5. Construct System Prompt
      const systemPrompt = `
You are an AI assistant for ${business.name}.
Description: ${business.description || 'N/A'}
Services: ${business.services || 'N/A'}
Prices: ${business.prices || 'N/A'}
Operating Hours: ${business.operatingHours || 'N/A'}
Location: ${business.location || 'N/A'}

${business.systemPromptOverride || ''}

Goal: Help the customer based on the business details provided above. 
If they ask for something you can't handle or specifically ask for a human, include the tag "[ESCALATE]" in your response and explain that a human will take over shortly.
Keep responses concise and helpful.
`.trim();

      // 6. Generate AI response
      const aiResponse = await generateAIResponse(systemPrompt, formattedHistory);

      // 7. Check for escalation
      let updatedStatus = conversation.status;
      if (aiResponse.includes('[ESCALATE]')) {
        updatedStatus = 'ESCALATED';
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { status: 'ESCALATED' },
        });
      }

      // Clean the response (remove tag)
      const cleanResponse = aiResponse.replace(/\[ESCALATE\]/g, '').trim();

      // 8. Send WhatsApp response
      await sendWhatsAppMessage(phoneNumberId, from, cleanResponse);

      // 9. Save AI response
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: 'BOT',
          content: cleanResponse,
        },
      });

    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
    }
  }

  return NextResponse.json({ status: 'ok' });
}
