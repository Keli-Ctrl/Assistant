import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      telegramChatId: conv.telegramChatId,
      status: conv.status,
      lastMessage: conv.messages[0]?.content || 'No messages yet',
      updatedAt: conv.updatedAt,
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
