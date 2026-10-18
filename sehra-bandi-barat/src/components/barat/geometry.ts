/** Procedural Mughal arch geometry (all SVG path strings). */

type Pt = [number, number];

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

const f = (n: number) => Math.round(n * 10) / 10;

export type ArchSpec = { x0: number; x1: number; base: number; spring: number; apex: number };

function halves(a: ArchSpec) {
  const W = a.x1 - a.x0;
  const H = a.spring - a.apex;
  const cx = (a.x0 + a.x1) / 2;
  const left: [Pt, Pt, Pt, Pt] = [
    [a.x0, a.spring],
    [a.x0, a.spring - 0.62 * H],
    [cx - 0.2 * W, a.apex + 0.3 * H],
    [cx, a.apex],
  ];
  const right: [Pt, Pt, Pt, Pt] = [
    [a.x1, a.spring],
    [a.x1, a.spring - 0.62 * H],
    [cx + 0.2 * W, a.apex + 0.3 * H],
    [cx, a.apex],
  ];
  return { left, right, cx };
}

/** Pointed ogee arch outline incl. pillars, drawn as ONE continuous stroke (left base → apex → right base). */
export function archOutline(a: ArchSpec) {
  const { left, right } = halves(a);
  return [
    `M${f(a.x0)},${f(a.base)}`,
    `L${f(a.x0)},${f(a.spring)}`,
    `C${f(left[1][0])},${f(left[1][1])} ${f(left[2][0])},${f(left[2][1])} ${f(left[3][0])},${f(left[3][1])}`,
    `C${f(right[2][0])},${f(right[2][1])} ${f(right[1][0])},${f(right[1][1])} ${f(right[0][0])},${f(right[0][1])}`,
    `L${f(a.x1)},${f(a.base)}`,
  ].join(" ");
}

/** Closed filled arch shape (for masks / openings). */
export function archShape(a: ArchSpec) {
  return archOutline(a) + " Z";
}

/** Half-arch path, base → apex, for symmetric "drawing" animations. */
export function archHalf(a: ArchSpec, side: "left" | "right") {
  const { left, right } = halves(a);
  const h = side === "left" ? left : right;
  const x = side === "left" ? a.x0 : a.x1;
  return `M${f(x)},${f(a.base)} L${f(x)},${f(a.spring)} C${f(h[1][0])},${f(h[1][1])} ${f(h[2][0])},${f(h[2][1])} ${f(h[3][0])},${f(h[3][1])}`;
}

/** Multifoil (cusped) inner arch: scallops between inward-pointing cusps. */
export function cuspedArch(a: ArchSpec, lobes = 4, inset = 10) {
  const { left, right, cx } = halves(a);
  const sample = (h: typeof left, t: number, k: number): Pt => {
    const p = cubic(h[0], h[1], h[2], h[3], t);
    // push toward arch centre line by k
    const dx = cx - p[0];
    const dy = a.spring - p[1];
    const len = Math.hypot(dx, dy) || 1;
    return [p[0] + (dx / len) * k, p[1] + (dy / len) * k * 0.6 + k * 0.4];
  };
  const seg = (h: typeof left) => {
    const pts: string[] = [];
    for (let i = 0; i < lobes; i++) {
      const t0 = i / lobes;
      const t1 = (i + 1) / lobes;
      const tm = (t0 + t1) / 2;
      const c = sample(h, tm, -inset * 0.35);
      const e = sample(h, t1, i + 1 === lobes ? inset * 0.4 : inset);
      pts.push(`Q${f(c[0])},${f(c[1])} ${f(e[0])},${f(e[1])}`);
    }
    return pts;
  };
  const start = sample(left, 0, inset);
  const l = seg(left);
  // right side reversed: build forward then mirror by sampling reverse
  const r: string[] = [];
  for (let i = lobes; i > 0; i--) {
    const t1 = i / lobes;
    const t0 = (i - 1) / lobes;
    const tm = (t0 + t1) / 2;
    const c = sample(right, tm, -inset * 0.35);
    const e = sample(right, t0, inset);
    r.push(`Q${f(c[0])},${f(c[1])} ${f(e[0])},${f(e[1])}`);
  }
  return [`M${f(start[0])},${f(a.base)}`, `L${f(start[0])},${f(start[1])}`, ...l, ...r, `L${f(sample(right, 0, inset)[0])},${f(a.base)}`].join(" ");
}

/** n-point star polygon. */
export function star(cx: number, cy: number, rOuter: number, rInner: number, n: number, rot = -Math.PI / 2) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? rInner : rOuter;
    const ang = rot + (i * Math.PI) / n;
    pts.push(`${f(cx + r * Math.cos(ang))},${f(cy + r * Math.sin(ang))}`);
  }
  return `M${pts.join(" L")} Z`;
}

/** Petal rosette: n lens-shaped petals around a centre. */
export function rosette(cx: number, cy: number, r: number, n: number, w = 0.32) {
  const d: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2;
    const ex = cx + r * Math.cos(a);
    const ey = cy + r * Math.sin(a);
    const nx = -Math.sin(a) * r * w;
    const ny = Math.cos(a) * r * w;
    const mx = (cx + ex) / 2;
    const my = (cy + ey) / 2;
    d.push(`M${f(cx)},${f(cy)} Q${f(mx + nx)},${f(my + ny)} ${f(ex)},${f(ey)} Q${f(mx - nx)},${f(my - ny)} ${f(cx)},${f(cy)} Z`);
  }
  return d.join(" ");
}
