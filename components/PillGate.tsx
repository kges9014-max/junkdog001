'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getProfile, setProfile } from '@/lib/storage';

// 只保留兩顏色：blue / red
const PILL_COLORS: Record<string, string> = {
  blue: 'bg-bluepill',
  red: 'bg-redpill',
};
// 只對應兩顏色的粒子
const PARTICLES: Record<string, string[]> = {
  blue: ['mellow', 'dreamy', 'ambient'],
  red: ['heavy_beat', 'fast_bpm', 'distortion'],
};
// 年代三段
const DECADES = ['90s-', '00s–10s', '20s+'] as const;

export default function PillGate({ onDone }: { onDone: () => void }) {
  const saved = getProfile();
  const [stage, setStage] = useState(0);
  const [pills, setPills] = useState<string[]>(saved.pills || []);
  const [particles, setParticles] = useState<string[]>(saved.particles || []);
  const [decades, setDecades] = useState<string[]>(saved.decades || []);

  function next() {
    setStage((s) => s + 1);
  }
  function skip() {
    // 直接完成，避免跳到不存在的 stage 造成空白
    finish();
  }
  function finish() {
    setProfile({ pills, particles, decades });
    onDone();
  }

  return (
    <div className="min-h-[80vh] grid place-items-center scanline">
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            <div className="text-neon/80 tracking-widest">wake up, listener_</div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '16rem' }}
              className="h-1 bg-neon/40 mx-auto rounded"
            ></motion.div>
            <button
              className="mt-6 px-4 py-2 rounded bg-neon/20 hover:bg-neon/30"
              onClick={next}
            >
              enter
            </button>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="pills"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="mb-4 text-sm text-white/70">choose your pill(s)</div>
            <div className="flex justify-center gap-4 flex-wrap">
              {(['blue', 'red'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    setPills((v) =>
                      v.includes(p) ? v.filter((x) => x !== p) : [...v, p]
                    )
                  }
                  className={`w-24 h-24 rounded-full shadow-lg transition transform hover:scale-105 ${PILL_COLORS[p]} flex items-center justify-center border border-white/20`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={skip}
                className="px-3 py-1 text-xs rounded border border-white/30"
              >
                skip
              </button>
              <button
                disabled={!pills.length}
                onClick={next}
                className="px-3 py-1 text-xs rounded bg-white/10 disabled:opacity-40"
              >
                continue
              </button>
            </div>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="particles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="mb-3 text-xs text-white/60">fine-tune (optional)</div>

            {/* 依據選的 pill 展開對應的粒子 */}
            <div className="flex justify-center gap-2 flex-wrap max-w-xl mx-auto">
              {pills.flatMap((p) => PARTICLES[p] || []).map((pt) => (
                <button
                  key={pt}
                  onClick={() =>
                    setParticles((v) =>
                      v.includes(pt) ? v.filter((x) => x !== pt) : [...v, pt]
                    )
                  }
                  className={`px-3 py-1 rounded-full border ${
                    particles.includes(pt)
                      ? 'bg-white text-black'
                      : 'border-white/30 text-white/80'
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-2 text-xs text-white/50">SELECT YOUR DECADE:</div>
              <div className="flex justify-center gap-2 flex-wrap">
                {DECADES.map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      setDecades((v) =>
                        v.includes(d) ? v.filter((x) => x !== d) : [...v, d]
                      )
                    }
                    className={`px-3 py-1 rounded border ${
                      decades.includes(d)
                        ? 'bg-neon/20 border-neon/40'
                        : 'border-white/30'
                    }`}
                  >
                    {d}
                  </button>
                ))}

                {/* I don't care：清空並直接完成 */}
                <button
                  onClick={() => {
                    setDecades([]);
                    finish();
                  }}
                  className="px-3 py-1 text-xs rounded border border-white/30"
                >
                  I don’t care
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={skip}
                className="px-3 py-1 text-xs rounded border border-white/30"
              >
                skip
              </button>
              <button
                onClick={finish}
                className="px-3 py-1 text-xs rounded bg-white/10"
              >
                done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
