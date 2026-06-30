import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { fanEmail, tournamentId, predictedWinnerId } = await request.json();

    const prediction = await prisma.fanPrediction.create({
      data: { fanEmail, tournamentId, predictedWinnerId }
    });

    return NextResponse.json({ success: true, prediction, message: 'Prediction locked in!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit prediction' }, { status: 400 });
  }
}
