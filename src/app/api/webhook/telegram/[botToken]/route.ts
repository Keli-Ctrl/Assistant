import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateGeminiResponse } from '@/lib/gemini';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botToken: string }> }
) {
  const { botToken } = await params;
  const body = await request.json();

  console.log('Telegram Webhook Body:', JSON.stringify(body, null, 2));

  const message = body.message;
  if (!message || !message.text) {
    return NextResponse.json({ status: 'ok' });
  }

  const chatId = message.chat.id.toString();
  const text = message.text;

  try {
    // 1. Fetch business details by bot token
    const business = await prisma.business.findUnique({
      where: { telegramBotToken: botToken },
    });

    if (!business) {
      console.error(`Business not found for botToken: ${botToken}`);
      return NextResponse.json({ status: 'ok' });
    }

    // 2. Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        businessId_telegramChatId: {
          businessId: business.id,
          telegramChatId: chatId,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId: business.id,
          telegramChatId: chatId,
          status: 'ACTIVE',
        },
      });
    }

    // 3. Save customer message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'CUSTOMER',
        content: text,
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

    // 5. Construct System Instruction
    const systemInstruction = `
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
    const aiResponse = await generateGeminiResponse(systemInstruction, formattedHistory);

    // 7. Check for escalation
    let cleanResponse = aiResponse;
    if (aiResponse.includes('[ESCALATE]')) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { status: 'ESCALATED' },
      });
      cleanResponse = aiResponse.replace(/\[ESCALATE\]/g, '').trim();
    }

    // 8. Send Telegram response
    await sendTelegramMessage(botToken, chatId, cleanResponse);

    // 9. Save AI response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'BOT',
        content: cleanResponse,
      },
    });

  } catch (error) {
    console.error('Error processing Telegram message:', error);
  }

  return NextResponse.json({ status: 'ok' });
}
