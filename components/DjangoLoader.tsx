'use client';

import { useEffect, useState } from 'react';

function RetroSVG({ progress }: { progress: number }) {
  const bounce = Math.sin(progress * 0.5) * 2;

  return (
    <svg width="70" height="50" viewBox="0 0 70 50" style={{ transform: `translateY(${bounce}px)` }}>
      <defs>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes armSwing {
            0%, 100% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
          }
          .wheel-rear { animation: spin 1s linear infinite; transform-origin: 17px 38px; }
          .wheel-front { animation: spin 0.8s linear infinite; transform-origin: 53px 38px; }
          .arm-swing { animation: armSwing 0.6s ease-in-out infinite; transform-origin: 35px 20px; }
        `}</style>
      </defs>

      {/* Exhaust stack */}
      <rect x="8" y="7" width="4" height="10" rx="1" fill="#555" />

      {/* Main body */}
      <rect x="10" y="14" width="30" height="16" rx="3" fill="#F39C12" />
      <rect x="10" y="14" width="30" height="16" rx="3" fill="none" stroke="#E67E22" strokeWidth="0.5" />

      {/* Cabin window */}
      <rect x="24" y="16" width="10" height="8" rx="1.5" fill="#0f0f10" opacity="0.6" />
      <rect x="24" y="16" width="10" height="8" rx="1.5" fill="none" stroke="#E67E22" strokeWidth="0.5" opacity="0.4" />

      {/* Chassis line */}
      <line x1="10" y1="30" x2="55" y2="30" stroke="#E67E22" strokeWidth="1.5" />

      {/* Front loader arm */}
      <g className="arm-swing">
        <line x1="38" y1="22" x2="50" y2="18" stroke="#888" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="18" x2="58" y2="26" stroke="#888" strokeWidth="2" strokeLinecap="round" />
        {/* Loader bucket */}
        <path d="M54 24 L58 26 L60 30 L56 30 Z" fill="#666" stroke="#555" strokeWidth="0.5" />
      </g>

      {/* Backhoe arm */}
      <line x1="12" y1="20" x2="2" y2="12" stroke="#888" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="2" y1="12" x2="4" y2="24" stroke="#888" strokeWidth="2" strokeLinecap="round" />
      {/* Backhoe bucket */}
      <path d="M2 22 L4 24 L2 28 L0 26 Z" fill="#666" stroke="#555" strokeWidth="0.5" />

      {/* Rear wheel (large) */}
      <g className="wheel-rear">
        <circle cx="17" cy="38" r="9" fill="#1a1a1a" stroke="#555" strokeWidth="2" />
        <circle cx="17" cy="38" r="3" fill="#444" />
        <line x1="17" y1="29" x2="17" y2="47" stroke="#444" strokeWidth="1.5" />
        <line x1="8" y1="38" x2="26" y2="38" stroke="#444" strokeWidth="1.5" />
        {/* Tire treads */}
        <circle cx="17" cy="38" r="9" fill="none" stroke="#333" strokeWidth="3" strokeDasharray="4 3" />
      </g>

      {/* Front wheel (small) */}
      <g className="wheel-front">
        <circle cx="53" cy="38" r="6" fill="#1a1a1a" stroke="#555" strokeWidth="1.5" />
        <circle cx="53" cy="38" r="2.5" fill="#444" />
        <line x1="53" y1="32" x2="53" y2="44" stroke="#444" strokeWidth="1" />
        <line x1="47" y1="38" x2="59" y2="38" stroke="#444" strokeWidth="1" />
        <circle cx="53" cy="38" r="6" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="3 2.5" />
      </g>
    </svg>
  );
}

export function DjangoLoader({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();
    const duration = 4500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => setVisible(false), 400);
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {visible && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f0f10] transition-opacity duration-500">
          <img
            src="/callidon-logo.png"
            alt="Callidon"
            className="h-20 mb-16 object-contain"
          />

          <div className="relative w-[320px] sm:w-[400px]">
            {/* Retro walking on the bar */}
            <div
              className="absolute -top-12 transition-[left] duration-75 ease-linear"
              style={{ left: `calc(${progress}% - 35px)` }}
            >
              <RetroSVG progress={progress} />
            </div>

            {/* Progress bar track */}
            <div className="h-4 bg-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F39C12] to-[#E67E22] rounded-full transition-[width] duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-[#94a3b8] mt-4 font-mono text-sm tracking-wider">
            CARGANDO EQUIPOS... {Math.round(progress)}%
          </p>
        </div>
      )}
      <div className={visible ? 'invisible' : ''}>{children}</div>
    </>
  );
}
