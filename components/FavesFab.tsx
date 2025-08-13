'use client';

import { useEffect, useMemo, useState } from 'react';

type Item = {
  id: string;
  type: 'track' | 'movie' | string;
  title: string;
  artist_or_director?: string;
  year?: number;
  poster_url?: string;
  play_url?: string;
};

const PICKS_KEY = 'pg_picks';

function loadPicks(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PICKS_KEY) || '[]');
  } catch {
    return [];
  }
}
function savePicks(ids: string[]) {
  localStorage.setItem(PICKS_KEY, JSON.stringify(ids));
  // 同步其它元件
  window.dispatchEvent(
    new StorageEvent('storage', { key: PICKS_KEY, newValue: JSON.stringify(ids) })
  );
}

// 把 open.spotify.com/track/{id} 轉成 spotify:track:{id}
function toSpotifyUri(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/);
  return m ? `spotify:track:${m[1]}` : null;
}

export default function FavesFab() {
  const [open, setOpen] = useState(false);
  const [picks, setPicks] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // 讀 items.json
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/data/items.json', { cache: 'no-store' });
        const data: Item[] = await res.json();
        if (!mounted) return;
        setItems(data);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 讀 picks & 監聽 storage
  useEffect(() => {
    setPicks(loadPicks());
    const onStorage = (e: StorageEvent) => {
      if (e.key === PICKS_KEY && e.newValue) {
        try {
          setPicks(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 以 picks 次序組回完整 item
  const pickItems = useMemo(() => {
    if (!picks.length || !items.length) return [];
    const map = new Map(items.map((it) => [it.id, it]));
    return picks.map((id) => map.get(id)).filter(Boolean) as Item[];
  }, [picks, items]);

  function removeOne(id: string) {
    setPicks((prev) => {
      const next = prev.filter((x) => x !== id);
      savePicks(next);
      return next;
    });
  }
  function clearAll() {
    savePicks([]);
    setPicks([]);
  }

  async function copyUrls() {
    const urls = pickItems
      .map((it) => it.play_url)
      .filter(Boolean)
      .join('\n');
    await navigator.clipboard.writeText(urls);
    setCopied('URLs copied');
    setTimeout(() => setCopied(null), 1400);
  }

  async function copyUris() {
    const uris = pickItems
      .map((it) => toSpotifyUri(it.play_url || ''))
      .filter(Boolean)
      .join('\n');
    await navigator.clipboard.writeText(uris);
    setCopied('Spotify URIs copied');
    setTimeout(() => setCopied(null), 1400);
  }

  return (
    <>
      {/* 浮動按鈕 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 px-4 h-12 shadow-lg backdrop-blur"
        title="My list"
      >
        <span className="font-medium">my list</span>
        <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-400/30 text-xs">
          {picks.length}
        </span>
      </button>

      {/* 面板 */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-zinc-950/95 border-l border-white/10 overflow-y-auto">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="text-white/90 font-medium">My list</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyUrls}
                  className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
                >
                  Copy playlist (URLs)
                </button>
                <button
                  onClick={copyUris}
                  className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
                >
                  Copy Spotify URIs
                </button>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {copied && (
              <div className="px-4 py-2 text-xs text-emerald-300">{copied}</div>
            )}

            <div className="p-4 space-y-3">
              {pickItems.length === 0 && (
                <div className="text-white/60 text-sm">
                  No items yet. Click “+ add” on any card.
                </div>
              )}

              {pickItems.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 p-2 rounded border border-white/10 bg-zinc-900/30"
                >
                  <img
                    src={it.poster_url || ''}
                    alt={it.title}
                    className="w-12 h-12 rounded object-cover bg-zinc-800/60"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-white truncate">{it.title}</div>
                    <div className="text-white/60 text-xs truncate">
                      {it.artist_or_director || it.type}
                      {it.year ? ` • ${it.year}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => removeOne(it.id)}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs"
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
