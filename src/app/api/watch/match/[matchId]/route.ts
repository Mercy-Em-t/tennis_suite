import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        teamA: true,
        teamB: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Safely parse score state
    let scoreObj = { setsA: 0, setsB: 0, gamesA: 0, gamesB: 0, pointsA: "0", pointsB: "0" };
    try {
      if (match.scoreState) {
        scoreObj = JSON.parse(match.scoreState);
      }
    } catch (e) {
      console.error("Failed to parse scoreState for match", match.id);
    }

    // Format minimal payload for watch
    // m: Match title (Team A v Team B)
    // s: Score summary (e.g. "3-2, 40-15")
    // srv: 1 if teamA serving, 2 if teamB serving, 0 if unknown
    const teamAName = match.placeholderA || match.teamA?.franchiseName || "TBD";
    const teamBName = match.placeholderB || match.teamB?.franchiseName || "TBD";
    
    let serving = 0;
    if (match.currentServer === match.teamAId && match.teamAId) serving = 1;
    if (match.currentServer === match.teamBId && match.teamBId) serving = 2;

    const payload = {
      id: match.id,
      m: `${teamAName} v ${teamBName}`,
      s: `${scoreObj.setsA}-${scoreObj.setsB}, ${scoreObj.gamesA}-${scoreObj.gamesB}, ${scoreObj.pointsA}-${scoreObj.pointsB}`,
      srv: serving,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching watch match data:", error);
    return NextResponse.json(
      { error: "Failed to fetch match data" },
      { status: 500 }
    );
  }
}
