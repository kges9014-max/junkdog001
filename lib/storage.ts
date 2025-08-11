import { Profile } from './types';

const KEY_PROFILE = 'pg_profile';
const KEY_PICKS = 'pg_picks';

export function getProfile(): Profile {
  if (typeof window === 'undefined') return { pills: [], particles: [], decades: [] };
  try { return JSON.parse(localStorage.getItem(KEY_PROFILE) || '{}'); } catch {}
  return { pills: [], particles: [], decades: [] };
}
export function setProfile(p: Profile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_PROFILE, JSON.stringify(p));
}
export function getPicks(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY_PICKS) || '[]'); } catch {}
  return [];
}
export function addPick(id: string) {
  const s = new Set(getPicks()); s.add(id);
  localStorage.setItem(KEY_PICKS, JSON.stringify([...s]));
}
export function removePick(id: string) {
  const s = new Set(getPicks()); s.delete(id);
  localStorage.setItem(KEY_PICKS, JSON.stringify([...s]));
}
export function hasPick(id: string) { return getPicks().includes(id); }
