// lib/faves.ts
export const FAVES_KEY = 'pg_picks'; // 唯一 key

export const loadFaves = (): string[] =>
  JSON.parse(localStorage.getItem(FAVES_KEY) ?? '[]');

export const saveFaves = (ids: string[]) => {
  localStorage.setItem(FAVES_KEY, JSON.stringify(ids));
  // 廣播，讓其它元件即時更新
  window.dispatchEvent(
    new StorageEvent('storage', { key: FAVES_KEY, newValue: JSON.stringify(ids) })
  );
};

export const toggleFave = (id: string): string[] => {
  const set = new Set(loadFaves());
  set.has(id) ? set.delete(id) : set.add(id);
  const arr = Array.from(set);
  saveFaves(arr);
  return arr;
};
