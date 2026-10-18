import type { SVGProps } from "react";
import { archOutline, cuspedArch, rosette, star, type ArchSpec } from "./geometry";

export const GOLD_GRAD_ID = "rg-gold";

/** Gradient + pattern definitions. Rendered once per SVG that needs them (ids are prefixed). */
export function RoyalDefs({ p = "r" }: { p?: string }) {
  return (
    <defs>
      <linearGradient id={`${p}-gold`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FBEBC0" />
        <stop offset="0.35" stopColor="#D9B877" />
        <stop offset="0.55" stopColor="#A9803F" />
        <stop offset="0.75" stopColor="#E9CF92" />
        <stop offset="1" stopColor="#8A6232" />
      </linearGradient>
      <linearGradient id={`${p}-goldH`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#956A42" stopOpacity="0" />
        <stop offset="0.2" stopColor="#C5A46D" />
        <stop offset="0.5" stopColor="#FFF1CC" />
        <stop offset="0.8" stopColor="#C5A46D" />
        <stop offset="1" stopColor="#956A42" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${p}-glow`}>
        <stop offset="0" stopColor="#FFF4D6" stopOpacity="1" />
        <stop offset="0.25" stopColor="#E8C987" stopOpacity="0.55" />
        <stop offset="1" stopColor="#C5A46D" stopOpacity="0" />
      </radialGradient>
      <pattern id={`${p}-jali`} width="36" height="36" patternUnits="userSpaceOnUse">
        <path d={star(18, 18, 13, 7.5, 8, -Math.PI / 8)} fill="none" stroke="#C5A46D" strokeWidth="0.7" />
        <path d="M0 0 L7 7 M36 0 L29 7 M0 36 L7 29 M36 36 L29 29 M18 0 V4 M18 36 V32 M0 18 H4 M36 18 H32" stroke="#C5A46D" strokeWidth="0.6" />
        <circle cx="18" cy="18" r="2.2" fill="#C5A46D" />
      </pattern>
      <filter id={`${p}-soft`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/** Monogram medallion: rosette + 16-point star + ring of beads. */
export function Medallion({ className, p = "m", ...rest }: { className?: string; p?: string } & SVGProps<SVGSVGElement>) {
  const beads = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    return <circle key={i} cx={Math.round((100 + 92 * Math.cos(a)) * 100) / 100} cy={Math.round((100 + 92 * Math.sin(a)) * 100) / 100} r={i % 4 === 0 ? 1.8 : 1} />;
  });
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden {...rest}>
      <RoyalDefs p={p} />
      <g fill={`url(#${p}-gold)`}>{beads}</g>
      <circle cx="100" cy="100" r="86" fill="none" stroke={`url(#${p}-gold)`} strokeWidth="1.4" />
      <circle cx="100" cy="100" r="81" fill="none" stroke={`url(#${p}-gold)`} strokeWidth="0.5" />
      <path d={star(100, 100, 80, 70, 16)} fill="none" stroke={`url(#${p}-gold)`} strokeWidth="0.6" opacity="0.7" />
      <path d={rosette(100, 100, 74, 16, 0.18)} fill="none" stroke={`url(#${p}-gold)`} strokeWidth="0.45" opacity="0.6" />
      <circle cx="100" cy="100" r="58" fill="#0B1427" stroke={`url(#${p}-gold)`} strokeWidth="1.2" />
      <circle cx="100" cy="100" r="54" fill="none" stroke={`url(#${p}-gold)`} strokeWidth="0.4" />
    </svg>
  );
}

/** Corner flourish, drawn in the top-left orientation. Rotate via CSS for others. */
export function Corner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden fill="none" stroke="currentColor">
      <path data-draw d="M4 116 V30 Q4 4 30 4 H116" strokeWidth="1.2" />
      <path data-draw d="M12 116 V36 Q12 12 36 12 H116" strokeWidth="0.6" />
      <path data-draw d="M22 60 Q22 22 60 22 M34 40 Q48 30 52 18 M40 34 Q30 48 18 52" strokeWidth="0.8" />
      <path d={rosette(30, 30, 11, 8, 0.35)} strokeWidth="0.6" />
      <circle cx="30" cy="30" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 24" className={className} aria-hidden fill="none" stroke="currentColor">
      <path data-draw d="M0 12 H132" strokeWidth="0.8" />
      <path data-draw d="M188 12 H320" strokeWidth="0.8" />
      <path d={star(160, 12, 10, 4.5, 8)} fill="currentColor" stroke="none" />
      <circle cx="140" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="180" cy="12" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** A single decorative arch frame (outline + cusped inner + jali spandrels). */
export function ArchFrame({ spec, p, className, strokeWidth = 1.4, jali = true }: { spec: ArchSpec; p: string; className?: string; strokeWidth?: number; jali?: boolean }) {
  return (
    <svg viewBox={`0 0 ${spec.x1 + spec.x0} ${spec.base + 4}`} className={className} aria-hidden fill="none" preserveAspectRatio="xMidYMax meet">
      <RoyalDefs p={p} />
      {jali && (
        <path
          d={`M0,${spec.base} L0,0 L${spec.x1 + spec.x0},0 L${spec.x1 + spec.x0},${spec.base} ${archOutline(spec).replace("M", "L")} Z`}
          fill={`url(#${p}-jali)`}
          opacity="0.18"
          fillRule="evenodd"
        />
      )}
      <path data-draw d={archOutline(spec)} stroke={`url(#${p}-gold)`} strokeWidth={strokeWidth} />
      <path data-draw d={cuspedArch(spec, 4, 14)} stroke={`url(#${p}-gold)`} strokeWidth={strokeWidth * 0.55} opacity="0.85" />
    </svg>
  );
}

/** Hanging lantern on a chain. */
export function Lantern({ className, p = "ln" }: { className?: string; p?: string }) {
  return (
    <svg viewBox="0 0 40 140" className={className} aria-hidden>
      <RoyalDefs p={p} />
      <line x1="20" y1="0" x2="20" y2="70" stroke="#C5A46D" strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx="20" cy="104" r="22" fill={`url(#${p}-glow)`} opacity="0.9" />
      <path d="M20 70 L30 84 L28 112 L20 124 L12 112 L10 84 Z" fill="#1a2440" stroke={`url(#${p}-gold)`} strokeWidth="1" />
      <path d="M20 76 L26 86 L25 108 L20 116 L15 108 L14 86 Z" fill="#F5D99B" opacity="0.85" />
      <path d="M12 84 H28 M11 98 H29 M12 112 H28" stroke={`url(#${p}-gold)`} strokeWidth="0.8" />
      <path d="M20 124 V136" stroke="#C5A46D" strokeWidth="1" />
      <circle cx="20" cy="137.5" r="2" fill="#C5A46D" />
    </svg>
  );
}

/**
 * Sehra strands: a crown band with hanging bead-and-bud strands in a V fringe.
 * Each strand has data-strand for animation; beads carry data-bead.
 */
export function Sehra({ className, p = "sh" }: { className?: string; p?: string }) {
  const n = 27;
  const W = 600;
  const strands = Array.from({ length: n }, (_, i) => {
    const x = 30 + (i * (W - 60)) / (n - 1);
    const t = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2); // 0 centre → 1 edges
    const yTop = 58 + Math.pow(t, 2) * 30;
    const len = 180 + (1 - t) * 150 + (i % 2 ? -22 : 0);
    const beads = Math.floor(len / 18);
    return { x, yTop, len, beads, i };
  });
  return (
    <svg viewBox="0 0 600 420" className={className} aria-hidden>
      <RoyalDefs p={p} />
      {/* crown band */}
      <path data-band d="M10 70 Q300 -10 590 70" fill="none" stroke={`url(#${p}-gold)`} strokeWidth="3" />
      <path data-band d="M10 82 Q300 2 590 82" fill="none" stroke={`url(#${p}-gold)`} strokeWidth="1" />
      {strands.map((s) => (
        <g key={s.i} data-strand style={{ transformOrigin: `${s.x}px ${s.yTop}px`, transformBox: "view-box" }}>
          <line x1={s.x} y1={s.yTop} x2={s.x} y2={s.yTop + s.len} stroke="#C5A46D" strokeWidth="0.7" opacity="0.8" />
          {Array.from({ length: s.beads }, (_, k) => {
            const y = s.yTop + 12 + k * 18;
            const flower = (k + s.i) % 4 === 0;
            return flower ? (
              <path key={k} data-bead d={rosette(s.x, y, 5.5, 5, 0.5)} fill="#F5EFE3" opacity="0.92" />
            ) : (
              <circle key={k} data-bead cx={s.x} cy={y} r={k % 2 ? 2.2 : 2.8} fill={`url(#${p}-gold)`} />
            );
          })}
          <path data-bead d={star(s.x, s.yTop + s.len + 6, 6, 2.5, 4)} fill={`url(#${p}-gold)`} />
        </g>
      ))}
      {/* jewels on band */}
      {Array.from({ length: 11 }, (_, i) => {
        const t = i / 10;
        const x = 10 + 580 * t;
        const y = Math.round(((1 - t) * (1 - t) * 70 + 2 * (1 - t) * t * -10 + t * t * 70 + 6) * 100) / 100;
        return <circle key={i} cx={x} cy={y} r={i === 5 ? 6 : 3.4} fill={i === 5 ? "#F5EFE3" : `url(#${p}-gold)`} stroke="#956A42" strokeWidth="0.6" />;
      })}
    </svg>
  );
}

/** Colonnade row of cusped arches for the palace scene. */
export function Colonnade({ count, className, p, opacity = 1, stroke = 1 }: { count: number; className?: string; p: string; opacity?: number; stroke?: number }) {
  const w = 120;
  const arches = Array.from({ length: count }, (_, i) => {
    const x0 = i * w + 14;
    return { x0, x1: x0 + w - 28, base: 300, spring: 150, apex: 46 };
  });
  return (
    <svg viewBox={`0 0 ${count * w} 304`} className={className} aria-hidden preserveAspectRatio="xMidYMax slice" opacity={opacity}>
      <RoyalDefs p={p} />
      <rect x="0" y="0" width={count * w} height="304" fill={`url(#${p}-jali)`} opacity="0.08" />
      {arches.map((a, i) => (
        <g key={i}>
          <path d={archOutline(a) + " Z"} fill="#08101f" />
          <path d={archOutline(a)} fill="none" stroke={`url(#${p}-gold)`} strokeWidth={stroke} />
          <path d={cuspedArch(a, 3, 8)} fill="none" stroke={`url(#${p}-gold)`} strokeWidth={stroke * 0.5} opacity="0.7" />
          <rect x={a.x0 - 10} y="292" width={w - 8} height="12" fill="#0b1427" stroke="#956A42" strokeWidth="0.6" />
        </g>
      ))}
      <path d={`M0 6 H${count * w} M0 14 H${count * w}`} stroke={`url(#${p}-gold)`} strokeWidth="0.8" />
    </svg>
  );
}

/** Palace skyline with central dome and chhatris. */
export function Skyline({ className, p = "sk" }: { className?: string; p?: string }) {
  return (
    <svg viewBox="0 0 1200 360" className={className} aria-hidden preserveAspectRatio="xMidYMax slice">
      <RoyalDefs p={p} />
      <g fill="#0e1a33" stroke="#C5A46D" strokeOpacity="0.35" strokeWidth="1">
        {/* minarets */}
        {[90, 1110].map((x) => (
          <g key={x}>
            <rect x={x - 14} y="90" width="28" height="270" />
            <path d={`M${x - 20} 90 Q${x} 40 ${x + 20} 90 Z`} />
            <path d={`M${x} 40 V18`} />
            <rect x={x - 20} y="160" width="40" height="8" />
            <rect x={x - 20} y="240" width="40" height="8" />
          </g>
        ))}
        {/* side chhatris */}
        {[330, 870].map((x) => (
          <g key={x}>
            <rect x={x - 50} y="210" width="100" height="150" />
            <path d={`M${x - 40} 210 Q${x - 40} 150 ${x} 140 Q${x + 40} 150 ${x + 40} 210 Z`} />
            <path d={`M${x} 140 V118`} />
          </g>
        ))}
        {/* main dome */}
        <rect x="430" y="200" width="340" height="160" />
        <path d="M470 200 C440 120 520 60 600 34 C680 60 760 120 730 200 Z" />
        <path d="M600 34 V0" />
        <rect x="540" y="250" width="120" height="110" fill="#0b1427" />
      </g>
      <circle cx="600" cy="6" r="4" fill="#C5A46D" />
    </svg>
  );
}
