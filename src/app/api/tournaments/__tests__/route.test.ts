import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createTournament } from '../route';
import { prisma } from '@/lib/prisma';
import * as auth from '@/lib/auth/require-auth';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    tournament: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth/require-auth', () => ({
  requireAuth: vi.fn()
}));

const createRequest = (body?: any) => {
  return new Request('http://localhost/api/tournaments', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: new Headers({ 'Content-Type': 'application/json' })
  });
};

describe('/api/tournaments route validation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('rejects the request with 400 if required fields are missing', async () => {
    (auth.requireAuth as any).mockResolvedValue({ id: 'host_1', role: 'HOST' });

    // Missing location, categories, etc.
    const invalidBody = {
      name: 'Summer Open',
      startDate: '2026-07-15',
      endDate: '2026-07-20',
      formatType: 'Round-Robin'
    };

    const req = createRequest(invalidBody);
    const res = await createTournament(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Location is required');
  });

  it('rejects chronological date range violation (endDate before startDate)', async () => {
    (auth.requireAuth as any).mockResolvedValue({ id: 'host_1', role: 'HOST' });

    const invalidBody = {
      name: 'Summer Open',
      startDate: '2026-07-20',
      endDate: '2026-07-15', // date violation
      location: 'Ace Club',
      formatType: 'Round-Robin',
      categories: "Men's Singles",
      numCourts: '2',
      surfaceType: 'Hard'
    };

    const req = createRequest(invalidBody);
    const res = await createTournament(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('End date cannot be before start date');
  });

  it('provisions the tournament and courts successfully with all details provided', async () => {
    (auth.requireAuth as any).mockResolvedValue({ id: 'host_1', role: 'HOST' });

    const mockTournament = {
      id: 'tourney_99',
      name: 'Summer Open',
      formatType: 'Round-Robin'
    };

    // Mock transaction output
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      return callback(prisma as any);
    });
    vi.mocked(prisma.tournament.create).mockResolvedValue(mockTournament as any);

    const validBody = {
      name: 'Summer Open',
      startDate: '2026-07-15',
      endDate: '2026-07-20',
      location: 'Ace Club',
      formatType: 'Round-Robin',
      categories: "Men's Singles",
      numCourts: '2',
      surfaceType: 'Hard'
    };

    const req = createRequest(validBody);
    const res = await createTournament(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.tournament.id).toBe('tourney_99');
    expect(prisma.tournament.create).toHaveBeenCalled();
  });
});
