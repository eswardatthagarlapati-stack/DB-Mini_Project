// ============================================================
// Weather Service — Stub / Future-Ready
// Returns null for all fields until a real weather API is wired.
// ============================================================

import type { WeatherData } from '../types/ecoRain';

/**
 * Future: fetch weather from an external API (e.g. OpenWeatherMap).
 * Currently always returns null values — the UI displays "Coming Soon".
 */
export async function getWeather(_lat?: number, _lon?: number): Promise<WeatherData> {
  // TODO: Implement real weather API integration
  return {
    rainProbability: null,
    forecast: null,
    forecastTemperature: null,
    rainExpected: null,
  };
}
