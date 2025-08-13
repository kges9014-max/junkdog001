'use client';

import { useEffect, useMemo, useState } from 'react';

type Item = {
  id: string;
  type: 'track' | 'movie' | string;
  title: string;
  artist_or_director?: string;
  year?: number;
  genres?: string[];
  moods?: string[];
  poster_url?: string;
  play_url?: string;
};

type DecadeTag = '90s-' | '00s–10s' | '20s+';

const PROFILE_KEY = 'pg_profile';
const PICKS_KEY = 'pg_picks';

// ---- decade mapping（三段）----
const toDecade = (year?: number): DecadeTag => {
  if (!year) return '90s-';
  if (year >= 2020) return '20s+';
  if (year >= 2000) return '00s–10s';
  return '90s-';
};

// ---- 可重現的洗牌（seeded shuffle）----
function shuffleWithSeed<T>(arr: T[], seed: number) {
  const a = arr.slice();
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const j = Math.floor(r * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- 讀／寫 picks ----
function loadPicks(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PICKS_KEY) || '[]');
  } catch {
    return [];
  }
}
function savePicks(ids: string[]) {
  localStorage.setItem(PICKS_KEY, JSON.stringify(ids));
  // 廣播 storage，讓其它元件（像右下角面板）即時同步
  window.dispatchEvent(
    new StorageEvent('storage', { key: PICKS_KEY, newValue: JSON.stringify(ids) })
  );
}

export default function ResultsGrid() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // 收藏 & 只看收藏
  const [picks, setPicks] = useState<string[]>([]);
  const [onlyPicks, setOnlyPicks] = useState(false);

  // profile 與隨機 seed
  const [profile, setProfile] = useState<any>({});
  const [shuffleSeed, setShuffleSeed] = useState<number | null>(null);

  // ---- 讀資料 ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/data/items.json', { cache: 'no-store' });
        const data: Item[] = await res.json();
        if (!mounted) return;
        setItems(data);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ---- 讀取初始 profile / picks 與監聽 storage ----
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
      setProfile(p);
      if (!p.decades || p.decades.length === 0) {
        // I don't care（年代為空）=> 進入隨機模式
        setShuffleSeed(Date.now());
      }
    } catch {}

    setPicks(loadPicks());

    const onStorage = (e: StorageEvent) => {
      if (e.key === PROFILE_KEY && e.newValue) {
        try {
          const p = JSON.parse(e.newValue);
          setProfile(p);
          if (!p.decades || p.decades.length === 0) {
            setShuffleSeed(Date.now());
          } else {
            setShuffleSeed(null);
          }
        } catch {}
      }
      if (e.key === PICKS_KEY && e.newValue) {
        try {
          setPicks(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ---- 切換收藏 ----
  function togglePick(id: string) {
    setPicks((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      savePicks(next);
      return next;
    });
  }

  // ---- 套用年代過濾與 I don't care 隨機 ----
  const viewItems = useMemo(() => {
    let base = items.slice();

    // 只看收藏
    if (onlyPicks) {
      base = base.filter((it) => picks.includes(it.id));
    }

    // 年代三段過濾（profile.decades 由 PillGate 寫入）
    const decades: string[] = profile?.decades || [];
    if (decades.length > 0) {
      base = base.filter((it) => decades.includes(toDecade(it.year)));
    }

    // I don't care：年代為空 => 進入隨機排序
    if (decades.length === 0 && shuffleSeed != null) {
      base = shuffleWithSeed(base, shuffleSeed);
    }

    return base;
  }, [items, picks, onlyPicks, profile, shuffleSeed]);

  if (loading) {
    return (
      <div className="py-10 text-center text-white/70">
        loading tracks…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 控制列（只看收藏） */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2 select-none cursor-pointer">
            <input
              type="checkbox"
              className="accent-emerald-400"
              checked={onlyPicks}
              onChange={(e) => setOnlyPicks(e.target.checked)}
            />
            <span className="text-white/80">only my picks</span>
          </label>
          {/* 顯示目前年代條件 */}
          <span className="text-white/40">
            {Array.isArray(profile?.decades) && profile.decades.length > 0
              ? `decades: ${profile.decades.join(', ')}`
              : 'decades: (random)'}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {viewItems.map((it) => {
          const picked = picks.includes(it.id);
          return (
            <div
              key={it.id}
              className="bg-zinc-900/40 rounded-xl border border-white/10 overflow-hidden"
            >
              {/* poster */}
              {it.poster_url ? (
                <img
                  src={it.poster_url}
                  alt={it.title}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-square grid place-items-center bg-zinc-800/40">
                  <span className="text-white/30 text-sm">no image</span>
                </div>
              )}

              {/* meta */}
              <div className="p-4 space-y-1">
                <div className="text-white font-medium truncate">{it.title}</div>
                <div className="text-white/60 text-sm truncate">
                  {it.artist_or_director || it.type}{' '}
                  {it.year ? `• ${it.year}` : null}
                </div>
                <div className="flex gap-2 pt-3">
                  {it.play_url && (
                    <a
                      href={it.play_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
                    >
                      ▶ play
                    </a>
                  )}
                  <button
                    onClick={() => togglePick(it.id)}
                    className={`px-3 py-1 rounded text-sm ${
                      picked
                        ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {picked ? '✓ added' : '+ add'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {viewItems.length === 0 && (
        <div className="py-12 text-center text-white/60">
          no results. try changing your filters.
        </div>
      )}
    </div>
  );
}
