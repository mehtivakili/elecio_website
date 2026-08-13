/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Ported from a standalone Three.js scene the user supplied directly
 * (elecio_smart_dnc_3d_v6.html, doc/journey.md 2026-08-07) — a fully procedural, parametric
 * model of the real device (extruded/lofted housing geometry measured off the physical unit,
 * PBR materials, procedurally-painted decals/screen/environment map, real shadows). No .glb file
 * is loaded — everything here is built in code, which is exactly why the user pointed at this
 * file instead of `3dObject/*.glb` ("use the model created on the html file not those gbd
 * files").
 *
 * Kept close to the original structure/math (it's precise, measured geometry — rewriting it
 * would risk introducing errors for no benefit). What changed for the React/marketing-site
 * integration:
 *  - The original's dev-tool UI (DOM buttons for view presets/finish/toggles, a spec rail) is
 *    NOT ported — this file only builds and renders the scene. The marketing page supplies its
 *    own on-brand UI around the canvas.
 *  - `state.spin`/pointer-drag-driven `goal.t` (rotation) is replaced with `setSpinProgress()`,
 *    driven by scroll position, for the one-time cinematic reveal the user asked for (Apple
 *    iPhone page-style). Drag-to-orbit is kept as a bonus interaction; wheel/pinch-zoom were
 *    dropped since they'd fight normal page scrolling once embedded in a real page section
 *    instead of a full-viewport standalone demo.
 *  - `THREE.sRGBEncoding`/`texture.encoding` (Three.js r128-era API) updated to the current
 *    `SRGBColorSpace`/`texture.colorSpace` API (this project is on three@0.185).
 */
import * as THREE from 'three';

const TAU = Math.PI * 2;
const FONT = '"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';

// ---------- 0. constants (millimetres, measured off the DB-25 connector) ----------
const W = 80,
  R_CORNER = 12;
const HALF_D = 12.25;
const FILLET = 2.8;
const FACE = HALF_D;
const PLATE = 2.2;
const FLOOR = FACE - PLATE;
const WALL_TOP = 8.85;
const NSEG = 300;

type Finish = {
  shell: number;
  inner: number;
  cap: number;
  bezel: number;
  rough: number;
  normalScale: number;
  clearcoat: number;
  decal: string;
  decalBack: string;
};

const FINISH: Record<'black' | 'white', Finish> = {
  black: {
    shell: 0x1c1f24,
    inner: 0x121419,
    cap: 0xdcd8cc,
    bezel: 0x090b0e,
    rough: 0.57,
    normalScale: 0.45,
    clearcoat: 0.26,
    decal: 'rgba(146,152,162,.95)',
    decalBack: 'rgba(170,176,186,.92)',
  },
  white: {
    shell: 0xeceae5,
    inner: 0xc7c6c1,
    cap: 0xa7abab,
    bezel: 0x0f1216,
    rough: 0.42,
    normalScale: 0.28,
    clearcoat: 0.38,
    decal: 'rgba(92,97,105,.96)',
    decalBack: 'rgba(80,85,93,.96)',
  },
};

// ---------- 1. 2D helpers ----------
function rrPoints(w: number, h: number, r: number, seg?: number) {
  seg = seg || 10;
  r = Math.min(r, Math.min(w, h) / 2);
  const x = w / 2 - r,
    y = h / 2 - r,
    p: THREE.Vector2[] = [];
  const arc = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= seg!; i++) {
      const a = a0 + (i / seg!) * (Math.PI / 2);
      p.push(new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
    }
  };
  arc(x, y, 0);
  arc(-x, y, Math.PI / 2);
  arc(-x, -y, Math.PI);
  arc(x, -y, Math.PI * 1.5);
  return p;
}
function circlePoints(rad: number, seg?: number) {
  const p: THREE.Vector2[] = [];
  seg = seg || 44;
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * TAU;
    p.push(new THREE.Vector2(Math.cos(a) * rad, Math.sin(a) * rad));
  }
  return p;
}
function dSubPoints(wTop: number, wBot: number, h: number, r: number) {
  return rrPoints(wTop, h, r, 6).map((v) => {
    const k = 1 - (1 - wBot / wTop) * (0.5 - v.y / h);
    return new THREE.Vector2(v.x * k, v.y);
  });
}
function place(pts: THREE.Vector2[], cx: number, cy: number, rot?: number) {
  const c = Math.cos(rot || 0),
    s = Math.sin(rot || 0);
  return pts.map((v) => new THREE.Vector2(v.x * c - v.y * s + cx, v.x * s + v.y * c + cy));
}
const shapeOf = (pts: THREE.Vector2[]) => new THREE.Shape(pts);
const pathOf = (pts: THREE.Vector2[]) => {
  const p = new THREE.Path();
  p.setFromPoints(pts);
  p.closePath();
  return p;
};

function slab(shape: THREE.Shape, thickness: number, bevel?: number, curveSeg?: number) {
  const b = bevel || 0;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, thickness - 2 * b),
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b,
    bevelOffset: 0,
    bevelSegments: b > 0 ? 3 : 0,
    curveSegments: curveSeg || 14,
    steps: 1,
  });
  g.translate(0, 0, b);
  return g;
}

// ---------- 2. shoulder loft between the outline and the raised front plateau ----------
const PL = { half: 32, diag: 46 };

function outlineRadius(th: number) {
  const ux = Math.cos(th),
    uy = Math.sin(th),
    a = W / 2,
    c = a - R_CORNER;
  if (Math.abs(ux) > 1e-9) {
    const t = a / Math.abs(ux);
    if (Math.abs(t * uy) <= c) return t;
  }
  if (Math.abs(uy) > 1e-9) {
    const t = a / Math.abs(uy);
    if (Math.abs(t * ux) <= c) return t;
  }
  const Cx = c * Math.sign(ux || 1),
    Cy = c * Math.sign(uy || 1);
  const b = ux * Cx + uy * Cy,
    cc = Cx * Cx + Cy * Cy - R_CORNER * R_CORNER;
  return b + Math.sqrt(Math.max(0, b * b - cc));
}
function plateauRadiusRaw(th: number) {
  const ax = Math.abs(Math.cos(th)),
    ay = Math.abs(Math.sin(th));
  let r = 1e9;
  if (ax > 1e-9) r = Math.min(r, PL.half / ax);
  if (ay > 1e-9) r = Math.min(r, PL.half / ay);
  return Math.min(r, PL.diag / (ax + ay));
}
const ANG: number[] = [],
  R_OUT: number[] = [],
  R_PL: number[] = [];
(function () {
  const raw: number[] = [];
  for (let i = 0; i < NSEG; i++) {
    const th = (i / NSEG) * TAU;
    ANG.push(th);
    R_OUT.push(outlineRadius(th));
    raw.push(plateauRadiusRaw(th));
  }
  const k = 5;
  for (let i = 0; i < NSEG; i++) {
    let s = 0,
      n = 0;
    for (let j = -k; j <= k; j++) {
      s += raw[(i + j + NSEG) % NSEG];
      n++;
    }
    R_PL.push(s / n);
  }
})();
const ptOut = (i: number) => new THREE.Vector2(Math.cos(ANG[i]) * R_OUT[i], Math.sin(ANG[i]) * R_OUT[i]);
const ptPl = (i: number, grow?: number) => {
  const r = R_PL[i] + (grow || 0);
  return new THREE.Vector2(Math.cos(ANG[i]) * r, Math.sin(ANG[i]) * r);
};
function plateauShapePoints(grow?: number) {
  const p: THREE.Vector2[] = [];
  for (let i = 0; i < NSEG; i++) p.push(ptPl(i, grow));
  return p;
}

const NROW = 40;
const SLOT_C = 29.2;
const SLOT_HL = 5.0,
  SLOT_R = 3.0;
const SLOT_DEPTH = 0.85,
  SLOT_WALL = 0.95;

function shoulderRow(u: number): [number, number] {
  const drop = FACE - WALL_TOP;
  return [u, WALL_TOP + drop * (1 - (1 - u) * (1 - u))];
}
function slotDepth(x: number, y: number) {
  let d = 0;
  for (let sx = -1; sx <= 1; sx += 2)
    for (let sy = -1; sy <= 1; sy += 2) {
      const cx = sx * SLOT_C,
        cy = sy * SLOT_C;
      const ax = sx * Math.SQRT1_2,
        ay = sy * Math.SQRT1_2;
      let t = (x - cx) * ax + (y - cy) * ay;
      t = Math.max(-SLOT_HL, Math.min(SLOT_HL, t));
      const dist = Math.hypot(x - cx - ax * t, y - cy - ay * t) - SLOT_R;
      if (dist < SLOT_WALL) {
        let k = Math.max(0, Math.min(1, -dist / SLOT_WALL));
        k = k * k * (3 - 2 * k);
        d = Math.max(d, SLOT_DEPTH * k);
      }
    }
  return d;
}

function buildShoulder() {
  const rows: [number, number][] = [];
  for (let j = 0; j < NROW; j++) rows.push(shoulderRow(j / (NROW - 1)));
  const row = NSEG + 1,
    pos: number[] = [],
    uv: number[] = [],
    idx: number[] = [];
  for (let j = 0; j < NROW; j++) {
    const b = rows[j][0],
      z = rows[j][1];
    for (let i = 0; i <= NSEG; i++) {
      const k = i % NSEG,
        o = ptOut(k),
        p = ptPl(k, 0);
      pos.push(o.x + (p.x - o.x) * b, o.y + (p.y - o.y) * b, z);
      uv.push((i / NSEG) * 5.2, 0.72 + b * 0.28);
    }
  }
  for (let j = 0; j < NROW - 1; j++)
    for (let i = 0; i < NSEG; i++) {
      const a = j * row + i,
        b2 = a + 1,
        c = a + row,
        d = c + 1;
      idx.push(a, b2, c, b2, d, c);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();

  const P = g.attributes.position,
    N = g.attributes.normal;
  for (let v = 0; v < P.count; v++) {
    const x = P.getX(v),
      y = P.getY(v),
      z = P.getZ(v);
    const d = slotDepth(x, y);
    if (d > 0) P.setXYZ(v, x - N.getX(v) * d, y - N.getY(v) * d, z - N.getZ(v) * d);
  }
  P.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

function buildRim() {
  const N = NSEG;
  const nrm: THREE.Vector2[] = [];
  for (let i = 0; i < N; i++) {
    const a = ptOut((i - 1 + N) % N),
      b = ptOut((i + 1) % N);
    const t = new THREE.Vector2(b.x - a.x, b.y - a.y).normalize();
    nrm.push(new THREE.Vector2(t.y, -t.x));
  }
  const prof: [number, number][] = [];
  const K = 8,
    zw = HALF_D - FILLET;
  for (let i = 0; i <= K; i++) {
    const a = (i / K) * (Math.PI / 2);
    prof.push([FILLET * (1 - Math.sin(a)), -zw - FILLET * Math.cos(a)]);
  }
  prof.push([0, -6.4], [0.32, -6.1], [0.32, -5.25], [0, -4.95], [0, WALL_TOP]);

  const M = prof.length,
    pos: number[] = [],
    uv: number[] = [],
    idx: number[] = [];
  for (let j = 0; j < M; j++)
    for (let i = 0; i <= N; i++) {
      const k = i % N,
        p = ptOut(k),
        n = nrm[k];
      pos.push(p.x - n.x * prof[j][0], p.y - n.y * prof[j][0], prof[j][1]);
      uv.push((i / N) * 5.2, (prof[j][1] + HALF_D) / (HALF_D * 2));
    }
  const row = N + 1;
  for (let j = 0; j < M - 1; j++)
    for (let i = 0; i < N; i++) {
      const a = j * row + i,
        b = a + 1,
        c = a + row,
        d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ---------- 3. feature layout, measured from the photographs ----------
const INSET = W - FILLET * 2;
const BEV = 0.15;
const DISPLAY = { w: 24, h: 14.0, y: 12.9, activeW: 21.7, activeH: 10.9 };
const KEY = { n: 3, gap: 13.4, y: -9.6, pocket: 11.4, cap: 8.6, bezel: 11.2 };
const VENTS: [number, number, number][] = [
  [0, 23.1, 45],
  [0.9, 18.7, 50],
  [-1.4, 14.3, 40],
  [-1.4, -14.3, 40],
  [0.9, -18.7, 50],
  [0, -23.1, 45],
];
const SCREWS: [number, number][] = [
  [-28.2, 28.2],
  [28.2, 28.2],
  [-28.2, -28.2],
  [28.2, -28.2],
];
const KEYHOLES: [number, number][] = [
  [-27.6, 0],
  [27.6, 0],
];
const PLAQUE = { w: 40, h: 24, y: -0.6 };
const SW_X = -19.4,
  JK_X = 24.1;
const DB = {
  shellW: 38.96,
  shellWb: 36.4,
  shellH: 12.55,
  flangeW: 53.04,
  flangeH: 16.33,
  stick: 6.8,
  screwPitch: 23.5,
};

// ---------- 4. procedural textures ----------
const CANVAS = 1200;
const PX = CANVAS / W;
function cv(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
const X = (mm: number) => CANVAS / 2 + mm * PX;
const Y = (mm: number) => CANVAS / 2 - mm * PX;

function fitText(g: CanvasRenderingContext2D, text: string, weight: string, targetMM: number) {
  g.font = weight + ' 100px ' + FONT;
  const w = g.measureText(text).width || 100;
  const size = (100 * (targetMM * PX)) / w;
  g.font = weight + ' ' + size.toFixed(1) + 'px ' + FONT;
  return size;
}

function grainNormal() {
  const S = 512,
    h = new Float32Array(S * S);
  for (let i = 0; i < S * S; i++) h[i] = Math.random();
  const sm = new Float32Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let s = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) s += h[((y + dy + S) % S) * S + ((x + dx + S) % S)];
      sm[y * S + x] = (s / 9) * 0.65 + h[y * S + x] * 0.35;
    }
  const out = cv(S, S),
    o = out.getContext('2d')!,
    oi = o.createImageData(S, S);
  const at = (x: number, y: number) => sm[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 2.3,
        dy = (at(x, y + 1) - at(x, y - 1)) * 2.3,
        i = (y * S + x) * 4;
      oi.data[i] = 128 - dx * 127;
      oi.data[i + 1] = 128 - dy * 127;
      oi.data[i + 2] = 255;
      oi.data[i + 3] = 255;
    }
  o.putImageData(oi, 0, 0);
  const t = new THREE.CanvasTexture(out);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(8, 8);
  return t;
}

function drawMark(g: CanvasRenderingContext2D, cx: number, cy: number, hMM: number, color: string) {
  const s = hMM * PX;
  g.save();
  g.translate(cx, cy);
  g.strokeStyle = color;
  g.lineCap = 'round';
  const r = s * 0.245,
    d = s * 0.255;
  [
    [0, -d],
    [-d * 0.92, d * 0.6],
    [d * 0.92, d * 0.6],
  ].forEach((p) => {
    g.lineWidth = s * 0.062;
    g.beginPath();
    g.arc(p[0], p[1], r, 0, TAU);
    g.stroke();
    g.lineWidth = s * 0.042;
    g.beginPath();
    g.arc(p[0], p[1], r * 0.5, 0.7, 0.7 + Math.PI * 1.5);
    g.stroke();
  });
  g.restore();
}

function frontDecal(f: Finish) {
  const c = cv(CANVAS, CANVAS),
    g = c.getContext('2d')!;
  g.fillStyle = f.decal;
  g.strokeStyle = f.decal;
  g.textBaseline = 'alphabetic';
  drawMark(g, X(-11.0), Y(24.0), 8.4, f.decal);
  g.textAlign = 'left';
  fitText(g, 'ELECIO', '700', 20.0);
  g.fillText('ELECIO', X(-6.1), Y(25.2));
  fitText(g, 'SMART DNC', '600', 17.0);
  g.fillText('SMART DNC', X(-6.0), Y(20.5));
  g.textAlign = 'center';
  fitText(g, 'ENTER', '700', 10.4);
  g.fillText('ENTER', X(-KEY.gap), Y(-18.9));
  g.fillText('DOWN', X(0), Y(-18.9));
  g.fillText('UP', X(KEY.gap), Y(-18.9));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function backDecal(f: Finish, model: string) {
  const c = cv(CANVAS, CANVAS),
    g = c.getContext('2d')!;
  g.fillStyle = f.decalBack;
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  const suffix = model.split('-')[1];
  const lines = ['Model Num: ' + model, 'Default IP: 192.168.4.1', 'WiFi SSID: Elecio-' + suffix, 'WiFi Pass: Elecio-' + suffix];
  fitText(g, lines[0], '500', 33.0);
  lines.forEach((t, i) => g.fillText(t, X(-17.0), Y(8.6 - i * 6.0)));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function edgeDecal(f: Finish) {
  const w = CANVAS,
    h = Math.round(CANVAS / 3),
    c = cv(w, h),
    g = c.getContext('2d')!;
  const EY = (mm: number) => h / 2 - mm * PX;
  g.fillStyle = f.decal;
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  fitText(g, 'OFF', '700', 5.0);
  g.fillText('ON', X(-7.6), EY(2.3));
  g.fillText('OFF', X(-7.6), EY(-2.3));
  g.fillText('DC', X(14.0), EY(2.3));
  g.fillText('IN', X(14.0), EY(-2.3));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function screenTexture(on: boolean) {
  const c = cv(512, 256),
    g = c.getContext('2d')!;
  g.fillStyle = '#03050a';
  g.fillRect(0, 0, 512, 256);
  if (!on) {
    const t0 = new THREE.CanvasTexture(c);
    t0.colorSpace = THREE.SRGBColorSpace;
    return t0;
  }
  const mx = ((DISPLAY.w - DISPLAY.activeW) / DISPLAY.w) * (512 / 2);
  const my = ((DISPLAY.h - DISPLAY.activeH) / DISPLAY.h) * (256 / 2);
  const sx = (512 - 2 * mx) / 128,
    sy = (256 - 2 * my) / 64;
  const P = (x: number, y: number): [number, number] => [mx + x * sx, my + y * sy];
  const rect = (x: number, y: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    const a = P(x, y);
    g.fillRect(a[0], a[1], w * sx, h * sy);
  };
  const YEL = '#ffd400',
    CYA = '#3fc4ff';

  g.strokeStyle = YEL;
  g.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    g.lineWidth = 1.3 * sy;
    g.beginPath();
    const o = P(7, 12.5);
    g.arc(o[0], o[1], (2.2 + k * 2.3) * sx, -Math.PI * 0.78, -Math.PI * 0.22);
    g.stroke();
  }
  rect(6.2, 10.6, 1.6, 1.8, YEL);

  g.textBaseline = 'alphabetic';
  g.fillStyle = YEL;
  g.font = '700 ' + 10.4 * sy + 'px ui-monospace,Menlo,Consolas,monospace';
  g.fillText('192.168.30.130', P(15, 13)[0], P(15, 13)[1]);

  g.strokeStyle = YEL;
  g.lineWidth = 1.2 * sy;
  const ic = P(120, 7.5);
  g.beginPath();
  g.arc(ic[0], ic[1], 4.4 * sx, 0, TAU);
  g.stroke();
  g.beginPath();
  g.moveTo(ic[0], ic[1] - 2.4 * sy);
  g.lineTo(ic[0], ic[1]);
  g.lineTo(ic[0] + 2.2 * sx, ic[1] + 1.2 * sy);
  g.stroke();

  rect(0, 15.5, 128, 1.4, YEL);

  const rows: [string, boolean][] = [
    ['E4CF', true],
    ['PILIS', false],
    ['PEACK', false],
  ];
  g.font = '700 ' + 12.6 * sy + 'px ui-monospace,Menlo,Consolas,monospace';
  rows.forEach((r, i) => {
    const y = 20 + i * 14.6;
    if (r[1]) {
      rect(1.5, y - 1.5, g.measureText(r[0]).width / sx + 3, 12.6, CYA);
      g.fillStyle = '#03050a';
    } else g.fillStyle = CYA;
    g.fillText(r[0], P(3, y + 9.4)[0], P(3, y + 9.4)[1]);
  });

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function envTexture() {
  const w = 1024,
    h = 512,
    c = cv(w, h),
    g = c.getContext('2d')!;
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#414c5c');
  sky.addColorStop(0.47, '#1b212a');
  sky.addColorStop(0.53, '#0a0d11');
  sky.addColorStop(1, '#04060a');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  const box = (x: number, y: number, rw: number, rh: number, a: number) => {
    const r = g.createRadialGradient(x, y, 0, x, y, Math.max(rw, rh));
    r.addColorStop(0, 'rgba(255,255,255,' + a + ')');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.save();
    g.translate(x, y);
    g.scale(1, rh / rw);
    g.fillStyle = r;
    g.beginPath();
    g.arc(0, 0, rw, 0, TAU);
    g.fill();
    g.restore();
  };
  box(250, 110, 250, 160, 1.0);
  box(770, 150, 190, 130, 0.6);
  box(520, 50, 440, 95, 0.34);
  box(110, 330, 190, 130, 0.18);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- views (camera presets + spec copy, reused by the marketing page) ----------
export const VIEWS = {
  iso: {
    t: 0.62,
    p: 1.17,
    r: 232,
    title: 'Studio three-quarter',
    specs: [
      ['Housing', '80 x 80 x 24.5 mm'],
      ['Shell', '2-part ABS, 4 screws'],
      ['Display', '0.96" OLED'],
      ['Serial', 'DB-25 male'],
      ['Supply', '5.5 x 2.1 mm, 12 V'],
    ],
  },
  compatibility: {
    t: 0.56,
    p: 1.2,
    r: 292,
    title: 'Compatibility orbit',
    specs: [],
  },
  front: {
    t: 0.0,
    p: 1.5708,
    r: 212,
    title: 'Front elevation',
    specs: [
      ['Window', '24 x 13.6 mm'],
      ['Keys', 'Enter / Down / Up'],
      ['Key pitch', '13.4 mm'],
      ['Key travel', 'proud 1.35 mm'],
      ['Plateau', '64 mm + 8 mm shoulder'],
    ],
  },
  back: {
    t: Math.PI,
    p: 1.5708,
    r: 212,
    title: 'Rear elevation',
    specs: [
      ['Label', 'Model / IP / SSID'],
      ['Mounting', '2 x keyhole'],
      ['Vents', '6 slots'],
      ['Fixings', '4 x M3 pan'],
      ['Status LED', 'blue, internal'],
    ],
  },
  top: {
    t: 0.1,
    p: 0.42,
    r: 224,
    title: 'Power edge',
    specs: [
      ['Switch', 'latching, 14.5 mm'],
      ['Jack', 'DC 5.5 x 2.1 mm'],
      ['Input', '12 V, 0.5 A'],
      ['Edge', '24.5 mm deep'],
      ['Fillet', 'R2.8'],
    ],
  },
  ports: {
    t: 0.28,
    p: 2.3,
    r: 220,
    title: 'Serial edge',
    specs: [
      ['Connector', 'DB-25 male'],
      ['Shell', '38.96 mm'],
      ['Screw pitch', '47.04 mm'],
      ['Pins', '13 + 12 @ 2.77'],
      ['Protocol', 'RS-232 DNC'],
    ],
  },
} as const;
export type ViewKey = keyof typeof VIEWS;

export type OrbitBadge = {
  label: string;
  image?: string;
};

export type SceneOptions = {
  orbitBadges?: OrbitBadge[];
  view?: ViewKey;
};

export type SceneHandle = {
  setSpinProgress(p: number): void;
  setOrbitProgress(p: number): void;
  setAutoRotate(on: boolean): void;
  setActive(on: boolean): void;
  setFinish(f: 'black' | 'white'): void;
  setView(key: ViewKey): void;
  resize(): void;
  destroy(): void;
};

export function createElecioScene(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  initialFinish: 'black' | 'white' = 'black',
  options: SceneOptions = {},
): SceneHandle {
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  // A 2x canvas contains four times as many pixels. That is unnecessarily expensive for a
  // continuously changing 3D object on a small screen, where 1.35x remains visually crisp.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.15 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(27, 1, 1, 3000);
  const orbitSprites: THREE.Sprite[] = [];
  let orbitProgress = 0;
  let orbitCurrent = 0;

  function labelTexture(label: string, lightMode = initialFinish === 'white') {
    const surface = document.createElement('canvas');
    surface.width = 640;
    surface.height = 180;
    const context = surface.getContext('2d')!;
    context.clearRect(0, 0, surface.width, surface.height);
    context.fillStyle = lightMode ? '#111827' : '#f7f9fc';
    context.font = '800 64px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, surface.width / 2, surface.height / 2);
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  function isolatedLogoTexture(source: CanvasImageSource, lightMode = initialFinish === 'white') {
    const work = document.createElement('canvas');
    work.width = 512;
    work.height = 512;
    const workContext = work.getContext('2d', { willReadFrequently: true })!;
    workContext.drawImage(source, 0, 0, work.width, work.height);
    const pixels = workContext.getImageData(0, 0, work.width, work.height);
    let minX = work.width;
    let minY = work.height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < work.height; y += 1) {
      for (let x = 0; x < work.width; x += 1) {
        const offset = (y * work.width + x) * 4;
        const red = pixels.data[offset];
        const green = pixels.data[offset + 1];
        const blue = pixels.data[offset + 2];
        if (red > 244 && green > 244 && blue > 244) {
          pixels.data[offset + 3] = 0;
          continue;
        }
        if (red + green + blue < 135 && !lightMode) {
          pixels.data[offset] = 247;
          pixels.data[offset + 1] = 249;
          pixels.data[offset + 2] = 252;
        }
        if (pixels.data[offset + 3] > 18) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    workContext.putImageData(pixels, 0, 0);

    const output = document.createElement('canvas');
    output.width = 640;
    output.height = 200;
    const outputContext = output.getContext('2d')!;
    if (minX <= maxX && minY <= maxY) {
      const cropWidth = maxX - minX + 1;
      const cropHeight = maxY - minY + 1;
      const scale = Math.min(580 / cropWidth, 160 / cropHeight);
      const width = cropWidth * scale;
      const height = cropHeight * scale;
      outputContext.drawImage(work, minX, minY, cropWidth, cropHeight, (640 - width) / 2, (200 - height) / 2, width, height);
    }
    const texture = new THREE.CanvasTexture(output);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  function updateOrbitBadges() {
    const count = orbitSprites.length;
    orbitSprites.forEach((sprite, index) => {
      const angle = (index / count) * Math.PI * 2 + orbitCurrent * Math.PI * 1.7 - Math.PI / 2;
      sprite.position.set(Math.cos(angle) * 96, 20 + Math.sin(angle * 2) * 25, Math.sin(angle) * 62);
      const depthScale = 0.84 + ((Math.sin(angle) + 1) / 2) * 0.22;
      sprite.scale.set(sprite.userData.baseWidth * depthScale, sprite.userData.baseHeight * depthScale, 1);
    });
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(envTexture()).texture;

  scene.add(new THREE.HemisphereLight(0x9fb6d6, 0x090c11, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.35);
  key.position.set(-110, 150, 120);
  key.castShadow = true;
  key.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  key.shadow.radius = 4;
  key.shadow.bias = -0.0009;
  const sc = key.shadow.camera;
  sc.left = -110;
  sc.right = 110;
  sc.top = 110;
  sc.bottom = -110;
  sc.near = 50;
  sc.far = 420;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbcd3f2, 0.6);
  fill.position.set(140, 45, 90);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x8fb4ff, 1.15);
  rim.position.set(45, -35, -150);
  scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.ShadowMaterial({ opacity: 0.35 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -62;
  ground.receiveShadow = true;
  scene.add(ground);

  const grain = grainNormal();
  const M: Record<string, THREE.Material> = {};
  function buildMaterials(f: Finish) {
    M.shell = new THREE.MeshPhysicalMaterial({
      color: f.shell,
      roughness: f.rough,
      metalness: 0,
      clearcoat: f.clearcoat,
      clearcoatRoughness: 0.6,
      normalMap: grain,
      normalScale: new THREE.Vector2(f.normalScale, f.normalScale),
      envMapIntensity: 1.15,
    });
    M.floor = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(f.shell).multiplyScalar(0.72),
      roughness: Math.min(1, f.rough + 0.14),
      metalness: 0,
      normalMap: grain,
      normalScale: new THREE.Vector2(f.normalScale, f.normalScale),
      envMapIntensity: 0.5,
    });
    M.cavity = new THREE.MeshStandardMaterial({ color: 0x07080b, roughness: 0.95, metalness: 0 });
    M.bezel = new THREE.MeshPhysicalMaterial({ color: f.bezel, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.25 });
    M.cap = new THREE.MeshPhysicalMaterial({
      color: f.cap,
      roughness: 0.34,
      clearcoat: 0.9,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.15,
    });
    M.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.6,
    });
    M.steel = new THREE.MeshStandardMaterial({ color: 0xc2c7ce, roughness: 0.26, metalness: 1.0, envMapIntensity: 1.3 });
    M.steelDark = new THREE.MeshStandardMaterial({ color: 0x8d939c, roughness: 0.4, metalness: 1.0 });
    M.brass = new THREE.MeshStandardMaterial({ color: 0xd8c07a, roughness: 0.28, metalness: 1.0 });
    M.rubber = new THREE.MeshStandardMaterial({ color: 0x121417, roughness: 0.7, metalness: 0 });
    M.gloss = new THREE.MeshPhysicalMaterial({ color: 0x1a1d21, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 });
    M.led = new THREE.MeshBasicMaterial({ color: 0x2f7dff });
  }
  function decalMat(map: THREE.Texture) {
    return new THREE.MeshStandardMaterial({
      map,
      transparent: true,
      roughness: 0.55,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      depthWrite: false,
    });
  }

  const device = new THREE.Group();
  scene.add(device);
  let PARTS: any = {};

  function addMesh(geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], parent?: THREE.Object3D) {
    const m = new THREE.Mesh(geo, mat as THREE.Material);
    m.castShadow = true;
    m.receiveShadow = true;
    (parent || device).add(m);
    return m;
  }

  function build(f: Finish) {
    while (device.children.length) device.remove(device.children[0]);
    buildMaterials(f);
    PARTS = {};

    addMesh(buildRim(), M.shell);
    addMesh(buildShoulder(), M.shell);

    const block = slab(shapeOf(rrPoints(W - 1.1, W - 1.1, R_CORNER - 0.55, 20)), FLOOR + WALL_TOP - 0.1, 0, 20);
    block.translate(0, 0, -FLOOR);
    addMesh(block, [M.floor, M.shell]);

    const ffl = slab(shapeOf(plateauShapePoints(-0.4)), 1.0, 0, 1);
    ffl.translate(0, 0, FLOOR - 1.0);
    addMesh(ffl, [M.floor, M.shell]);

    const fs = shapeOf(plateauShapePoints(BEV));
    fs.holes.push(pathOf(place(rrPoints(DISPLAY.w, DISPLAY.h, 2.0, 6), 0, DISPLAY.y, 0)));
    for (let i = 0; i < KEY.n; i++)
      fs.holes.push(pathOf(place(rrPoints(KEY.pocket, KEY.pocket, 1.5, 6), (i - 1) * KEY.gap, KEY.y, 0)));
    const fp = slab(fs, PLATE, BEV, 1);
    fp.translate(0, 0, FLOOR);
    addMesh(fp, M.shell);

    const bs = shapeOf(rrPoints(INSET + 2 * BEV, INSET + 2 * BEV, R_CORNER - FILLET + BEV, 26));
    SCREWS.forEach(([x, y]) => bs.holes.push(pathOf(place(circlePoints(5.9, 30), x, y, 0))));
    KEYHOLES.forEach(([x, y]) => bs.holes.push(pathOf(place(rrPoints(13, 26, 6.5, 9), x, y, 0))));
    VENTS.forEach(([x, y, len]) => bs.holes.push(pathOf(place(rrPoints(len, 3.0, 1.5, 5), x, y, 0))));
    bs.holes.push(pathOf(place(rrPoints(PLAQUE.w, PLAQUE.h, 2.8, 6), 0, PLAQUE.y, 0)));
    const bp = slab(bs, PLATE, BEV, 26);
    bp.translate(0, 0, -FACE);
    addMesh(bp, M.shell);

    const ledGroup = new THREE.Group();
    device.add(ledGroup);
    PARTS.led = ledGroup;
    VENTS.forEach(([x, y, len], i) => {
      const g = slab(shapeOf(rrPoints(len + 0.6, 3.6, 1.8, 5)), 0.6, 0, 5);
      g.translate(x, y, -FLOOR - 0.6);
      addMesh(g, M.cavity);
      if (i < 3) {
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(len * 0.42, 2.2), M.led);
        gl.position.set(x - len * 0.16, y, -FLOOR - 0.64);
        gl.rotation.y = Math.PI;
        ledGroup.add(gl);
      }
    });
    const ledLight = new THREE.PointLight(0x3f8dff, 0, 70, 2);
    ledLight.position.set(0, 18, -8);
    ledGroup.add(ledLight);
    PARTS.ledLight = ledLight;

    const gw = DISPLAY.w - 0.8,
      gh = DISPLAY.h - 0.8;
    const glass = slab(shapeOf(rrPoints(gw, gh, 1.5, 6)), 1.8, 0.22, 10);
    glass.translate(0, DISPLAY.y, FLOOR + 0.1);
    PARTS.glass = addMesh(glass, M.glass);
    PARTS.gw = gw;
    PARTS.gh = gh;

    for (let i = 0; i < KEY.n; i++) {
      const x = (i - 1) * KEY.gap;
      const ring = new THREE.Shape(rrPoints(KEY.bezel, KEY.bezel, 1.4, 7));
      ring.holes.push(pathOf(rrPoints(KEY.cap + 0.5, KEY.cap + 0.5, 1.1, 7)));
      const rg = slab(ring, PLATE + 0.2, 0.16, 10);
      rg.translate(x, KEY.y, FLOOR);
      addMesh(rg, M.bezel);
      const cap = slab(shapeOf(rrPoints(KEY.cap, KEY.cap, 1.1, 8)), 3.05, 0.55, 10);
      cap.translate(x, KEY.y, FLOOR + 0.5);
      addMesh(cap, M.cap);
    }

    SCREWS.forEach(([x, y]) => {
      const head = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.0, 1.5, 30), M.steelDark);
      head.rotation.x = Math.PI / 2;
      head.position.set(x, y, -FLOOR - 0.75);
      head.castShadow = true;
      device.add(head);
      for (let k = 0; k < 2; k++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.0, 0.6), M.cavity);
        s.position.set(x, y, -FLOOR - 1.45);
        s.rotation.z = (k ? Math.PI / 2 : 0) + 0.5;
        device.add(s);
      }
      const ring = new THREE.Shape(circlePoints(7.6, 34));
      ring.holes.push(pathOf(circlePoints(5.8, 34)));
      const boss = slab(ring, 1.2, 0.35, 1);
      boss.translate(x, y, -FACE - 1.2);
      addMesh(boss, M.shell);
    });
    KEYHOLES.forEach(([x, y]) => {
      const slot = slab(shapeOf(rrPoints(5.2, 21, 2.6, 7)), 0.5, 0, 7);
      slot.translate(x, y, -FLOOR - 0.5);
      addMesh(slot, M.cavity);
      const hole = slab(shapeOf(circlePoints(4.6, 26)), 0.5, 0, 1);
      hole.translate(x, y, -FLOOR - 0.5);
      addMesh(hole, M.cavity);
    });
    [
      [-19.4, 11.3],
      [18.8, 2.4],
    ].forEach(([x, y]) => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.8, 14), M.brass);
      b.rotation.x = Math.PI / 2;
      b.position.set(x, y, -FLOOR - 0.35);
      device.add(b);
    });

    const fd = new THREE.Mesh(new THREE.PlaneGeometry(W, W), decalMat(frontDecal(f)));
    fd.position.z = FACE + 0.03;
    device.add(fd);
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(W, W), decalMat(backDecal(f, 'ELECIO-AF7E60')));
    bd.position.z = -FLOOR - 0.07;
    bd.rotation.y = Math.PI;
    device.add(bd);
    const ed = new THREE.Mesh(new THREE.PlaneGeometry(W, W / 3), decalMat(edgeDecal(f)));
    ed.rotation.x = -Math.PI / 2;
    ed.position.set(0, W / 2 + 0.03, 0);
    device.add(ed);

    const EY = W / 2;
    const swCollar = new THREE.Mesh(new THREE.CylinderGeometry(7.25, 7.4, 2.4, 40), M.rubber);
    swCollar.position.set(SW_X, EY + 0.8, 0);
    swCollar.castShadow = true;
    device.add(swCollar);
    const swWell = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.3, 1.8, 32), M.cavity);
    swWell.position.set(SW_X, EY + 1.5, 0);
    device.add(swWell);
    const swBtn = new THREE.Mesh(new THREE.SphereGeometry(5.0, 36, 22, 0, TAU, 0, Math.PI / 2), M.gloss);
    swBtn.scale.set(1, 0.45, 1);
    swBtn.position.set(SW_X, EY + 1.7, 0);
    swBtn.castShadow = true;
    device.add(swBtn);

    const jkOuter = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 1.8, 36), M.steel);
    jkOuter.position.set(JK_X, EY + 0.6, 0);
    jkOuter.castShadow = true;
    device.add(jkOuter);
    const jkIn = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 4.0, 32), M.cavity);
    jkIn.position.set(JK_X, EY - 0.6, 0);
    device.add(jkIn);
    const jkPin = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.6, 16), M.brass);
    jkPin.position.set(JK_X, EY - 1.0, 0);
    device.add(jkPin);

    const db = new THREE.Group();
    db.rotation.x = Math.PI / 2;
    db.position.y = -W / 2;
    device.add(db);
    const flange = slab(shapeOf(rrPoints(DB.flangeW, DB.flangeH, 1.6, 7)), 1.6, 0.3, 8);
    flange.translate(0, 0, -1.2);
    db.add(new THREE.Mesh(flange, M.steel));
    const shellGeo = slab(shapeOf(dSubPoints(DB.shellW, DB.shellWb, DB.shellH, 1.6)), DB.stick, 0.4, 10);
    shellGeo.translate(0, 0, 0.4);
    const shellMesh = new THREE.Mesh(shellGeo, M.steel);
    shellMesh.castShadow = true;
    db.add(shellMesh);
    const insGeo = slab(shapeOf(dSubPoints(DB.shellW - 3.4, DB.shellWb - 3.0, DB.shellH - 3.2, 1.2)), DB.stick - 1.8, 0.25, 10);
    insGeo.translate(0, 0, 0.9);
    db.add(new THREE.Mesh(insGeo, M.cavity));
    const pinGeo = new THREE.CylinderGeometry(0.55, 0.46, 4.6, 10);
    const pinRow = (n: number, y: number) => {
      const x0 = (-(n - 1) * 2.77) / 2;
      for (let i = 0; i < n; i++) {
        const p = new THREE.Mesh(pinGeo, M.brass);
        p.rotation.x = Math.PI / 2;
        p.position.set(x0 + i * 2.77, y, DB.stick - 2.0);
        db.add(p);
      }
    };
    pinRow(13, 1.42);
    pinRow(12, -1.42);
    [-DB.screwPitch, DB.screwPitch].forEach((x) => {
      const j = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 4.4, 6), M.steelDark);
      j.rotation.x = Math.PI / 2;
      j.rotation.y = Math.PI / 6;
      j.position.set(x, 0, 1.9);
      j.castShadow = true;
      db.add(j);
    });

    applyToggles();
  }

  const toggleState = { screen: true, led: true };
  function applyToggles() {
    if (PARTS.glass) {
      const t = screenTexture(toggleState.screen);
      t.repeat.set(1 / PARTS.gw, 1 / PARTS.gh);
      t.offset.set(0.5, 0.5);
      const m = PARTS.glass.material as THREE.MeshPhysicalMaterial;
      if (m.map) m.map.dispose();
      m.map = t;
      m.emissiveMap = t;
      m.emissive.setHex(0xffffff);
      m.emissiveIntensity = toggleState.screen ? 1.3 : 0.0;
      m.needsUpdate = true;
    }
    if (PARTS.led) {
      PARTS.led.visible = toggleState.led;
      PARTS.ledLight.intensity = toggleState.led ? 1.6 : 0;
    }
  }

  // ---------- camera orbit ----------
  const initialView = VIEWS[options.view ?? 'front'];
  const cam: { t: number; p: number; r: number } = { t: initialView.t, p: initialView.p, r: initialView.r };
  const goal: { t: number; p: number; r: number } = { t: initialView.t, p: initialView.p, r: initialView.r };
  let dragging = false,
    px = 0,
    py = 0;
  let spinProgress = 0;
  let autoRotate = false;
  const baseTheta = initialView.t;

  function onPointerDown(e: PointerEvent) {
    dragging = true;
    px = e.clientX;
    py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('dragging');
    queueFrame();
  }
  function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    goal.t -= (e.clientX - px) * 0.0085;
    goal.p -= (e.clientY - py) * 0.0075;
    goal.p = Math.max(0.12, Math.min(Math.PI - 0.12, goal.p));
    px = e.clientX;
    py = e.clientY;
    queueFrame();
  }
  function onPointerUp() {
    dragging = false;
    canvas.classList.remove('dragging');
  }
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => canvas.addEventListener(ev, onPointerUp));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const w = container.clientWidth || 1,
      h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 480 ? 34 : 27;
    camera.updateProjectionMatrix();
  }

  let rafId = 0;
  let running = true;
  let active = true;
  const queueFrame = () => {
    if (!running || !active || rafId) return;
    rafId = requestAnimationFrame(frame);
  };
  function frame() {
    rafId = 0;
    if (!running || !active) return;
    // Map the taller scroll section to one complete turn. With idle rotation disabled by the
    // section, both ends of the animation present the front face.
    if (!reduceMotion) {
      if (spinProgress < 1 || !autoRotate) {
        goal.t = baseTheta + spinProgress * TAU;
      } else if (autoRotate && !dragging) {
        goal.t += 0.0012;
      }
    }
    cam.t += (goal.t - cam.t) * 0.075;
    cam.p += (goal.p - cam.p) * 0.075;
    cam.r += (goal.r - cam.r) * 0.06;
    orbitCurrent += (orbitProgress - orbitCurrent) * 0.085;
    updateOrbitBadges();
    camera.position.set(cam.r * Math.sin(cam.p) * Math.sin(cam.t), cam.r * Math.cos(cam.p), cam.r * Math.sin(cam.p) * Math.cos(cam.t));
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);

    // Keep animating only while the camera is settling or the user is interacting. Scroll
    // updates schedule their own frame, so an idle scene no longer burns a full GPU frame loop.
    const settling =
      Math.abs(goal.t - cam.t) > 0.0001 ||
      Math.abs(goal.p - cam.p) > 0.0001 ||
      Math.abs(goal.r - cam.r) > 0.001 ||
      Math.abs(orbitProgress - orbitCurrent) > 0.0001;
    if (settling || dragging || autoRotate) queueFrame();
  }

  let currentFinish = initialFinish;
  build(FINISH[currentFinish]);

  const textureLoader = new THREE.TextureLoader();
  options.orbitBadges?.forEach((badge) => {
    const fallbackTexture = labelTexture(badge.label);
    const material = new THREE.SpriteMaterial({
      map: fallbackTexture,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      toneMapped: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.userData.label = badge.label;
    sprite.userData.baseWidth = Math.max(23, Math.min(37, badge.label.length * 3.1));
    sprite.userData.baseHeight = 10;
    orbitSprites.push(sprite);
    scene.add(sprite);

    if (badge.image) {
      textureLoader.load(badge.image, (texture) => {
        sprite.userData.sourceImage = texture.image as CanvasImageSource;
        const cleanedTexture = isolatedLogoTexture(sprite.userData.sourceImage);
        texture.dispose();
        material.map?.dispose();
        material.map = cleanedTexture;
        material.needsUpdate = true;
        queueFrame();
      });
    }
  });
  updateOrbitBadges();
  resize();
  queueFrame();

  return {
    setSpinProgress(p: number) {
      spinProgress = Math.max(0, Math.min(1, p));
      queueFrame();
    },
    setOrbitProgress(p: number) {
      orbitProgress = Math.max(0, Math.min(1, p));
      queueFrame();
    },
    setAutoRotate(on: boolean) {
      autoRotate = on;
      queueFrame();
    },
    setActive(on: boolean) {
      active = on;
      if (!active && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else {
        queueFrame();
      }
    },
    setFinish(f: 'black' | 'white') {
      if (f === currentFinish) return;
      currentFinish = f;
      build(FINISH[f]);
      orbitSprites.forEach((sprite) => {
        const material = sprite.material as THREE.SpriteMaterial;
        const texture = sprite.userData.sourceImage
          ? isolatedLogoTexture(sprite.userData.sourceImage, f === 'white')
          : labelTexture(sprite.userData.label, f === 'white');
        material.map?.dispose();
        material.map = texture;
        material.needsUpdate = true;
      });
      queueFrame();
    },
    setView(k: ViewKey) {
      const V = VIEWS[k];
      goal.t += ((V.t - goal.t + Math.PI * 3) % TAU) - Math.PI;
      goal.p = V.p;
      goal.r = V.r;
      queueFrame();
    },
    resize,
    destroy() {
      running = false;
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => canvas.removeEventListener(ev, onPointerUp));
      orbitSprites.forEach((sprite) => {
        const material = sprite.material as THREE.SpriteMaterial;
        material.map?.dispose();
        material.dispose();
      });
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
