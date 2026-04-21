// scripts/generate-letter-paths.js
// Extracts Arabic letter outlines from Noto Naskh Arabic, separates dots from body.

const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');

const FONT_PATH = path.join(__dirname, 'NotoNaskhArabic-Regular.ttf');
const OUT_PATH  = path.join(__dirname, '..', 'data', 'arabic-letters.ts');

const CANVAS = 300;
const TARGET = 200; // letter fills ~200px of the 300px canvas
// Absolute area threshold in font units² — real dots ≤ 18768; smallest counter ≥ 27968
const DOT_MAX_AREA = 22000;
const SAMPLE_COUNT = 80;

const LETTERS = [
  { id: 'alif',  arabic: 'ا', transliteration: 'Alif',  nameAr: 'ألف',  category: 'basics'  },
  { id: 'ba',    arabic: 'ب', transliteration: 'Ba',    nameAr: 'باء',  category: 'dotted'  },
  { id: 'ta',    arabic: 'ت', transliteration: 'Ta',    nameAr: 'تاء',  category: 'dotted'  },
  { id: 'tha',   arabic: 'ث', transliteration: 'Tha',   nameAr: 'ثاء',  category: 'dotted'  },
  { id: 'jim',   arabic: 'ج', transliteration: 'Jim',   nameAr: 'جيم',  category: 'complex' },
  { id: 'ha',    arabic: 'ح', transliteration: 'Ha',    nameAr: 'حاء',  category: 'complex' },
  { id: 'kha',   arabic: 'خ', transliteration: 'Kha',   nameAr: 'خاء',  category: 'dotted'  },
  { id: 'dal',   arabic: 'د', transliteration: 'Dal',   nameAr: 'دال',  category: 'basics'  },
  { id: 'dhal',  arabic: 'ذ', transliteration: 'Dhal',  nameAr: 'ذال',  category: 'dotted'  },
  { id: 'ra',    arabic: 'ر', transliteration: 'Ra',    nameAr: 'راء',  category: 'basics'  },
  { id: 'zay',   arabic: 'ز', transliteration: 'Zay',   nameAr: 'زاي',  category: 'dotted'  },
  { id: 'sin',   arabic: 'س', transliteration: 'Sin',   nameAr: 'سين',  category: 'basics'  },
  { id: 'shin',  arabic: 'ش', transliteration: 'Shin',  nameAr: 'شين',  category: 'dotted'  },
  { id: 'sad',   arabic: 'ص', transliteration: 'Sad',   nameAr: 'صاد',  category: 'complex' },
  { id: 'dad',   arabic: 'ض', transliteration: 'Dad',   nameAr: 'ضاد',  category: 'dotted'  },
  { id: 'tta',   arabic: 'ط', transliteration: 'Tta',   nameAr: 'طاء',  category: 'complex' },
  { id: 'dha',   arabic: 'ظ', transliteration: 'Dha',   nameAr: 'ظاء',  category: 'dotted'  },
  { id: 'ain',   arabic: 'ع', transliteration: 'Ain',   nameAr: 'عين',  category: 'complex' },
  { id: 'ghain', arabic: 'غ', transliteration: 'Ghain', nameAr: 'غين',  category: 'dotted'  },
  { id: 'fa',    arabic: 'ف', transliteration: 'Fa',    nameAr: 'فاء',  category: 'dotted'  },
  { id: 'qaf',   arabic: 'ق', transliteration: 'Qaf',   nameAr: 'قاف',  category: 'dotted'  },
  { id: 'kaf',   arabic: 'ك', transliteration: 'Kaf',   nameAr: 'كاف',  category: 'basics'  },
  { id: 'lam',   arabic: 'ل', transliteration: 'Lam',   nameAr: 'لام',  category: 'basics'  },
  { id: 'mim',   arabic: 'م', transliteration: 'Mim',   nameAr: 'ميم',  category: 'complex' },
  { id: 'nun',   arabic: 'ن', transliteration: 'Nun',   nameAr: 'نون',  category: 'dotted'  },
  { id: 'ha2',   arabic: 'ه', transliteration: 'Ha',    nameAr: 'هاء',  category: 'complex' },
  { id: 'waw',   arabic: 'و', transliteration: 'Waw',   nameAr: 'واو',  category: 'basics'  },
  { id: 'ya',    arabic: 'ي', transliteration: 'Ya',    nameAr: 'ياء',  category: 'dotted'  },
];

// ─── Bounding box ─────────────────────────────────────────────────────────────

function getBBox(commands) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let cx = 0, cy = 0;

  function expand(x, y) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  function sampleCubic(x0, y0, x1, y1, x2, y2, x3, y3) {
    for (let t = 0; t <= 1; t += 0.05) {
      const m = 1 - t;
      expand(m*m*m*x0+3*m*m*t*x1+3*m*t*t*x2+t*t*t*x3, m*m*m*y0+3*m*m*t*y1+3*m*t*t*y2+t*t*t*y3);
    }
  }
  function sampleQuad(x0, y0, x1, y1, x2, y2) {
    for (let t = 0; t <= 1; t += 0.05) {
      const m = 1 - t;
      expand(m*m*x0+2*m*t*x1+t*t*x2, m*m*y0+2*m*t*y1+t*t*y2);
    }
  }

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M': expand(cmd.x, cmd.y); cx=cmd.x; cy=cmd.y; break;
      case 'L': expand(cmd.x, cmd.y); cx=cmd.x; cy=cmd.y; break;
      case 'C': sampleCubic(cx,cy,cmd.x1,cmd.y1,cmd.x2,cmd.y2,cmd.x,cmd.y); cx=cmd.x; cy=cmd.y; break;
      case 'Q': sampleQuad(cx,cy,cmd.x1,cmd.y1,cmd.x,cmd.y); cx=cmd.x; cy=cmd.y; break;
    }
  }
  if (minX === Infinity) return { minX:0, minY:0, maxX:0, maxY:0, w:0, h:0 };
  return { minX, minY, maxX, maxY, w: maxX-minX, h: maxY-minY };
}

// ─── Sub-path splitting ───────────────────────────────────────────────────────

function splitSubPaths(commands) {
  const subs = [];
  let cur = [];
  for (const cmd of commands) {
    cur.push(cmd);
    if (cmd.type === 'Z') { subs.push([...cur]); cur = []; }
  }
  if (cur.length > 1) subs.push(cur);
  return subs.filter(s => s.length > 1);
}

function classifySubPaths(subPaths) {
  const bodySubPaths = [];
  const dotSubPaths  = [];
  for (const sp of subPaths) {
    const bb   = getBBox(sp);
    const area = bb.w * bb.h;
    if (area > 100 && area < DOT_MAX_AREA) dotSubPaths.push(sp);
    else if (area >= DOT_MAX_AREA)         bodySubPaths.push(sp);
    // ignore sub-paths with area ≤ 100 (degenerate)
  }
  // Fallback: if nothing classified as body, treat everything as body
  if (bodySubPaths.length === 0) return { bodySubPaths: subPaths, dotSubPaths: [] };
  return { bodySubPaths, dotSubPaths };
}

// ─── Transform factory ────────────────────────────────────────────────────────
// Returns tx/ty functions that map from font space → 300×300 canvas space,
// based on the OVERALL glyph bounding box (so body + dots stay in sync).

function makeTransform(overallBbox) {
  const { minX, minY, w, h } = overallBbox;
  const scale  = TARGET / Math.max(w, h);
  const scaledW = w * scale;
  const scaledH = h * scale;
  const maxY   = minY + h;
  const offX   = (CANVAS - scaledW) / 2 - minX * scale;
  const offY   = (CANVAS - scaledH) / 2;

  const tx = x => x * scale + offX;
  const ty = y => (maxY - y) * scale + offY; // flip Y
  return { tx, ty, scale };
}

// ─── Apply transform → SVG path string ───────────────────────────────────────

function toSvgPath(commands, tx, ty) {
  const parts = [];
  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M': parts.push(`M${tx(cmd.x).toFixed(2)} ${ty(cmd.y).toFixed(2)}`); break;
      case 'L': parts.push(`L${tx(cmd.x).toFixed(2)} ${ty(cmd.y).toFixed(2)}`); break;
      case 'C': parts.push(`C${tx(cmd.x1).toFixed(2)} ${ty(cmd.y1).toFixed(2)} ${tx(cmd.x2).toFixed(2)} ${ty(cmd.y2).toFixed(2)} ${tx(cmd.x).toFixed(2)} ${ty(cmd.y).toFixed(2)}`); break;
      case 'Q': parts.push(`Q${tx(cmd.x1).toFixed(2)} ${ty(cmd.y1).toFixed(2)} ${tx(cmd.x).toFixed(2)} ${ty(cmd.y).toFixed(2)}`); break;
      case 'Z': parts.push('Z'); break;
    }
  }
  return parts.join(' ');
}

// ─── Apply transform → numeric commands (for sampling) ───────────────────────

function toNumericCmds(commands, tx, ty) {
  return commands.map(cmd => {
    switch (cmd.type) {
      case 'M': return { type:'M', x:tx(cmd.x), y:ty(cmd.y) };
      case 'L': return { type:'L', x:tx(cmd.x), y:ty(cmd.y) };
      case 'C': return { type:'C', x1:tx(cmd.x1), y1:ty(cmd.y1), x2:tx(cmd.x2), y2:ty(cmd.y2), x:tx(cmd.x), y:ty(cmd.y) };
      case 'Q': return { type:'Q', x1:tx(cmd.x1), y1:ty(cmd.y1), x:tx(cmd.x), y:ty(cmd.y) };
      case 'Z': return { type:'Z' };
      default:  return cmd;
    }
  });
}

// ─── Sample evenly-spaced points along path ───────────────────────────────────

function samplePoints(commands, n) {
  const poly = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;

  function push(pts) { poly.push(...pts); }
  function cubicPts(x0,y0,x1,y1,x2,y2,x3,y3,steps=20) {
    const pts = [];
    for (let i=1;i<=steps;i++) { const t=i/steps,m=1-t; pts.push({x:m*m*m*x0+3*m*m*t*x1+3*m*t*t*x2+t*t*t*x3,y:m*m*m*y0+3*m*m*t*y1+3*m*t*t*y2+t*t*t*y3}); }
    return pts;
  }
  function quadPts(x0,y0,x1,y1,x2,y2,steps=12) {
    const pts = [];
    for (let i=1;i<=steps;i++) { const t=i/steps,m=1-t; pts.push({x:m*m*x0+2*m*t*x1+t*t*x2,y:m*m*y0+2*m*t*y1+t*t*y2}); }
    return pts;
  }

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M': poly.push({x:cmd.x,y:cmd.y}); cx=cmd.x; cy=cmd.y; sx=cx; sy=cy; break;
      case 'L': poly.push({x:cmd.x,y:cmd.y}); cx=cmd.x; cy=cmd.y; break;
      case 'C': push(cubicPts(cx,cy,cmd.x1,cmd.y1,cmd.x2,cmd.y2,cmd.x,cmd.y)); cx=cmd.x; cy=cmd.y; break;
      case 'Q': push(quadPts(cx,cy,cmd.x1,cmd.y1,cmd.x,cmd.y)); cx=cmd.x; cy=cmd.y; break;
      case 'Z': cx=sx; cy=sy; break;
    }
  }

  if (poly.length < 2) return poly;

  const lens = [0];
  for (let i=1;i<poly.length;i++) {
    const dx=poly[i].x-poly[i-1].x, dy=poly[i].y-poly[i-1].y;
    lens.push(lens[i-1]+Math.sqrt(dx*dx+dy*dy));
  }
  const total = lens[lens.length-1];
  if (total === 0) return [poly[0]];

  return Array.from({length:n},(_,i)=>{
    const target = (i/(n-1))*total;
    let lo=0, hi=lens.length-1;
    while (lo<hi-1) { const mid=(lo+hi)>>1; if (lens[mid]<=target) lo=mid; else hi=mid; }
    const t = lens[hi]===lens[lo] ? 0 : (target-lens[lo])/(lens[hi]-lens[lo]);
    return {
      x: +((poly[lo].x + t*(poly[hi].x-poly[lo].x)).toFixed(2)),
      y: +((poly[lo].y + t*(poly[hi].y-poly[lo].y)).toFixed(2)),
    };
  });
}

// ─── Interior grid points (for coverage) ─────────────────────────────────────
// Flatten one sub-path to a dense polygon (for ray-casting).

function subPathToRing(subPathNumericCmds, stepsPerCurve = 30) {
  const pts = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;
  for (const cmd of subPathNumericCmds) {
    switch (cmd.type) {
      case 'M':
        pts.push({ x: cmd.x, y: cmd.y });
        cx = cmd.x; cy = cmd.y; sx = cx; sy = cy;
        break;
      case 'L':
        pts.push({ x: cmd.x, y: cmd.y });
        cx = cmd.x; cy = cmd.y;
        break;
      case 'C':
        for (let i = 1; i <= stepsPerCurve; i++) {
          const t = i / stepsPerCurve, m = 1 - t;
          pts.push({
            x: m*m*m*cx + 3*m*m*t*cmd.x1 + 3*m*t*t*cmd.x2 + t*t*t*cmd.x,
            y: m*m*m*cy + 3*m*m*t*cmd.y1 + 3*m*t*t*cmd.y2 + t*t*t*cmd.y,
          });
        }
        cx = cmd.x; cy = cmd.y;
        break;
      case 'Q':
        for (let i = 1; i <= stepsPerCurve; i++) {
          const t = i / stepsPerCurve, m = 1 - t;
          pts.push({
            x: m*m*cx + 2*m*t*cmd.x1 + t*t*cmd.x,
            y: m*m*cy + 2*m*t*cmd.y1 + t*t*cmd.y,
          });
        }
        cx = cmd.x; cy = cmd.y;
        break;
      case 'Z':
        if (Math.abs(cx - sx) > 0.1 || Math.abs(cy - sy) > 0.1)
          pts.push({ x: sx, y: sy });
        cx = sx; cy = sy;
        break;
    }
  }
  return pts;
}

// Even-odd crossings from one ring for a horizontal rightward ray from (px, py)
function crossingsForRing(px, py, ring) {
  let n = 0;
  const len = ring.length;
  for (let i = 0; i < len; i++) {
    const p0 = ring[i];
    const p1 = ring[(i + 1) % len];
    if ((p0.y <= py && p1.y > py) || (p1.y <= py && p0.y > py)) {
      const t  = (py - p0.y) / (p1.y - p0.y);
      const xi = p0.x + t * (p1.x - p0.x);
      if (xi > px) n++;
    }
  }
  return n;
}

// Generate interior grid points using even-odd rule across all body rings.
// Points inside an even number of rings (e.g. inside outer + inside inner counter) are outside.
const GRID_STEP = 8; // spacing in PATH_SIZE canvas coords

function generateInteriorPoints(bodySubPaths, tx, ty) {
  // Build a ring per body sub-path (already in canvas space via tx/ty)
  const rings = bodySubPaths.map(sp => subPathToRing(toNumericCmds(sp, tx, ty)));

  // Bounding box of all rings
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const ring of rings) {
    for (const p of ring) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    }
  }

  const interior = [];
  for (let y = minY + GRID_STEP / 2; y < maxY; y += GRID_STEP) {
    for (let x = minX + GRID_STEP / 2; x < maxX; x += GRID_STEP) {
      let crossings = 0;
      for (const ring of rings) crossings += crossingsForRing(x, y, ring);
      if (crossings % 2 === 1) {
        interior.push({ x: +x.toFixed(1), y: +y.toFixed(1) });
      }
    }
  }
  return interior;
}

// ─── Dot target centers ───────────────────────────────────────────────────────

function dotTargets(dotSubPaths, tx, ty, scale) {
  return dotSubPaths.map(sp => {
    const bb = getBBox(sp);
    const cx = tx(bb.minX + bb.w / 2);
    const cy = ty(bb.minY + bb.h / 2);
    // dot radius in canvas space: use average of both dimensions (not max), capped to 20px
    const r  = Math.min(20, Math.max(7, ((bb.w + bb.h) / 2) * scale / 2));
    return { cx: +cx.toFixed(2), cy: +cy.toFixed(2), r: +r.toFixed(2) };
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const font = opentype.loadSync(FONT_PATH);
console.log(`Loaded: ${font.names.fullName?.en || 'font'}  (${font.numGlyphs} glyphs)\n`);

const results = [];

for (const letter of LETTERS) {
  const glyph = font.charToGlyph(letter.arabic);
  if (!glyph || !glyph.path || glyph.path.commands.length === 0) {
    console.warn(`⚠  No glyph for ${letter.arabic}`);
    results.push({ ...letter, svgPath:'', mainPath:'', dots:[], samplePoints:[] });
    continue;
  }

  const commands = glyph.path.commands;
  const overallBbox = getBBox(commands);
  if (overallBbox.w === 0 || overallBbox.h === 0) {
    console.warn(`⚠  Zero bbox for ${letter.arabic}`);
    results.push({ ...letter, svgPath:'', mainPath:'', dots:[], samplePoints:[] });
    continue;
  }

  const { tx, ty, scale } = makeTransform(overallBbox);

  // Split into body and dot sub-paths
  const subPaths = splitSubPaths(commands);
  const { bodySubPaths, dotSubPaths } = classifySubPaths(subPaths);

  // SVG path strings
  const svgPath  = toSvgPath(commands, tx, ty);                       // full glyph (template display)
  const mainPath = bodySubPaths.map(sp => toSvgPath(sp, tx, ty)).join(' '); // body only (clip region)

  // Dot targets
  const dots = dotTargets(dotSubPaths, tx, ty, scale);

  // Sample points along body outline (for Show Me animation)
  const bodyCommands = bodySubPaths.flat();
  const bodyNumeric  = toNumericCmds(bodyCommands, tx, ty);
  const pts          = samplePoints(bodyNumeric, SAMPLE_COUNT);

  // Interior grid points (for accurate coverage calculation)
  const interior = generateInteriorPoints(bodySubPaths, tx, ty);

  console.log(
    `✓  ${letter.arabic}  ${letter.transliteration.padEnd(8)}` +
    `  body_paths:${bodySubPaths.length}  dots:${dots.length}` +
    `  samples:${pts.length}  interior:${interior.length}`
  );

  results.push({ ...letter, svgPath, mainPath, dots, samplePoints: pts, interiorPoints: interior });
}

// ─── Write TypeScript output ──────────────────────────────────────────────────

const ts = `// AUTO-GENERATED by scripts/generate-letter-paths.js — do not edit manually
// Font: Noto Naskh Arabic Regular  |  Canvas: ${CANVAS}×${CANVAS}  |  Target size: ~${TARGET}px

export interface StrokePoint {
  x: number;
  y: number;
}

export interface DotTarget {
  cx: number;  // centre x in ${CANVAS}×${CANVAS} SVG space
  cy: number;  // centre y in ${CANVAS}×${CANVAS} SVG space
  r: number;   // radius  in ${CANVAS}×${CANVAS} SVG space
}

export interface ArabicLetter {
  id: string;
  arabic: string;
  transliteration: string;
  nameAr: string;
  category: 'basics' | 'dotted' | 'complex';
  /** Full glyph path (body + dots) — used for the grey template display */
  svgPath: string;
  /** Body-only path — used as the SVG clipPath region for the fill mechanic */
  mainPath: string;
  /** Dot targets; empty for undotted letters */
  dots: DotTarget[];
  /** ${SAMPLE_COUNT} evenly-spaced points along the body outline — for Show Me animation */
  samplePoints: StrokePoint[];
  /** Interior grid points (${GRID_STEP}px spacing) inside the letter body — for coverage calculation */
  interiorPoints: StrokePoint[];
}

export const ARABIC_LETTERS: ArabicLetter[] = [
${results.map(r => `  {
    id: ${JSON.stringify(r.id)},
    arabic: ${JSON.stringify(r.arabic)},
    transliteration: ${JSON.stringify(r.transliteration)},
    nameAr: ${JSON.stringify(r.nameAr)},
    category: ${JSON.stringify(r.category)},
    svgPath: ${JSON.stringify(r.svgPath)},
    mainPath: ${JSON.stringify(r.mainPath)},
    dots: ${JSON.stringify(r.dots)},
    samplePoints: ${JSON.stringify(r.samplePoints)},
    interiorPoints: ${JSON.stringify(r.interiorPoints)},
  }`).join(',\n')}
];

export const LETTER_CATEGORIES = [
  { key: 'basics',  label: 'Basic Letters',   count: ARABIC_LETTERS.filter(l => l.category === 'basics').length },
  { key: 'dotted',  label: 'Dotted Letters',  count: ARABIC_LETTERS.filter(l => l.category === 'dotted').length },
  { key: 'complex', label: 'Complex Letters', count: ARABIC_LETTERS.filter(l => l.category === 'complex').length },
];
`;

fs.writeFileSync(OUT_PATH, ts, 'utf8');
console.log(`\n✅  Written to ${OUT_PATH}`);
