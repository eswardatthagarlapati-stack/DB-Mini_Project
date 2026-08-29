// ============================================================
// Rainwater Tank Geometry & Percentage Calculations
// ============================================================

export interface TankConfig {
  tankHeightCm: number;        // Total inner height of the tank in cm
  sensorOffsetCm: number;      // Distance from HC-SR04 sensor face to maximum water fill line
  minimumUsableLevelPct: number; // Low water threshold % below which Pump 2 is used
  tankCapacityLiters?: number; // Optional capacity for volumetric displays
}

export const DEFAULT_TANK_CONFIG: TankConfig = {
  tankHeightCm: 30,
  sensorOffsetCm: 2,
  minimumUsableLevelPct: 20,
  tankCapacityLiters: 100,
};

/**
 * Calculates the water level percentage (0-100%) from ultrasonic sensor distance.
 * 
 * Formula:
 * - maxWaterDepth = tankHeightCm - sensorOffsetCm
 * - currentWaterDepth = tankHeightCm - measuredDistanceCm
 * - percentage = (currentWaterDepth / maxWaterDepth) * 100
 * 
 * Returns -1 if distance is negative (sensor error/timeout).
 */
export function calculateTankPercentage(
  distanceCm: number,
  config: TankConfig = DEFAULT_TANK_CONFIG
): {
  percentage: number;
  waterDepthCm: number;
  isError: boolean;
  status: 'SUFFICIENT' | 'MODERATE' | 'LOW' | 'CRITICAL' | 'UNAVAILABLE';
  reason: string;
} {
  if (distanceCm < 0) {
    return {
      percentage: 0,
      waterDepthCm: 0,
      isError: true,
      status: 'UNAVAILABLE',
      reason: 'HC-SR04 Ultrasonic sensor echo not detected (check Pins D5/D6)',
    };
  }

  const { tankHeightCm, sensorOffsetCm, minimumUsableLevelPct } = config;
  const maxWaterDepth = Math.max(1, tankHeightCm - sensorOffsetCm);
  
  // Clamped distance
  const clampedDistance = Math.max(sensorOffsetCm, Math.min(tankHeightCm, distanceCm));
  const waterDepth = Math.max(0, tankHeightCm - clampedDistance);
  const rawPct = (waterDepth / maxWaterDepth) * 100;
  const percentage = Math.round(Math.min(100, Math.max(0, rawPct)));

  let status: 'SUFFICIENT' | 'MODERATE' | 'LOW' | 'CRITICAL' | 'UNAVAILABLE';
  let reason: string;

  if (percentage >= 70) {
    status = 'SUFFICIENT';
    reason = 'Rainwater is abundant. Pump 1 (Rainwater) is primary.';
  } else if (percentage >= 40) {
    status = 'MODERATE';
    reason = 'Rainwater is adequate. Pump 1 will be used for irrigation.';
  } else if (percentage >= minimumUsableLevelPct) {
    status = 'LOW';
    reason = `Rainwater is low (≤${minimumUsableLevelPct}%). Approaching backup switchover.`;
  } else {
    status = 'CRITICAL';
    reason = `Rainwater tank depleted (<${minimumUsableLevelPct}%). Pump 2 (Backup water) will be engaged.`;
  }

  return {
    percentage,
    waterDepthCm: Math.round(waterDepth * 10) / 10,
    isError: false,
    status,
    reason,
  };
}
