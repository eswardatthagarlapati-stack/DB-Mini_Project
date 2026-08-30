// ─── Theme management ─────────────────────────────────────────
// Stored in localStorage as 'ecorain_theme': 'light' | 'dark' | 'system'

export type ThemeMode = 'light' | 'dark' | 'system';

export function getSavedTheme(): ThemeMode {
  return (localStorage.getItem('ecorain_theme') as ThemeMode) ?? 'system';
}

export function saveTheme(mode: ThemeMode): void {
  localStorage.setItem('ecorain_theme', mode);
}

export function getEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function applyTheme(mode: ThemeMode): void {
  const effective = getEffectiveTheme(mode);
  document.documentElement.setAttribute('data-theme', effective);
}
