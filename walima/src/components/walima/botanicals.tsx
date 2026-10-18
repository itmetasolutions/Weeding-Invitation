/* Original botanical SVG artwork for the Pearl Garden invitation. */

const r1 = (n: number) => Math.round(n * 10) / 10;

function petalPath(r: number, w = 0.62) {
  const W = r * w;
  return `M0,0 C${r1(-W)},${r1(-r * 0.25)} ${r1(-W * 1.05)},${r1(-r * 0.95)} ${r1(-W * 0.2)},${r1(-r)} Q0,${r1(-r * 1.05)} ${r1(W * 0.2)},${r1(-r)} C${r1(W * 1.05)},${r1(-r * 0.95)} ${r1(W)},${r1(-r * 0.25)} 0,0 Z`;
}

export function BotanicalDefs({ p }: { p: string }) {
  return (
    <defs>
      <radialGradient id={`${p}-petal`} cx="0.5" cy="1" r="1.1">
        <stop offset="0" stopColor="#E3D3BA" />
        <stop offset="0.45" stopColor="#F4ECDF" />
        <stop offset="1" stopColor="#FFFDF9" />
      </radialGradient>
      <radialGradient id={`${p}-petalIn`} cx="0.5" cy="1" r="1">
        <stop offset="0" stopColor="#D6C2A2" />
        <stop offset="1" stopColor="#F8F1E6" />
      </radialGradient>
      <linearGradient id={`${p}-leaf`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#D9CDB8" />
        <stop offset="1" stopColor="#B4A386" />
      </linearGradient>
      <linearGradient id={`${p}-champ`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E8D3A8" />
        <stop offset="0.5" stopColor="#C6A775" />
        <stop offset="1" stopColor="#9E7D48" />
      </linearGradient>
      <filter id={`${p}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#625349" floodOpacity="0.22" />
      </filter>
    </defs>
  );
}

/** Layered ivory rose. Petals carry data-petal (+ data-ring) for unfolding. */
export function Rose({ p, x = 0, y = 0, s = 1, rot = 0 }: { p: string; x?: number; y?: number; s?: number; rot?: number }) {
  const rings = [
    { n: 6, r: 44, w: 0.66, off: 0, fill: `url(#${p}-petal)` },
    { n: 5, r: 34, w: 0.7, off: 30, fill: `url(#${p}-petal)` },
    { n: 5, r: 24, w: 0.74, off: 12, fill: `url(#${p}-petalIn)` },
    { n: 3, r: 14, w: 0.85, off: 50, fill: `url(#${p}-petalIn)` },
  ];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} data-rose>
      {rings.map((ring, ri) => (
        /* One group per ring so a rose can unfold a whole ring at a time:
           four tweens instead of twenty, and no filtered petal is tweened alone. */
        <g key={ri} data-petal-ring={ri}>
          {Array.from({ length: ring.n }, (_, i) => (
            <g key={i} transform={`rotate(${ring.off + (i * 360) / ring.n})`}>
              <path data-petal data-ring={ri} d={petalPath(ring.r, ring.w)} fill={ring.fill} stroke="#D9C8AC" strokeWidth="0.5" filter={`url(#${p}-shadow)`} />
            </g>
          ))}
        </g>
      ))}
      <path data-petal data-ring="4" d="M0,-6 C5,-6 6,1 1,3 C-4,5 -6,-1 -2,-3 C1,-4 3,-1 0,1" fill="none" stroke="#C9B391" strokeWidth="1" />
    </g>
  );
}

/** Closed bud. */
export function Bud({ p, x, y, s = 1, rot = 0 }: { p: string; x: number; y: number; s?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} data-bud>
      <path d="M0,0 C-9,-6 -8,-22 0,-28 C8,-22 9,-6 0,0 Z" fill={`url(#${p}-petal)`} stroke="#D9C8AC" strokeWidth="0.5" filter={`url(#${p}-shadow)`} />
      <path d="M0,0 C-6,-4 -10,-12 -8,-18 M0,0 C6,-4 10,-12 8,-18" stroke={`url(#${p}-leaf)`} strokeWidth="2" fill="none" />
    </g>
  );
}

export function Leaf({ p, x, y, s = 1, rot = 0, line = false }: { p: string; x: number; y: number; s?: number; rot?: number; line?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <g data-leaf>
        <path
          d="M0,0 C10,-11 30,-13 46,0 C30,12 10,11 0,0 Z"
          fill={line ? "none" : `url(#${p}-leaf)`}
          stroke={line ? `url(#${p}-champ)` : "#A8977B"}
          strokeWidth={line ? 1 : 0.4}
          opacity={line ? 1 : 0.92}
        />
        <path d="M2,0 Q22,-1 44,0" stroke={line ? `url(#${p}-champ)` : "#F3EBDD"} strokeWidth="0.7" fill="none" opacity="0.9" />
      </g>
    </g>
  );
}

/**
 * Corner spray: a curving stem with leaves, buds and one open rose.
 * Drawn for the top-left corner; mirror with CSS for others.
 */
export function Spray({ p, className }: { p: string; className?: string }) {
  const leaves: [number, number, number, number, boolean?][] = [
    [40, 250, -60, 1],
    [70, 200, -20, 0.9, true],
    [96, 168, -80, 1.1],
    [130, 140, 10, 0.95],
    [168, 112, -50, 1, true],
    [200, 96, 20, 0.85],
    [70, 230, 200, 0.9],
    [118, 176, 160, 0.8, true],
    [160, 130, 200, 0.9],
  ];
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden>
      <BotanicalDefs p={p} />
      <path data-stem d="M-10,330 C40,260 80,190 150,140 S260,70 300,40" fill="none" stroke={`url(#${p}-leaf)`} strokeWidth="2.2" strokeLinecap="round" />
      <path data-stem d="M90,190 C70,150 80,110 60,70" fill="none" stroke={`url(#${p}-leaf)`} strokeWidth="1.4" strokeLinecap="round" />
      <path data-stem d="M200,98 C215,140 250,150 275,190" fill="none" stroke={`url(#${p}-champ)`} strokeWidth="1" strokeLinecap="round" />
      {leaves.map(([x, y, r, s, line], i) => (
        <Leaf key={i} p={p} x={x} y={y} rot={r} s={s} line={line} />
      ))}
      <Bud p={p} x={60} y={72} rot={-14} s={0.9} />
      <Bud p={p} x={276} y={194} rot={150} s={0.7} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} data-berry cx={230 + i * 9} cy={120 + i * 13} r={2.6} fill="#FFFDF8" stroke={`url(#${p}-champ)`} strokeWidth="0.6" />
      ))}
      <Rose p={p} x={150} y={140} s={0.95} rot={10} />
      <Rose p={p} x={290} y={44} s={0.6} rot={-30} />
    </svg>
  );
}

/** Wreath of roses and leaves arranged around a circle (for the floral reveal). */
export function Wreath({ p, className }: { p: string; className?: string }) {
  const R = 200;
  const cx = 250;
  const cy = 250;
  // asymmetric crescent: heavier lower-left and upper-right
  const roses: [number, number][] = [
    [128, 0.9],
    [150, 0.62],
    [108, 0.55],
    [-52, 0.82],
    [-30, 0.55],
    [-74, 0.5],
  ];
  const leafAngles = [90, 100, 118, 138, 160, 172, 182, 196, -10, -20, -40, -62, -84, -96, -110, 70, 0];
  const pt = (deg: number, r = R) => [r1(cx + r * Math.cos((deg * Math.PI) / 180)), r1(cy + r * Math.sin((deg * Math.PI) / 180))] as const;
  return (
    <svg viewBox="0 0 500 500" className={className} aria-hidden>
      <BotanicalDefs p={p} />
      <circle data-ring-draw cx={cx} cy={cy} r={R} fill="none" stroke={`url(#${p}-champ)`} strokeWidth="1.1" />
      <circle data-ring-draw cx={cx} cy={cy} r={R - 9} fill="none" stroke={`url(#${p}-champ)`} strokeWidth="0.5" />
      <path data-stem d={`M${pt(200)[0]},${pt(200)[1]} A${R},${R} 0 0 0 ${pt(80)[0]},${pt(80)[1]}`} fill="none" stroke={`url(#${p}-leaf)`} strokeWidth="1.6" transform={`translate(0 0)`} />
      <path data-stem d={`M${pt(-120)[0]},${pt(-120)[1]} A${R},${R} 0 0 1 ${pt(10)[0]},${pt(10)[1]}`} fill="none" stroke={`url(#${p}-leaf)`} strokeWidth="1.6" />
      {leafAngles.map((a, i) => {
        const [x, y] = pt(a, R + (i % 2 ? 6 : -6));
        const tangent = a + (a > 0 && a < 200 ? 90 : -90) + (i % 2 ? 25 : -25);
        return <Leaf key={i} p={p} x={x} y={y} rot={tangent} s={0.8 + (i % 3) * 0.12} line={i % 4 === 1} />;
      })}
      {roses.map(([a, s], i) => {
        const [x, y] = pt(a);
        return <Rose key={i} p={p} x={x} y={y} s={s} rot={a} />;
      })}
      {[60, 210, -140, 30].map((a, i) => {
        const [x, y] = pt(a, R + 2);
        return <circle key={i} data-berry cx={x} cy={y} r={3.4} fill="#FFFDF8" stroke={`url(#${p}-champ)`} strokeWidth="0.8" />;
      })}
      {/* bead of light that draws the ring, echoing the opening's pearl rings */}
      <g data-wreath-orbit>
        <circle data-wreath-bead cx={cx + R} cy={cy} r={3.6} fill="#FFFDF8" opacity="0" />
      </g>
    </svg>
  );
}

/** Thin garland line with pearls, used in the final composition. */
export function Garland({ p, className }: { p: string; className?: string }) {
  return (
    <svg viewBox="0 0 600 120" className={className} aria-hidden>
      <BotanicalDefs p={p} />
      <path data-stem d="M10,20 Q300,130 590,20" fill="none" stroke={`url(#${p}-champ)`} strokeWidth="1" />
      {Array.from({ length: 13 }, (_, i) => {
        const t = (i + 1) / 14;
        const x = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 300 + t * t * 590;
        const y = (1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 130 + t * t * 20;
        return <circle key={i} data-berry cx={r1(x)} cy={r1(y)} r={i === 6 ? 5 : 3} fill="#FFFDF8" stroke={`url(#${p}-champ)`} strokeWidth="0.7" />;
      })}
      <Leaf p={p} x={262} y={70} rot={170} s={0.9} />
      <Leaf p={p} x={338} y={70} rot={10} s={0.9} />
      <Leaf p={p} x={240} y={64} rot={210} s={0.7} line />
      <Leaf p={p} x={360} y={64} rot={-30} s={0.7} line />
      <Rose p={p} x={300} y={74} s={0.42} />
    </svg>
  );
}
