import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { signToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user if not exists for MVP dev ease, or return 401
      // MVP behavior: if the user types any email we haven't seen, we should return error.
      // But for testing ease, let's just let it return 401.
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // MVP: No real password check, just simulating login
    const token = await signToken({ id: user.id, role: user.role });

    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, role: user.role } 
    });
    
    // Set HTTP-only secure cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('[auth/login]', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
