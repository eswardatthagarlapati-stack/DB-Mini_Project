// ─── Utility: format uptime seconds into human-readable string ──
export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs < 24) return `${hrs}h ${remMins}m`;
  const days = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  return `${days}d ${remHrs}h`;
}

// ─── Format a duration in seconds ────────────────────────────────
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

// ─── Format time since a Date ────────────────────────────────────
export function formatTimeSince(date: Date | null): string {
  if (!date) return 'Never';
  const diff = Math.round((Date.now() - date.getTime()) / 1000);
  if (diff < 2) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ─── Format a timestamp as HH:MM:SS ─────────────────────────────
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour12: false });
}

// ─── Clamp a value between min and max ───────────────────────────
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ─── Soil moisture status ─────────────────────────────────────────
export function soilStatus(pct: number, dry: number, moist: number): {
  label: string;
  color: string;
} {
  if (pct < dry) return { label: 'Dry — Irrigation Needed', color: 'var(--amber-400)' };
  if (pct < moist) return { label: 'Irrigation Zone', color: 'var(--primary-400)' };
  return { label: 'Moist — Irrigation OK', color: 'var(--green-400)' };
}

// ─── Tank status ──────────────────────────────────────────────────
export function tankStatus(level: number, lowThreshold: number, sensorError: boolean): {
  label: string;
  color: string;
  isLow: boolean;
} {
  if (sensorError) return { label: 'Tank level unavailable', color: 'var(--amber-400)', isLow: false };
  if (level <= 0) return { label: 'Tank empty', color: 'var(--red-400)', isLow: true };
  if (level <= lowThreshold) return { label: 'Rainwater low — backup available', color: 'var(--amber-400)', isLow: true };
  return { label: 'Rainwater available', color: 'var(--green-400)', isLow: false };
}
