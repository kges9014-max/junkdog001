# README.md

> 一個極簡、無刷卡、非聊天的音樂精選 PWA。開場是「駭客任務藥丸」式的 30 秒體驗，選完（或跳過）直接進入清單挑喜歡：只剩兩個動作——＋收藏、▶播放。
>
> **超低門檻部署**：不需後端與資料庫，MVP 版將偏好與收藏存到 `localStorage`；曲目資料放在 `/data/items.json`。之後如要雲端同步，我們再加 Supabase。

## 快速開始

1. 下載或複製本專案到你的 Git 倉庫。
2. `npm i` 安裝依賴。
3. `npm run dev` 本地啟動。手機可用「加入主畫面」。
4. 要上線：把 repo 連到 **Vercel** 並 Deploy（零設定）。

## 你可以先做什麼
- 編輯 `public/data/items.json`，放入你的歌單（少量也行）。
- 如果要接 Spotify / YouTube：把每首的 `play_url` 設成對應連結。

---

# 專案結構

```
.
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx              # 開場 Pill Gate + 主頁結果清單
│  └─ globals.css
├─ components/
│  ├─ PillGate.tsx          # 藥丸選擇 + 粒子 + decade 鍵帽
│  ├─ ResultsGrid.tsx       # 12 格結果、＋收藏、▶播放
│  └─ MyListDock.tsx        # 右下角我的清單浮層 + 分享
├─ lib/
│  ├─ scoring.ts            # 簡單匹配/排序邏輯
│  ├─ storage.ts            # localStorage 封裝（偏好 & 收藏）
│  └─ types.ts
├─ public/
│  ├─ data/items.json       # 曲目資料（可含電影，type: 'track' | 'movie'）
│  ├─ icons/*               # PWA 圖示
│  ├─ manifest.webmanifest  # PWA 設定
│  └─ sw.js                 # Service Worker（快取靜態 + 資料）
├─ tailwind.config.ts
├─ postcss.config.js
├─ next.config.mjs
├─ package.json
└─ README.md
```

---

# 檔案內容

## package.json
```json
{
  "name": "pill-gate-pwa",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "framer-motion": "^11.0.0",
    "next": "^14.2.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.7"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "typescript": "^5.4.0"
  }
}
```

## next.config.mjs
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { appDir: true },
};
export default nextConfig;
```

## postcss.config.js
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## tailwind.config.ts
```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f14',
        neon: '#7df9ff',
        redpill: '#ff365f',
        bluepill: '#4aa8ff',
        greenpill: '#36ffb0',
        whitepill: '#e6f0ff'
      }
    },
  },
  plugins: [],
} satisfies Config
```

## app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }

html, body, #__next { height: 100%; }
body { @apply bg-bg text-white; }

/* 可選：掃描線動畫 */
.scanline { position: relative; overflow: hidden; }
.scanline::after {
  content: '';
  position: absolute; inset: 0;
  background: repeating-linear-gradient(
    to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px,
    transparent 1px, transparent 3px
  );
  pointer-events: none;
}
```

## public/manifest.webmanifest
```json
{
  "name": "Pill Gate Picks",
  "short_name": "PillPicks",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b0f14",
  "theme_color": "#0b0f14",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## public/sw.js
```js
const CACHE = 'pill-gate-v1';
const ASSETS = [
  '/', '/manifest.webmanifest',
  '/data/items.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/data/')) {
    // Stale-While-Revalidate for data
    e.respondWith(
      caches.open(CACHE).then(async c => {
        const cached = await c.match(e.request);
        const fetcher = fetch(e.request).then(res => {
          c.put(e.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fetcher;
      })
    );
    return;
  }
  // Cache-first for others
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
```

## public/data/items.json（示例）
```json
[
  {
    "id": "t-citypop-001",
    "type": "track",
    "title": "Plastic Love",
    "artist_or_director": "Mariya Takeuchi",
    "year": 1984,
    "genres": ["city_pop", "jpop"],
    "moods": ["retro", "groovy"],
    "poster_url": "https://i.imgur.com/xxxx.jpg",
    "play_url": "https://open.spotify.com/track/xxxx"
  },
  {
    "id": "t-lofi-001",
    "type": "track",
    "title": "Late Night Vibes",
    "artist_or_director": "Various",
    "year": 2021,
    "genres": ["lofi", "instrumental"],
    "moods": ["mellow", "study"],
    "poster_url": "/icons/icon-192.png",
    "play_url": "https://music.youtube.com/watch?v=xxxx"
  }
]
```

## lib/types.ts
```ts
export type Item = {
  id: string;
  type: 'track' | 'movie';
  title: string;
  artist_or_director: string;
  year: number;
  genres: string[];
  moods: string[];
  poster_url: string;
  play_url: string;
}

export type Profile = {
  pills: string[];        // e.g. ['red', 'green']
  particles: string[];    // e.g. ['heavy_beat']
  decades: string[];      // e.g. ['80s', '90s']
}
```

## lib/storage.ts
```ts
import { Profile, Item } from './types';

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
```

## lib/scoring.ts
```ts
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
```

## app/layout.tsx
```tsx
import './globals.css';
import { useEffect } from 'react';

export const metadata = { title: 'Pill Gate Picks', description: 'Wake up, listener_' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ScriptSW/>
        {children}
      </body>
    </html>
  );
}

function ScriptSW(){
  useEffect(()=>{
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  },[]);
  return null;
}
```

## components/PillGate.tsx
```tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getProfile, setProfile } from '@/lib/storage';

const PILL_COLORS: Record<string,string> = {
  red: 'bg-redpill', blue:'bg-bluepill', green:'bg-greenpill', white:'bg-white text-black'
};
const PARTICLES: Record<string,string[]> = {
  red: ['heavy_beat','fast_bpm','distortion'],
  blue:['mellow','dreamy','ambient'],
  green:['retro','groovy','synth'],
  white:['acoustic','minimal','piano']
};
const DECADES = ['80s','90s','00s','2010s','2020s'];

export default function PillGate({ onDone }:{ onDone:()=>void }){
  const saved = getProfile();
  const [stage, setStage] = useState(0);
  const [pills, setPills] = useState<string[]>(saved.pills||[]);
  const [particles, setParticles] = useState<string[]>(saved.particles||[]);
  const [decades, setDecades] = useState<string[]>(saved.decades||[]);

  function next(){ setStage(s=>s+1); }
  function skip(){ setStage(3); }
  function finish(){
    setProfile({ pills, particles, decades });
    onDone();
  }

  return (
    <div className="min-h-[80vh] grid place-items-center scanline">
      <AnimatePresence mode="wait">
        {stage===0 && (
          <motion.div key="boot" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center space-y-4">
            <div className="text-neon/80 tracking-widest">wake up, listener_</div>
            <motion.div initial={{width:0}} animate={{width:'16rem'}} className="h-1 bg-neon/40 mx-auto rounded"></motion.div>
            <button className="mt-6 px-4 py-2 rounded bg-neon/20 hover:bg-neon/30" onClick={next}>enter</button>
          </motion.div>
        )}
        {stage===1 && (
          <motion.div key="pills" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-center">
            <div className="mb-4 text-sm text-white/70">choose your pill(s)</div>
            <div className="flex justify-center gap-4 flex-wrap">
              {(['red','blue','green','white'] as const).map(p => (
                <button key={p} onClick={()=>setPills(v=>v.includes(p)?v.filter(x=>x!==p):[...v,p])}
                  className={`w-24 h-24 rounded-full shadow-lg transition transform hover:scale-105 ${PILL_COLORS[p]} flex items-center justify-center border border-white/20`}>{p}</button>
              ))}
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <button onClick={skip} className="px-3 py-1 text-xs rounded border border-white/30">skip</button>
              <button disabled={!pills.length} onClick={next} className="px-3 py-1 text-xs rounded bg-white/10 disabled:opacity-40">continue</button>
            </div>
          </motion.div>
        )}
        {stage===2 && (
          <motion.div key="particles" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-center">
            <div className="mb-3 text-xs text-white/60">fine‑tune (optional)</div>
            <div className="flex justify-center gap-2 flex-wrap max-w-xl mx-auto">
              {pills.flatMap(p=>PARTICLES[p]).map(pt => (
                <button key={pt} onClick={()=>setParticles(v=>v.includes(pt)?v.filter(x=>x!==pt):[...v,pt])}
                  className={`px-3 py-1 rounded-full border ${particles.includes(pt)?'bg-white text-black':'border-white/30 text-white/80'}`}>{pt}</button>
              ))}
            </div>
            <div className="mt-6">
              <div className="mb-2 text-xs text-white/50">SELECT YOUR DECADE:</div>
              <div className="flex justify-center gap-2 flex-wrap">
                {DECADES.map(d=> (
                  <button key={d} onClick={()=>setDecades(v=>v.includes(d)?v.filter(x=>x!==d):[...v,d])}
                    className={`px-3 py-1 rounded border ${decades.includes(d)?'bg-neon/20 border-neon/40':'border-white/30'}`}>{d}</button>
                ))}
                <button onClick={()=>setDecades([])} className="px-3 py-1 text-xs rounded border border-white/30">I don’t care</button>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <button onClick={skip} className="px-3 py-1 text-xs rounded border border-white/30">skip</button>
              <button onClick={finish} className="px-3 py-1 text-xs rounded bg-white/10">done</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## components/ResultsGrid.tsx
```tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Item, Profile } from '@/lib/types';
import { getProfile, addPick, hasPick, removePick, getPicks } from '@/lib/storage';
import { rank } from '@/lib/scoring';

export default function ResultsGrid(){
  const [items, setItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<Profile>({ pills:[], particles:[], decades:[] });
  const [onlyMine, setOnlyMine] = useState(false);

  useEffect(()=>{
    fetch('/data/items.json').then(r=>r.json()).then(setItems);
    setProfile(getProfile());
  },[]);

  const picks = getPicks();
  const ranked = useMemo(()=>rank(items, profile), [items, profile]);
  const list = onlyMine ? ranked.filter(i=>picks.includes(i.id)) : ranked.slice(0,12);

  return (
    <div className="max-w-6xl mx-auto p-4">
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
```

## components/MyListDock.tsx
```tsx
'use client';
import { useEffect, useState } from 'react';
import { getPicks } from '@/lib/storage';

export default function MyListDock(){
  const [open,setOpen]=useState(false);
  const [ids,setIds]=useState<string[]>([]);
  useEffect(()=>{
    const sync=()=>setIds(getPicks());
    sync();
    window.addEventListener('storage', sync);
    return ()=>window.removeEventListener('storage', sync);
  },[]);

  return (
    <div className="fixed right-4 bottom-4">
      <button onClick={()=>setOpen(o=>!o)} className="w-12 h-12 rounded-full bg-neon/20 border border-neon/40">{ids.length}</button>
      {open && (
        <div className="absolute right-0 bottom-14 w-72 max-h-80 overflow-auto bg-black/80 backdrop-blur border border-white/10 rounded-xl p-3 text-sm">
          <div className="opacity-70 text-xs mb-2">my picks</div>
          <ul className="space-y-1">
            {ids.map(i=> <li key={i} className="opacity-80">{i}</li>)}
          </ul>
          <button onClick={()=>navigator.clipboard.writeText(ids.join('\n'))} className="mt-3 w-full px-3 py-2 text-xs rounded bg-white/10">copy as text</button>
        </div>
      )}
    </div>
  );
}
```

## app/page.tsx
```tsx
'use client';
import { useState } from 'react';
import PillGate from '@/components/PillGate';
import ResultsGrid from '@/components/ResultsGrid';
import MyListDock from '@/components/MyListDock';

export default function Page(){
  const [done,setDone]=useState(false);
  return (
    <main>
      {!done ? <PillGate onDone={()=>setDone(true)}/> : <ResultsGrid/>}
      <MyListDock/>
    </main>
  );
}
```

---

# 部署到 Vercel（超短）
1. 把本專案推上 GitHub。
2. 到 **Vercel** → Add New → Project → 選你的 repo → 一路 Next.js 預設 → Deploy。
3. 打開網址，手機以「加入主畫面」安裝。

# 之後要雲同步（可選）
- 我們可以把 `storage.ts` 換成 Supabase 版本（匿名/裝置 ID）；`picks`/`profiles` 就能跨裝置同步，並支援分享連結（slug）。

# 小提醒
- 請替換 `public/icons/*` 為你的 App 圖示。
- 請把 `items.json` 換成你的歌單；之後再接 Spotify/TMDb API 擴充。
- PWA 的離線能力以「快取資料 + 最近一次結果」為主；首次載入需網路。
