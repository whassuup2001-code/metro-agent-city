import { useState, useEffect, useRef } from 'react';

export function useSafeTelemetry() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const lastJsonRef = useRef<string>('');

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const fetchLiveTelemetry = async () => {
      try {
        const rawUrl = (import.meta as any).env?.VITE_LIVE_TELEMETRY_URL || '';
        // If empty or relative, default safely to local endpoint
        const targetEndpoint = rawUrl.startsWith('http') 
          ? `${rawUrl.replace(/\/$/, '')}/api/public/telemetry`
          : '/api/public/telemetry';

        const res = await fetch(targetEndpoint, {
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
          }
        });

        if (!res.ok) return;

        const textData = await res.text();
        
        // Prevent infinite re-renders: only update state if JSON actually changed
        if (textData !== lastJsonRef.current) {
          lastJsonRef.current = textData;
          const parsed = JSON.parse(textData);
          if (isMounted && parsed.success) {
            setTelemetry(parsed);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[Telemetry] Stream waiting for local engine...');
        }
      }
    };

    // Initial fetch + 4000ms gentle interval (prevents UI freeze)
    fetchLiveTelemetry();
    const intervalId = setInterval(fetchLiveTelemetry, 4000);

    return () => {
      isMounted = false;
      abortController.abort();
      clearInterval(intervalId);
    };
  }, []); // Strictly empty dependency array

  return telemetry;
}
