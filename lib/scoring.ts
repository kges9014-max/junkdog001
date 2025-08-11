import { Item, Profile } from './types';

const pillMap: Record<string, Partial<Record<'genres'|'moods', string[]>>> = {
  red:   { genres: ['rock','hiphop','industrial'], moods: ['energetic','fast'] },
  blue:  { genres: ['lofi','ambient','dream_pop'], moods: ['mellow','calm'] },
  green: { genres: ['city_pop','funk','synthwave'], moods: ['retro','groovy'] },
  white: { genres: ['jazz','classical','piano'], moods: ['acoustic','minimal'] },
};

export function scoreItem(item: Item, profile: Profile) {
  let s = 0;
  const wants = new Set([
    ...(profile.pills.flatMap(p=>pillMap[p]?.genres||[])),
    ...(profile.pills.flatMap(p=>pillMap[p]?.moods||[])),
    ...profile.particles,
    ...profile.decades,
  ]);
  // genre/mood match
  item.genres.forEach(g => { if (wants.has(g)) s += 2; });
  item.moods.forEach(m => { if (wants.has(m)) s += 1; });
  // decade approx
  const decade = `${Math.floor(item.year/10)*10}s`;
  if (profile.decades.includes(decade)) s += 1.5;
  return s + Math.random()*0.5; // 少量隨機以增加多樣性
}

export function rank(items: Item[], profile: Profile) {
  return [...items].sort((a,b)=>scoreItem(b,profile)-scoreItem(a,profile));
}
