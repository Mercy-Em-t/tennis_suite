import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function WatchHome() {
  // Fetch a match to score for the demo
  const match = await prisma.match.findFirst({
    orderBy: { createdAt: "desc" },
    include: { teamA: true, teamB: true }
  });

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full h-full text-center">
      <h1 className="text-xl font-bold text-cyan-400">Tennis Suite</h1>
      <p className="text-xs text-neutral-400 max-w-[200px]">
        Select an action on your wrist.
      </p>
      
      <div className="flex flex-col space-y-2 w-full max-w-[240px]">
        {match ? (
          <Link
            href={`/watch/score/${match.id}`}
            className="w-full bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-full py-3 px-4 text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <span>Score Match</span>
            <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full">
              LIVE
            </span>
          </Link>
        ) : (
          <div className="w-full bg-neutral-800 rounded-full py-3 px-4 text-sm font-semibold text-neutral-500">
            No Active Matches
          </div>
        )}
        
        <Link
          href="/watch/status"
          className="w-full bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-full py-3 px-4 text-sm font-semibold transition-colors"
        >
          Tournament Status
        </Link>
      </div>
    </div>
  );
}
