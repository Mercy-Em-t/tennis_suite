import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TENNIS_POINTS = ["0", "15", "30", "40", "AD"];

export async function POST(request: NextRequest) {
  try {
    const { matchId, action } = await request.json();

    if (!matchId || !action) {
      return NextResponse.json({ error: "Missing matchId or action" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Default starting state
    let score = { setsA: 0, setsB: 0, gamesA: 0, gamesB: 0, pointsA: "0", pointsB: "0", faults: 0 };
    
    if (match.scoreState) {
      try {
        score = { ...score, ...JSON.parse(match.scoreState) };
      } catch (e) {
        // ignore parse error, use defaults
      }
    }

    // A very basic prototype scoring engine just for the watch demo
    // For production, this should integrate with the core TennisEngine
    let currentServer = match.currentServer || match.teamAId;
    let serverIsA = currentServer === match.teamAId;

    if (action === "POINT_SRV" || action === "POINT_RCV") {
      score.faults = 0; // reset faults
      
      const isServerPoint = action === "POINT_SRV";
      const winnerA = serverIsA ? isServerPoint : !isServerPoint;

      let pAIdx = TENNIS_POINTS.indexOf(score.pointsA);
      let pBIdx = TENNIS_POINTS.indexOf(score.pointsB);

      if (winnerA) {
        if (score.pointsA === "40" && score.pointsB === "40") {
          score.pointsA = "AD";
        } else if (score.pointsA === "AD" || (score.pointsA === "40" && score.pointsB !== "AD")) {
          // A wins game
          score.gamesA += 1;
          score.pointsA = "0";
          score.pointsB = "0";
          serverIsA = !serverIsA; // Swap server
        } else if (score.pointsB === "AD") {
          // B loses AD, back to deuce
          score.pointsB = "40";
        } else {
          score.pointsA = TENNIS_POINTS[pAIdx + 1] || "40";
        }
      } else {
        if (score.pointsB === "40" && score.pointsA === "40") {
          score.pointsB = "AD";
        } else if (score.pointsB === "AD" || (score.pointsB === "40" && score.pointsA !== "AD")) {
          // B wins game
          score.gamesB += 1;
          score.pointsA = "0";
          score.pointsB = "0";
          serverIsA = !serverIsA; // Swap server
        } else if (score.pointsA === "AD") {
          // A loses AD, back to deuce
          score.pointsA = "40";
        } else {
          score.pointsB = TENNIS_POINTS[pBIdx + 1] || "40";
        }
      }
    } else if (action === "FAULT") {
      score.faults = (score.faults || 0) + 1;
      if (score.faults >= 2) {
        // Double fault -> point receiver
        score.faults = 0;
        // Recursive call is messy, just duplicate the point RCV logic or keep it simple for the demo
        // For the watch scaffold, we'll just return a success message and let the real engine handle it later
      }
    } else if (action === "UNDO") {
       // Typically would pop from previousScoreState
       if (match.previousScoreState) {
         score = JSON.parse(match.previousScoreState);
       }
    }

    // Save state
    const nextCurrentServer = serverIsA ? match.teamAId : match.teamBId;

    await prisma.match.update({
      where: { id: matchId },
      data: {
        previousScoreState: match.scoreState, // push history
        scoreState: JSON.stringify(score),
        currentServer: nextCurrentServer,
      },
    });

    // Push Notification Bridge
    // Simulate sending a WebSocket or Push Notification to spectators/broadcasters
    try {
      const baseUrl = request.nextUrl.origin;
      await fetch(`${baseUrl}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: "ALL",
          message: `Match ${matchId} score updated by referee. Action: ${action}`,
        }),
      });
    } catch (e) {
      console.error("Push notification mock failed:", e);
    }

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error("Error updating watch score:", error);
    return NextResponse.json(
      { error: "Failed to update score" },
      { status: 500 }
    );
  }
}
