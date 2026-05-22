import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: id },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error(`GET /api/conversations/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status } = body;

    const conversation = await prisma.conversation.update({
      where: { id: id },
      data: { status },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error(`PATCH /api/conversations/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { content } = body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: id },
      include: {
        business: true,
      },
    });

    if (!conversation || !conversation.business) {
      return NextResponse.json({ error: 'Conversation or business not found' }, { status: 404 });
    }

    // 1. Send Telegram message
    if (conversation.business.telegramBotToken) {
       await sendTelegramMessage(
        conversation.business.telegramBotToken,
        conversation.telegramChatId,
        content
      );
    } else {
        return NextResponse.json({ error: 'Telegram configuration missing' }, { status: 400 });
    }

    // 2. Save human message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'HUMAN',
        content,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error(`POST /api/conversations/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
