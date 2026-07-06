import { useEffect, useRef, useState } from 'react';
import { TennisScoreState, createInitialScoreState } from '@/lib/engine/scoring';

export interface LiveMatchData {
  matchId: string;
  scoreState: TennisScoreState;
  teamA: { id: string; name: string };
  teamB: { id: string; name: string };
  status: string;
}

/**
 * useLiveMatch — SSE-backed real-time match hook.
 *
 * Strategy:
 * 1. On mount, fetch the latest state via REST (/api/broadcast/latest) for
 *    instant hydration — no blank screen on load.
 * 2. Open an EventSource connection to /api/broadcast/sse.
 * 3. Apply incoming `score_update` events to replace state atomically.
 * 4. Reconnect automatically on disconnect (EventSource handles this natively).
 */
export function useLiveMatch() {
  const [data, setData] = useState<LiveMatchData | null>(null);
  const [connected, setConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);
  const lastEventTimeRef = useRef<number>(0); // initialised to 0; updated inside effects only
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Step 1: Hydrate immediately with REST
    fetch('/api/broadcast/latest')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.matchId) {
          let parsed: TennisScoreState = createInitialScoreState();
          try { parsed = typeof d.scoreState === 'string' ? JSON.parse(d.scoreState) : d.scoreState; } catch(e) {}

          setData({
            matchId: d.matchId,
            scoreState: parsed,
            teamA: d.teamA || { id: '', name: 'Team A' },
            teamB: d.teamB || { id: '', name: 'Team B' },
            status: d.status
          });
        }
      })
      .catch(() => {}); // Fail silently — SSE will correct state

    // Step 2: Open SSE connection
    const es = new EventSource('/api/broadcast/sse');
    esRef.current = es;

    es.addEventListener('open', () => setConnected(true));

    es.addEventListener('score_update', (event: MessageEvent) => {
      const now = Date.now();
      setLatencyMs(now - lastEventTimeRef.current);
      lastEventTimeRef.current = now;

      try {
        const payload = JSON.parse(event.data) as LiveMatchData;
        setData(payload);
      } catch (e) {}
    });

    es.addEventListener('error', () => {
      setConnected(false);
      // EventSource auto-reconnects — no manual logic needed
    });

    return () => {
      es.close();
      setConnected(false);
    };
  }, []);

  return { data, connected, latencyMs };
}
