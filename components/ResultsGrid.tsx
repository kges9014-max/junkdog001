'use client';
import { useEffect, useMemo, useState } from 'react';
import { Item, Profile } from '@/lib/types';
import { getProfile, addPick, hasPick, removePick, getPicks } from '@/lib/storage';
import { rank } from '@/lib/scoring';

export default function ResultsGrid(){
  const [items, setItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<Profile>({ pills:[], particles:[], decades:[] });
  const [onlyMine, setOnlyMine] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch('/data/items.json', { cache: 'no-store' });
        if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        if(!Array.isArray(data)) throw new Error('items.json must be an array');
        setItems(data);
      }catch(err:any){
        console.error('Failed to load items.json', err);
        setError('讀取 /data/items.json 失敗。請確認檔案在 public/data/items.json，且 JSON 格式正確（陣列、逗號完整、字串加雙引號）。');
        setItems([]);
      }
    }
    load();
    setProfile(getProfile());
  },[]);

  const picks = getPicks();
  const ranked = useMemo(()=>rank(items, profile), [items, profile]);
  const list = onlyMine ? ranked.filter(i=>picks.includes(i.id)) : ranked.slice(0,12);

  return (
    <div className="max-w-6xl mx-auto p-4">
      {error && (
        <div className="mb-4 p-3 rounded border border-red-500/40 bg-red-500/10 text-sm">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {profile.pills.map(p=> <span key={p} className="px-2 py-1 text-xs rounded border border-white/20">{p}</span>)}
          {!!profile.decades.length && <span className="px-2 py-1 text-xs rounded border border-white/20">{profile.decades.join(',')}</span>}
        </div>
        <label className="text-xs flex items-center gap-2 opacity-80">
          <input type="checkbox" checked={onlyMine} onChange={e=>setOnlyMine(e.target.checked)} />
          only my picks
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {list.map(it=> <Card key={it.id} item={it}/>) }
      </div>
    </div>
  );
}

function Card({ item }: { item: Item }){
  const picked = hasPick(item.id);
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <img src={item.poster_url} alt={item.title} className="w-full h-40 object-cover rounded-md mb-2" />
      <div className="text-sm font-semibold line-clamp-1">{item.title}</div>
      <div className="text-xs text-white/70 line-clamp-1">{item.artist_or_director} • {item.year}</div>
      <div className="flex gap-2 mt-3">
        <a href={item.play_url} target="_blank" className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20">▶ play</a>
        {picked ? (
          <button onClick={()=>removePick(item.id)} className="px-2 py-1 text-xs rounded border border-white/30">✓ added</button>
        ) : (
          <button onClick={()=>addPick(item.id)} className="px-2 py-1 text-xs rounded bg-neon/20 hover:bg-neon/30">＋ add</button>
        )}
      </div>
    </div>
  );
}
