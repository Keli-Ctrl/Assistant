import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const businesses = await prisma.business.findMany()
    return NextResponse.json(businesses)
  } catch (error) {
    console.error('GET /api/business error:', error)
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, services, prices, operatingHours, location, telegramBotToken, telegramBotUsername, ownerId } = body
    
    const business = await prisma.business.create({
      data: {
        name,
        description,
        services,
        prices,
        operatingHours,
        location,
        telegramBotToken,
        telegramBotUsername,
        ownerId: ownerId || null,
      },
    })
    
    return NextResponse.json(business, { status: 201 })
  } catch (error) {
    console.error('POST /api/business error:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}
