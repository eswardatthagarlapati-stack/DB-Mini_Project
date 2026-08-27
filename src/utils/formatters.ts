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
  const diff = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
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
  badge: string;
  color: string;
  category: 'dry' | 'irrigation-zone' | 'moist';
} {
  if (pct < dry) {
    return {
      label: 'DRY — IRRIGATION REQUIRED',
      badge: 'DRY',
      color: 'var(--red-400)',
      category: 'dry',
    };
  }
  if (pct < moist) {
    return {
      label: 'IRRIGATION ZONE',
      badge: 'MODERATE',
      color: 'var(--amber-400)',
      category: 'irrigation-zone',
    };
  }
  return {
    label: 'MOIST — SUFFICIENT',
    badge: 'MOIST',
    color: 'var(--green-400)',
    category: 'moist',
  };
}

// ─── Tank status ──────────────────────────────────────────────────
export function tankTier(level: number, sensorError: boolean): {
  tier: 'GOOD' | 'MODERATE' | 'LOW' | 'CRITICAL' | 'UNAVAILABLE';
  color: string;
  desc: string;
  isLow: boolean;
} {
  if (sensorError) {
    return {
      tier: 'UNAVAILABLE',
      color: 'var(--amber-400)',
      desc: 'HC-SR04 signal not detected',
      isLow: false,
    };
  }
  if (level >= 70) {
    return {
      tier: 'GOOD',
      color: 'var(--green-400)',
      desc: 'Rainwater available for irrigation',
      isLow: false,
    };
  }
  if (level >= 40) {
    return {
      tier: 'MODERATE',
      color: 'var(--primary-400)',
      desc: 'Adequate storage level',
      isLow: false,
    };
  }
  if (level >= 20) {
    return {
      tier: 'LOW',
      color: 'var(--amber-400)',
      desc: 'Approaching low threshold — backup ready',
      isLow: true,
    };
  }
  return {
    tier: 'CRITICAL',
    color: 'var(--red-400)',
    desc: 'Rainwater depleted — backup water required',
    isLow: true,
  };
}

export function tankStatus(level: number, lowThreshold: number, sensorError: boolean): {
  label: string;
  color: string;
  isLow: boolean;
} {
  const tier = tankTier(level, sensorError);
  return {
    label: tier.tier === 'UNAVAILABLE' ? 'Tank level unavailable' : tier.desc,
    color: tier.color,
    isLow: tier.isLow || level <= lowThreshold,
  };
}
