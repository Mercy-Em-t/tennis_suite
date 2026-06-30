import BroadcasterOverlay from '@/components/BroadcasterOverlay';

/**
 * Pillar 5: The Broadcaster & Cinematic Interface
 * Upgraded from SWR polling to SSE push via useLiveMatch hook.
 * This page is the consumer of the live scoring telemetry pipeline.
 */
export default function BroadcastPage() {
  return <BroadcasterOverlay />;
}
