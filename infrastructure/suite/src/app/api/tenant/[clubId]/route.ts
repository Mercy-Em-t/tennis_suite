import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { clubId: string } }) {
  try {
    const club = await prisma.club.findUnique({
      where: { id: params.clubId }
    });

    if (!club) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // In a real application, we would return custom CSS variables 
    // or inject these into a global state provider for the React tree.
    return NextResponse.json({
      tenant: {
        name: club.name,
        primaryColor: club.primaryColor,
        logoUrl: club.logoUrl
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tenant configuration' }, { status: 400 });
  }
}
