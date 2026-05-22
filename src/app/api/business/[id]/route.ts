import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const business = await prisma.business.findUnique({
      where: { id: id },
    })
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    return NextResponse.json(business)
  } catch (error) {
    console.error(`GET /api/business/${id} error:`, error)
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { name, description, services, prices, operatingHours, location, telegramBotToken, telegramBotUsername } = body
    
    const business = await prisma.business.update({
      where: { id: id },
      data: {
        name,
        description,
        services,
        prices,
        operatingHours,
        location,
        telegramBotToken,
        telegramBotUsername,
      },
    })
    
    return NextResponse.json(business)
  } catch (error) {
    console.error(`PUT /api/business/${id} error:`, error)
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}
