import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    if (params.id.startsWith('mock-sandbox-')) {
      return NextResponse.json({ success: true, message: 'Category added in Sandbox mode.' });
    }

    const { category } = await request.json();

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const team = await prisma.team.findFirst({
      where: {
        tournamentId: params.id,
        players: { some: { id: payload.sub } }
      },
      include: {
        tournament: true
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Not registered in this tournament' }, { status: 403 });
    }

    if (!team.tournament.allowMultiCategory) {
       return NextResponse.json({ error: 'Tournament does not allow multiple categories.' }, { status: 400 });
    }

    let existingCategories: string[] = [];
    try {
      existingCategories = JSON.parse(team.categories || '[]');
    } catch (e) {
      existingCategories = [];
    }

    if (existingCategories.includes(category)) {
       return NextResponse.json({ error: 'Already registered for this category.' }, { status: 400 });
    }

    if (existingCategories.length >= 3) {
        return NextResponse.json({ error: 'Maximum of 3 categories allowed.' }, { status: 400 });
    }

    existingCategories.push(category);

    await prisma.team.update({
      where: { id: team.id },
      data: {
        categories: JSON.stringify(existingCategories)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Category added successfully.'
    });

  } catch (error) {
    console.error('[player/tournaments/categories/POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
