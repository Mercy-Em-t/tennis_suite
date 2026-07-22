import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireTournamentAccess } from '@/lib/auth/require-auth';
import exceljs from 'exceljs';
import { logger } from '@/lib/logger';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Verify access
  const authResult = await requireTournamentAccess(id, ['HOST', 'ADMIN', 'DIRECTOR']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id }
    });

    if (!tournament) {
      return new NextResponse('Tournament not found', { status: 404 });
    }

    // Determine valid categories
    let validCategories = ['Open'];
    if (tournament.categories) {
      try {
        const parsed = JSON.parse(tournament.categories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          validCategories = parsed;
        }
      } catch (e) {
        // Fallback
      }
    }

    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet('Roster');

    // Define Columns
    sheet.columns = [
      { header: 'Team Name', key: 'teamName', width: 25 },
      { header: 'Player 1 Name', key: 'p1Name', width: 20 },
      { header: 'Player 1 Email', key: 'p1Email', width: 25 },
      { header: 'Player 2 Name', key: 'p2Name', width: 20 },
      { header: 'Player 2 Email', key: 'p2Email', width: 25 },
      { header: 'Category', key: 'category', width: 25 },
    ];

    // Style the Header Row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Apply Data Validation to the Category Column (F)
    const categoryValidationList = `"${validCategories.join(',')}"`;

    for (let i = 2; i <= 500; i++) {
      sheet.getCell(`F${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [categoryValidationList],
        showErrorMessage: true,
        errorTitle: 'Invalid Category',
        error: 'Please select a valid category from the dropdown.'
      };
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const sanitizedName = tournament.name.replace(/[^a-zA-Z0-9 ]/g, '').trim();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${sanitizedName} - Roster Template.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    });

  } catch (error) {
    logger.error('Failed to generate excel template', {}, error as Error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
