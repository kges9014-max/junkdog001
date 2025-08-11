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
