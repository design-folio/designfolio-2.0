import { useEffect, useState, useRef } from 'react';
import { FlaskConical } from 'lucide-react';
import { UsageBadge } from '@/components/ui/bubble-button';
import { _getJobCredits } from '@/network/jobs';

export function CreditsWidget({ refreshKey = 0 }) {
  const [data, setData] = useState(null);
  const totalRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    _getJobCredits()
      .then((res) => {
        if (!cancelled) {
          const d = res.data;
          setData(d);
          if (totalRef.current === null) {
            totalRef.current = d?.total ?? d?.limit ?? d?.pool ?? d?.balance ?? null;
          }
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [refreshKey]);

  const balance = data?.balance ?? null;
  const total   = data?.total ?? data?.limit ?? data?.pool ?? totalRef.current;

  return (
    <UsageBadge
      icon={<FlaskConical className="w-3.5 h-3.5 opacity-70" />}
      planName="AI Balance"
      usage={balance ?? '—'}
      limit={total}
      tooltipContent={
        <p>{balance !== null ? `${balance} AI credits remaining.` : 'Loading…'}<br />Used for mock interviews &amp; scout chats.</p>
      }
    />
  );
}
