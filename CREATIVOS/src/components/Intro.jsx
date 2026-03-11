import { useEffect, useState } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300&display=swap');

  @keyframes drawRing {
    from { stroke-dashoffset: 283; }
    to   { stroke-dashoffset: 0; }
  }

  @keyframes drawRingInner {
    from { stroke-dashoffset: 170; }
    to   { stroke-dashoffset: 0; }
  }

  @keyframes logoIn {
    0%   { opacity: 0; transform: scale(0.92); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes textIn {
    from { opacity: 0; letter-spacing: 0.2em; }
    to   { opacity: 1; letter-spacing: 0.45em; }
  }

  @keyframes tickAppear {
    0%   { opacity: 0; stroke-dashoffset: 20; }
    100% { opacity: 1; stroke-dashoffset: 0; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .draw-ring {
    stroke-dasharray: 283;
    stroke-dashoffset: 283;
    animation: drawRing 2s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards;
  }

  .draw-ring-inner {
    stroke-dasharray: 170;
    stroke-dashoffset: 170;
    animation: drawRingInner 1.8s cubic-bezier(0.65, 0, 0.35, 1) 0.5s forwards;
  }

  .rotate-slow {
    transform-origin: 50px 50px;
    animation: rotateSlow 18s linear infinite;
  }

  .logo-in {
    animation: logoIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
  }

  .text-in {
    animation: textIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) 1.2s both;
  }

  .tick-in {
    stroke-dasharray: 20;
    stroke-dashoffset: 20;
    animation: tickAppear 0.5s ease-out 2.3s forwards;
  }

  .screen-out {
    animation: fadeOut 0.8s cubic-bezier(0.4, 0, 1, 1) forwards;
  }
`;

export default function Intro({ onFinish }) {
  const [phase, setPhase] = useState('in'); // 'in' | 'done' | 'out'

  useEffect(() => {
    // El check aparece a los 2.3s → breve pausa → salida
    const doneTimer = setTimeout(() => setPhase('done'), 2300);
    const outTimer  = setTimeout(() => setPhase('out'),  2900);
    const endTimer  = setTimeout(onFinish, 3700);

    return () => [doneTimer, outTimer, endTimer].forEach(clearTimeout);
  }, [onFinish]);

  return (
    <>
      <style>{css}</style>

      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080808] ${phase === 'out' ? 'screen-out' : ''}`}
      >
        {/* Líneas de cuadrícula tenues — dan estructura sin ruido */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* SVG principal */}
        <div className="relative" style={{ width: 470, height: 470 }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow: 'visible' }}>

            {/* Anillo exterior — se dibuja */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.5"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="0.5"
              strokeLinecap="round"
              className="draw-ring"
              transform="rotate(-90 50 50)"
            />

            {/* Anillo interior — aparece más tarde */}
            <circle
              cx="50" cy="50" r="27"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.4"
            />
            <circle
              cx="50" cy="50" r="27"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.4"
              strokeLinecap="round"
              strokeDasharray="4 6"
              className="rotate-slow"
            />

            {/* Check / tick al completar */}
            {/* {phase !== 'in' && (
              <polyline
                points="42,50 48,56 60,43"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="tick-in"
                style={{ display: phase !== 'in' ? 'block' : 'none' }}
              />
            )} */}

            {/* Marcas de cuadrante — sutiles */}
            {[0, 90, 180, 270].map((deg) => {
              const rad = (deg - 90) * (Math.PI / 180);
              const x1 = 50 + 43 * Math.cos(rad);
              const y1 = 50 + 43 * Math.sin(rad);
              const x2 = 50 + 47 * Math.cos(rad);
              const y2 = 50 + 47 * Math.sin(rad);
              return (
                <line
                  key={deg}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Logo — centrado, sin glow */}
          <div className="absolute inset-0 flex items-center justify-center logo-in">
            <img
              src="/src/assets/grafico.png"
              alt="Logo"
              style={{
                width: 150,
                height: 150,
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

        {/* Texto inferior */}
        <p
          className="text-in mt-10"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '16px',
            letterSpacing: '0.45em',
            color: 'rgba(255,255,255,0.22)',
            fontWeight: 300,
            textTransform: 'uppercase',
          }}
        >
          &copy;Espacio Creativo
        </p>
      </div>
    </>
  );
}