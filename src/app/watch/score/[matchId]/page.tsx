import { WatchScoringPad } from "@/components/watch/WatchScoringPad";

export default async function WatchScorePage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-2">
      <WatchScoringPad matchId={matchId} />
    </div>
  );
}
