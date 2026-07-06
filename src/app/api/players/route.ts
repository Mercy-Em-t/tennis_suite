import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function GET(request: Request) {
  try {
    // Note: In production, we'd extract the user session here via next-auth or JWT
    // For this mock, we just fetch a random active player or generate mock profile
    const user = await prisma.user.findFirst({
      where: { role: 'PLAYER' }
    });

    if (user) {
      return NextResponse.json({ 
        success: true, 
        profile: {
          name: user.name,
          xp: 4500,
          level: 12,
          formIndex: 88,
          badges: ["Tournament Champion", "Sportsmanship Award"]
        }
      });
    }

    // Fallback if no users in DB
    return NextResponse.json({ 
      success: true, 
      profile: {
        name: "Roger F.",
        xp: 4500,
        level: 12,
        formIndex: 88,
        badges: ["Tournament Champion", "Sportsmanship Award"]
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch player profile' }, { status: 500 });
  }
}
