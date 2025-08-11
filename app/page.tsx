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
