'use client';
import { useEffect } from 'react';

export default function RegisterSW(){
  useEffect(()=>{
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((e)=>{
        console.warn('SW register failed', e);
      });
    }
  },[]);
  return null;
}
