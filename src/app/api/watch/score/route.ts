import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TENNIS_POINTS = ["0", "15", "30", "40", "AD"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, isBatch, events, action, forceOverride, score: overrideScore } = body;

    if (!matchId) {
      return NextResponse.json({ error: "Missing matchId" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Default starting state
    let score = { setsA: 0, setsB: 0, gamesA: 0, gamesB: 0, pointsA: "0", pointsB: "0", faults: 0, processedEventIds: [] as string[] };
    
    if (match.scoreState) {
      try {
        score = { ...score, ...JSON.parse(match.scoreState) };
        if (!score.processedEventIds) score.processedEventIds = [];
      } catch (e) {
        // ignore parse error, use defaults
      }
    }

    if (forceOverride && overrideScore) {
      // Split-brain resolution: Human forced override
      score = { ...overrideScore, processedEventIds: score.processedEventIds };
      await prisma.match.update({
        where: { id: matchId },
        data: {
          previousScoreState: match.scoreState,
          scoreState: JSON.stringify(score),
        },
      });
      return NextResponse.json({ success: true, score });
    }

    // A very basic prototype scoring engine just for the watch demo
    let currentServer = match.currentServer || match.teamAId;
    let serverIsA = currentServer === match.teamAId;

    const processAction = (act: string, evtId?: string) => {
      if (evtId && score.processedEventIds.includes(evtId)) return; // Idempotency check
      
      if (act === "POINT_SRV" || act === "POINT_RCV") {
        score.faults = 0; // reset faults
        const isServerPoint = act === "POINT_SRV";
        const winnerA = serverIsA ? isServerPoint : !isServerPoint;

        let pAIdx = TENNIS_POINTS.indexOf(score.pointsA);
        let pBIdx = TENNIS_POINTS.indexOf(score.pointsB);

        if (winnerA) {
          if (score.pointsA === "40" && score.pointsB === "40") {
            score.pointsA = "AD";
          } else if (score.pointsA === "AD" || (score.pointsA === "40" && score.pointsB !== "AD")) {
            score.gamesA += 1;
            score.pointsA = "0";
            score.pointsB = "0";
            serverIsA = !serverIsA;
          } else if (score.pointsB === "AD") {
            score.pointsB = "40";
          } else {
            score.pointsA = TENNIS_POINTS[pAIdx + 1] || "40";
          }
        } else {
          if (score.pointsB === "40" && score.pointsA === "40") {
            score.pointsB = "AD";
          } else if (score.pointsB === "AD" || (score.pointsB === "40" && score.pointsA !== "AD")) {
            score.gamesB += 1;
            score.pointsA = "0";
            score.pointsB = "0";
            serverIsA = !serverIsA;
          } else if (score.pointsA === "AD") {
            score.pointsA = "40";
          } else {
            score.pointsB = TENNIS_POINTS[pBIdx + 1] || "40";
          }
        }
      } else if (act === "FAULT") {
        score.faults = (score.faults || 0) + 1;
        if (score.faults >= 2) {
          score.faults = 0;
        }
      } else if (act === "UNDO") {
         if (match.previousScoreState) {
           score = JSON.parse(match.previousScoreState);
         }
      }

      if (evtId) {
        score.processedEventIds.push(evtId);
        // keep array small
        if (score.processedEventIds.length > 50) score.processedEventIds.shift();
      }
    };

    if (isBatch && events && Array.isArray(events)) {
      // Very basic split-brain detection: if we have more than 5 events in batch, and server already changed state recently.
      // A more robust system would compare expected revision hashes. For this implementation, we apply them in order.
      for (const evt of events) {
        processAction(evt.action, evt.eventId);
      }
    } else if (action) {
      processAction(action);
    } else {
      return NextResponse.json({ error: "Missing action or batch events" }, { status: 400 });
    }

    const nextCurrentServer = serverIsA ? match.teamAId : match.teamBId;

    await prisma.match.update({
      where: { id: matchId },
      data: {
        previousScoreState: match.scoreState,
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
