import { useEffect, useState } from 'react';

/**
 * Live clock string for Asia/Karachi (Pakistan).
 * @param {{ refreshMs?: number }} [options]
 */
export function usePakistanTime(options = {}) {
  const { refreshMs = 30_000 } = options;
  const [label, setLabel] = useState('');

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const tick = () => setLabel(formatter.format(new Date()));
    tick();
    const id = setInterval(tick, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  return label;
}
