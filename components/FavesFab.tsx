'use client';
import { useEffect, useMemo, useState } from 'react';
import { loadFaves, saveFaves, FAVES_KEY } from '@/lib/faves';

type Item = {
  id: string;
  title: string;
  artist_or_director: string;
  play_url: string;
};

export default function FavesFab() {
  const [open, setOpen] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [all, setAll] = useState<Item[]>([]);

  // 讀收藏
  useEffect(() => {
    setIds(loadFaves());
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVES_KEY) setIds(loadFaves());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 讀全部歌曲資料（用 fetch 避免編譯期 import）
  useEffect(() => {
    fetch('/data/items.json')
      .then(r => r.json())
      .then(setAll)
      .catch(() => {});
  }, []);

  const list = useMemo(
    () => ids.map(id => all.find(x => x?.id === id)).filter(Boolean) as Item[],
    [ids, all]
  );

  const copyTitles = async () => {
    const lines = list.map(x => `${x.title} — ${x.artist_or_director}`);
    await navigator.clipboard.writeText(lines.join('\n'));
    alert(`Copied ${lines.length} titles`);
  };

  const copyUrls = async () => {
    await navigator.clipboard.writeText(list.map(x => x.play_url).join('\n'));
    alert(`Copied ${list.length} URLs`);
  };

  const clearAll = () => {
    saveFaves([]);
    setIds([]);
  };

  return (
    <>
      {/* 右下角圓鈕 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-emerald-500 text-white text-xl shadow-lg"
        aria-label="favorites"
      >
        {ids.length}
      </button>

      {/* 展開的清單面板 */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-zinc-900 p-4 rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">My picks ({ids.length})</h3>
              <div className="flex gap-2">
                <button onClick={copyTitles} className="px-2 py-1 rounded bg-zinc-800 text-zinc-100 text-xs">
                  Copy titles
                </button>
                <button onClick={copyUrls} className="px-2 py-1 rounded bg-zinc-800 text-zinc-100 text-xs">
                  Copy URLs
                </button>
                <button onClick={clearAll} className="px-2 py-1 rounded bg-zinc-700 text-zinc-100 text-xs">
                  Clear
                </button>
              </div>
            </div>
            <ul className="max-h-72 overflow-auto space-y-2">
              {list.map(x => (
                <li key={x.id} className="text-zinc-200">
                  {x.title} — <span className="text-zinc-400">{x.artist_or_director}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
