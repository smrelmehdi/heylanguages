/**
 * Unified audio-asset generator for HeyYusuf.
 *
 * Collects every static Arabic (and English letter-name) text used by the app,
 * reuses existing mp3s where possible, generates the rest via ElevenLabs, and
 * writes two manifests:
 *   - assets/audio/manifest.json   (tooling/debug)
 *   - constants/audio-manifest.ts  (runtime lookup used by utils/tts.ts)
 *
 * Run:
 *   ts-node --skip-project scripts/generate-all-audio.ts [--dry-run] [--match-only] [--force]
 */

/* eslint-disable @typescript-eslint/no-var-requires */

// ── Load .env manually (same pattern as sibling scripts) ───────────────────
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { resolve, join, basename, dirname, relative } from 'path';
import { createHash } from 'crypto';

try {
  const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
} catch {
  /* .env optional */
}

// ── Allow data files to import .mp3 / image assets via require() ───────────
// The data files (constants/words.ts, data/gulf-dialogues.ts, etc.) embed
// `audio: require('../assets/audio/.../x.mp3')` calls intended for Metro.
// Node/ts-node can't load those — intercept and return the path string so
// imports succeed.
const Module: any = require('module');
const realRequire = Module.prototype.require;
const ASSET_RE = /\.(mp3|wav|m4a|png|jpe?g|webp|gif|svg|ttf|otf)$/i;
Module.prototype.require = function (id: string) {
  if (typeof id === 'string' && ASSET_RE.test(id)) {
    // Return the resolved absolute path so callers can dedupe by path.
    try {
      return resolve(dirname(this.filename), id);
    } catch {
      return id;
    }
  }
  return realRequire.call(this, id);
};

// ── CLI flags ──────────────────────────────────────────────────────────────
const flags = new Set(process.argv.slice(2));
const DRY_RUN = flags.has('--dry-run');
const MATCH_ONLY = flags.has('--match-only');
const FORCE = flags.has('--force');

// ── Config ─────────────────────────────────────────────────────────────────
const VOICE_GULF = 'rUaPbzcZIu8df8iNL9WZ';      // Sultan
const VOICE_EGYPTIAN = 'VMy40598IGgDeaOE8phq';   // Fathy Hammad
const API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const ROOT = process.cwd();
const AUTO_DIR = resolve(ROOT, 'assets/audio/auto');
const MANIFEST_JSON = resolve(ROOT, 'assets/audio/manifest.json');
const MANIFEST_TS = resolve(ROOT, 'constants/audio-manifest.ts');

type Bucket = 'gulf' | 'egyptian' | 'en';
interface Target {
  text: string;        // original, tashkeel preserved
  bucket: Bucket;      // filesystem folder under auto/
  manifestKey: 'gulf' | 'egyptian'; // which runtime manifest bucket this entry lives in
  voiceId: string;     // for hashing + ElevenLabs
  source: string;      // "gulf-dialogues:CAFE[0]" — for logging
}

// Normalization must match utils/tts.ts cache-key rule: trim + lowercase,
// tashkeel PRESERVED.
function normalize(text: string): string {
  return text.trim().toLowerCase();
}

// Secondary fuzzy-match key used ONLY during the existing-file reuse step.
// Lets data-text "اَلسَّلَامُ عَلَيْكُم" match a sibling script's "السلام عليكم".
// U+064B..U+0652 covers fatha/damma/kasra/shadda/sukun/tanween/etc.,
// U+0670 is dagger alif, U+0640 is tatweel.
const TASHKEEL_RE = /[ً-ْٰـ]/g;
function stripTashkeel(s: string): string {
  return s.replace(TASHKEEL_RE, '');
}
function fuzzyKey(voiceId: string, text: string): string {
  return voiceId + '::' + stripTashkeel(normalize(text));
}

function hashFor(text: string, voiceId: string): string {
  return createHash('sha256')
    .update(voiceId + ':' + normalize(text))
    .digest('hex')
    .slice(0, 8);
}

// ── Target collection ──────────────────────────────────────────────────────
function collectTargets(): Target[] {
  const out: Target[] = [];
  const seen = new Set<string>();

  const add = (text: unknown, bucket: Bucket, source: string, manifestKey: 'gulf' | 'egyptian' = bucket === 'egyptian' ? 'egyptian' : 'gulf') => {
    if (typeof text !== 'string') return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const voiceId = manifestKey === 'egyptian' ? VOICE_EGYPTIAN : VOICE_GULF;
    // Dedupe by (manifestKey, normalized) so we generate each voice+text once.
    const dedupeKey = manifestKey + '::' + normalize(trimmed);
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    out.push({ text: trimmed, bucket, manifestKey, voiceId, source });
  };

  // ── constants/words.ts (Gulf) ────────────────────────────────────────────
  const words = require('../constants/words');
  for (const [name, arr] of Object.entries(words)) {
    if (!Array.isArray(arr)) continue;
    arr.forEach((w: any, i: number) => {
      if (w && typeof w.arabic === 'string') {
        add(w.arabic, 'gulf', `words:${name}[${i}]`);
      }
    });
  }

  // ── data/egyptian-words.ts ───────────────────────────────────────────────
  try {
    const egw = require('../data/egyptian-words');
    for (const [name, arr] of Object.entries(egw)) {
      if (!Array.isArray(arr)) continue;
      arr.forEach((w: any, i: number) => {
        if (w && typeof w.arabic === 'string') {
          add(w.arabic, 'egyptian', `egyptian-words:${name}[${i}]`);
        }
      });
    }
  } catch (e) {
    console.warn('Could not load egyptian-words:', (e as Error).message);
  }

  // ── data/gulf-dialogues.ts ───────────────────────────────────────────────
  const gd = require('../data/gulf-dialogues');
  for (const [name, arr] of Object.entries(gd)) {
    if (!Array.isArray(arr)) continue;
    arr.forEach((t: any, i: number) => {
      if (t && typeof t.arabic === 'string') {
        add(t.arabic, 'gulf', `gulf-dialogues:${name}[${i}]`);
      }
    });
  }

  // ── data/egyptian-dialogues.ts ───────────────────────────────────────────
  try {
    const ed = require('../data/egyptian-dialogues');
    for (const [name, arr] of Object.entries(ed)) {
      if (!Array.isArray(arr)) continue;
      arr.forEach((t: any, i: number) => {
        if (t && typeof t.arabic === 'string') {
          add(t.arabic, 'egyptian', `egyptian-dialogues:${name}[${i}]`);
        }
      });
    }
  } catch (e) {
    console.warn('Could not load egyptian-dialogues:', (e as Error).message);
  }

  // ── data/quiz-part1.ts & quiz-unit6.ts audioText fallbacks ───────────────
  for (const rel of ['../data/quiz-part1', '../data/quiz-unit6']) {
    try {
      const q = require(rel);
      for (const [name, arr] of Object.entries(q)) {
        if (!Array.isArray(arr)) continue;
        arr.forEach((item: any, i: number) => {
          if (item && typeof item.audioText === 'string') {
            add(item.audioText, 'gulf', `${rel}:${name}[${i}]`);
          }
        });
      }
    } catch {
      /* optional file */
    }
  }

  // ── Letter families (duplicated from app/writing.tsx) ────────────────────
  // These are passed to speakArabic() without a voiceId arg, so they use the
  // default Sultan voice. nameAudio is intentionally English ("alif", "ba").
  const LETTERS: { nameAudio: string; arabic: string }[] = [
    { nameAudio: 'alif',         arabic: 'أَهْلاً' },
    { nameAudio: 'ba',           arabic: 'بَيْت' },
    { nameAudio: 'ta',           arabic: 'تَمْر' },
    { nameAudio: 'tha',          arabic: 'ثَعْلَب' },
    { nameAudio: 'jeem',         arabic: 'جَمِيل' },
    { nameAudio: 'ha',           arabic: 'حَياة' },
    { nameAudio: 'kha',          arabic: 'خَيْر' },
    { nameAudio: 'dal',          arabic: 'دَرْهَم' },
    { nameAudio: 'thal',         arabic: 'ذَهَب' },
    { nameAudio: 'ra',           arabic: 'رَجُل' },
    { nameAudio: 'zay',          arabic: 'زَيْت' },
    { nameAudio: 'seen',         arabic: 'سَيَّارة' },
    { nameAudio: 'sheen',        arabic: 'شُكْراً' },
    { nameAudio: 'sad',          arabic: 'صَبَاح' },
    { nameAudio: 'dad',          arabic: 'ضَيْف' },
    { nameAudio: 'ta',           arabic: 'طَعَام' },
    { nameAudio: 'tha',          arabic: 'ظَرِيف' },
    { nameAudio: 'ayn',          arabic: 'عَيْن' },
    { nameAudio: 'ghayn',        arabic: 'غَالي' },
    { nameAudio: 'fa',           arabic: 'فُنْدُق' },
    { nameAudio: 'qaf',          arabic: 'قَهْوَة' },
    { nameAudio: 'kaf',          arabic: 'كَلِمَة' },
    { nameAudio: 'lam',          arabic: 'لَيْلَة' },
    { nameAudio: 'meem',         arabic: 'مَاء' },
    { nameAudio: 'noon',         arabic: 'نَعَم' },
    { nameAudio: 'ha',           arabic: 'هُنَا' },
    { nameAudio: 'waw',          arabic: 'وَقْت' },
    { nameAudio: 'ya',           arabic: 'يَوْم' },
    { nameAudio: 'ta marbuta',   arabic: 'مَدِينَة' },
    { nameAudio: 'hamza',        arabic: 'مَاء' },
    { nameAudio: 'alif maqsura', arabic: 'عَلى' },
  ];
  for (const L of LETTERS) {
    // English letter name — file lives under auto/en/ but manifest key is gulf
    // (Sultan voice). Same text is rendered identically regardless of current
    // UI dialect.
    add(L.nameAudio, 'en', 'letters:nameAudio', 'gulf');
    add(L.arabic,    'gulf', 'letters:word',    'gulf');
  }

  // ── Encouragements (from app/scenario.tsx) ───────────────────────────────
  const ENCOURAGEMENTS = ['ممتاز', 'أحسنت', 'رائع', 'بالضبط', 'جيد جداً'];
  for (const e of ENCOURAGEMENTS) {
    add(e, 'gulf',     'encouragements', 'gulf');
    add(e, 'egyptian', 'encouragements', 'egyptian');
  }

  return out;
}

// ── Existing-file index ────────────────────────────────────────────────────
// Parse every sibling generator script to recover their (voice, text) →
// file path mapping. A target whose (voice, normalized text) matches an
// existing file can skip ElevenLabs.
interface ExistingEntry { voiceId: string; text: string; path: string; }

function scanSiblingScripts(): ExistingEntry[] {
  const scriptsDir = resolve(ROOT, 'scripts');
  const files = readdirSync(scriptsDir).filter(
    f => f.endsWith('.ts') && f.startsWith('generate-') && f !== 'generate-all-audio.ts',
  );
  const out: ExistingEntry[] = [];
  for (const file of files) {
    const src = readFileSync(join(scriptsDir, file), 'utf-8');
    const voiceMatch = src.match(/VOICE_ID\s*=\s*['"]([^'"]+)['"]/);
    const dirMatch = src.match(/pathResolve\(['"]\.\/(assets\/audio\/[^'"]+)['"]\)/);
    if (!voiceMatch || !dirMatch) continue;
    const voiceId = voiceMatch[1];
    const outDir = resolve(ROOT, dirMatch[1]);
    // Extract PHRASES entries: { id: '…', text: '…' }
    const phraseRe = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*text:\s*['"]([^'"]+)['"]\s*\}/g;
    let m: RegExpExecArray | null;
    while ((m = phraseRe.exec(src)) !== null) {
      const id = m[1];
      const text = m[2];
      const filePath = join(outDir, `${id}.mp3`);
      if (existsSync(filePath)) {
        out.push({ voiceId, text, path: filePath });
      }
    }
  }
  return out;
}

// Scan data files for `arabic: '…'` entries that already have `audio: require(
// '../assets/audio/…' )` wired. This gives us (tashkeel-preserved text → path)
// pairs that beat the sibling-script fuzzy matches.
function scanWiredDataFiles(): ExistingEntry[] {
  const out: ExistingEntry[] = [];
  const files = [
    { rel: 'constants/words.ts',           voiceId: VOICE_GULF },
    { rel: 'data/gulf-dialogues.ts',       voiceId: VOICE_GULF },
    { rel: 'data/egyptian-dialogues.ts',   voiceId: VOICE_EGYPTIAN },
    { rel: 'data/egyptian-words.ts',       voiceId: VOICE_EGYPTIAN },
    { rel: 'data/quiz-part1.ts',           voiceId: VOICE_GULF },
    { rel: 'data/quiz-unit6.ts',           voiceId: VOICE_GULF },
  ];
  for (const { rel, voiceId } of files) {
    const abs = resolve(ROOT, rel);
    if (!existsSync(abs)) continue;
    const src = readFileSync(abs, 'utf-8');
    // arabic text + require on same object line (loose match, works on flat
    // objects). Arabic text captured between single quotes.
    const re = /arabic:\s*'([^']+)'[\s\S]*?audio(?:File)?:\s*require\(\s*['"]\.\.\/([^'"]+)['"]\s*\)/g;
    // Audio-text fallback for quiz files: audioText: '…' audioFile: require('…')
    const re2 = /audioText:\s*'([^']+)'[\s\S]*?audioFile:\s*require\(\s*['"]\.\.\/([^'"]+)['"]\s*\)/g;
    for (const re_i of [re, re2]) {
      let m: RegExpExecArray | null;
      while ((m = re_i.exec(src)) !== null) {
        const text = m[1];
        const filePath = resolve(ROOT, m[2]);
        if (existsSync(filePath)) {
          out.push({ voiceId, text, path: filePath });
        }
      }
    }
  }
  return out;
}

// ── Manifest writers ───────────────────────────────────────────────────────
interface ManifestEntry { bucket: Bucket; manifestKey: 'gulf' | 'egyptian'; hash: string; path: string; text: string; source: string; }

function writeManifests(entriesByTarget: Map<Target, ManifestEntry>) {
  if (!existsSync(dirname(MANIFEST_TS))) mkdirSync(dirname(MANIFEST_TS), { recursive: true });

  // JSON manifest (keyed "<dialect>:<normalized>")
  const jsonOut: Record<string, any> = {};
  for (const [target, e] of entriesByTarget) {
    jsonOut[`${e.manifestKey}:${normalize(target.text)}`] = {
      hash: e.hash,
      dialect: e.manifestKey,
      bucket: e.bucket,
      path: relative(ROOT, join(ROOT, e.path)),
      text: target.text,
      source: e.source,
    };
  }
  writeFileSync(MANIFEST_JSON, JSON.stringify(jsonOut, null, 2), 'utf-8');
  console.log(`✓ wrote ${relative(ROOT, MANIFEST_JSON)} (${Object.keys(jsonOut).length} entries)`);

  // TS manifest — keyed by manifestKey dialect
  const perDialect: Record<'gulf' | 'egyptian', Array<{ norm: string; rel: string }>> = { gulf: [], egyptian: [] };
  const seen = new Set<string>();
  for (const [target, e] of entriesByTarget) {
    const norm = normalize(target.text);
    const combo = e.manifestKey + '::' + norm;
    if (seen.has(combo)) continue;
    seen.add(combo);
    perDialect[e.manifestKey].push({ norm, rel: e.path });
  }

  const lines: string[] = [];
  lines.push('// AUTO-GENERATED by scripts/generate-all-audio.ts — do not edit');
  lines.push('// Regenerate: npm run generate-audio');
  lines.push('');
  lines.push("export type AudioDialect = 'gulf' | 'egyptian';");
  lines.push('');
  lines.push('export const AUDIO_MANIFEST: Record<AudioDialect, Record<string, any>> = {');
  for (const d of ['gulf', 'egyptian'] as const) {
    lines.push(`  ${d}: {`);
    for (const { norm, rel } of perDialect[d]) {
      // relative path from constants/audio-manifest.ts to the mp3
      const reqPath = './' + relative(dirname(MANIFEST_TS), rel);
      lines.push(`    ${JSON.stringify(norm)}: require(${JSON.stringify(reqPath)}),`);
    }
    lines.push('  },');
  }
  lines.push('};');
  lines.push('');
  lines.push('// Keep in sync with utils/tts.ts cache-key rule: trim + lowercase, tashkeel preserved.');
  lines.push('export function normalizeAudioKey(text: string): string {');
  lines.push('  return text.trim().toLowerCase();');
  lines.push('}');
  lines.push('');
  lines.push("export function getAudioAsset(text: string, dialect: AudioDialect = 'gulf'): any {");
  lines.push('  const key = normalizeAudioKey(text);');
  lines.push('  return AUDIO_MANIFEST[dialect]?.[key] ?? null;');
  lines.push('}');
  lines.push('');

  writeFileSync(MANIFEST_TS, lines.join('\n'), 'utf-8');
  console.log(`✓ wrote ${relative(ROOT, MANIFEST_TS)} (${perDialect.gulf.length + perDialect.egyptian.length} entries)`);
}

// ── ElevenLabs generator ───────────────────────────────────────────────────
async function synth(target: Target, destPath: string): Promise<boolean> {
  const attempt = async (): Promise<boolean> => {
    try {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${target.voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: target.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.35, similarity_boost: 0.85, style: 0.25, use_speaker_boost: true },
        }),
      });
      if (!r.ok) {
        console.error(`   ✗ HTTP ${r.status}: ${await r.text().catch(() => '?')}`);
        return false;
      }
      const buf = await r.arrayBuffer();
      if (!existsSync(dirname(destPath))) mkdirSync(dirname(destPath), { recursive: true });
      writeFileSync(destPath, Buffer.from(buf));
      return true;
    } catch (err) {
      console.error(`   ✗ network: ${(err as Error).message}`);
      return false;
    }
  };
  let ok = await attempt();
  if (!ok) {
    await new Promise(r => setTimeout(r, 1500));
    console.log('   ↻ retrying…');
    ok = await attempt();
  }
  return ok;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎙  generate-all-audio');
  console.log('flags:', [
    DRY_RUN && 'DRY-RUN',
    MATCH_ONLY && 'MATCH-ONLY',
    FORCE && 'FORCE',
  ].filter(Boolean).join(' ') || '(none)');

  const targets = collectTargets();
  console.log(`→ collected ${targets.length} unique (voice × text) targets`);

  const fromSiblings = scanSiblingScripts();
  const fromWired = scanWiredDataFiles();
  console.log(`→ indexed ${fromSiblings.length} from sibling scripts, ${fromWired.length} from wired data fields`);

  // Primary index: exact match on (voice × normalized text, tashkeel preserved)
  const exactIdx = new Map<string, string>();
  // Secondary index: fuzzy match on (voice × tashkeel-stripped text)
  const fuzzyIdx = new Map<string, string>();
  for (const e of [...fromWired, ...fromSiblings]) {
    const k1 = e.voiceId + '::' + normalize(e.text);
    const k2 = fuzzyKey(e.voiceId, e.text);
    if (!exactIdx.has(k1)) exactIdx.set(k1, e.path);
    if (!fuzzyIdx.has(k2)) fuzzyIdx.set(k2, e.path);
  }

  const matched: { target: Target; src: string; dest: string; hash: string; kind: 'exact' | 'fuzzy' }[] = [];
  const toGen:   { target: Target;             dest: string; hash: string }[] = [];
  const already: { target: Target;             dest: string; hash: string }[] = [];

  for (const t of targets) {
    const hash = hashFor(t.text, t.voiceId);
    const dest = join(AUTO_DIR, t.bucket, `${hash}.mp3`);
    if (!FORCE && existsSync(dest)) {
      already.push({ target: t, dest, hash });
      continue;
    }
    const exact = exactIdx.get(t.voiceId + '::' + normalize(t.text));
    if (exact) {
      matched.push({ target: t, src: exact, dest, hash, kind: 'exact' });
      continue;
    }
    const fuzzy = fuzzyIdx.get(fuzzyKey(t.voiceId, t.text));
    if (fuzzy) {
      matched.push({ target: t, src: fuzzy, dest, hash, kind: 'fuzzy' });
      continue;
    }
    toGen.push({ target: t, dest, hash });
  }

  const exactMatches = matched.filter(m => m.kind === 'exact').length;
  const fuzzyMatches = matched.filter(m => m.kind === 'fuzzy').length;

  console.log('\n── Plan ──────────────────────────────');
  console.log(`✓ already in auto/:     ${already.length}`);
  console.log(`↪ free (copy existing): ${matched.length}  (exact: ${exactMatches}, fuzzy: ${fuzzyMatches})`);
  console.log(`⏳ need ElevenLabs:      ${toGen.length}`);

  // Credit estimate (character count)
  const chars = toGen.reduce((s, x) => s + x.target.text.length, 0);
  console.log(`\nElevenLabs cost: ~${chars.toLocaleString()} characters`);

  // Source breakdown for items needing generation
  if (toGen.length) {
    const breakdown = new Map<string, number>();
    for (const x of toGen) {
      const label = x.target.source.split(/[:\[]/)[0];
      breakdown.set(label, (breakdown.get(label) ?? 0) + 1);
    }
    console.log('\nto-generate by source:');
    [...breakdown.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
      console.log(`  ${k.padEnd(40)} ${v}`);
    });
  }

  // Sample of what'd be generated
  if (toGen.length && (DRY_RUN || flags.has('--verbose'))) {
    console.log('\nsample (first 15):');
    for (const x of toGen.slice(0, 15)) {
      console.log(`  [${x.target.manifestKey}] ${x.target.text.slice(0, 50).padEnd(50)} ← ${x.target.source}`);
    }
  }

  if (DRY_RUN) {
    console.log('\n(dry-run — no files written, no ElevenLabs calls)');
    return;
  }

  // ── Copy matched files ───────────────────────────────────────────────────
  for (const { target, src, dest } of matched) {
    if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    console.log(`↪ [copy] ${target.bucket}/${basename(dest)}  ← ${relative(ROOT, src)}`);
  }

  // ── Generate missing via ElevenLabs ──────────────────────────────────────
  const failed: Target[] = [];
  if (!MATCH_ONLY) {
    if (!API_KEY) {
      console.error('\n✗ Missing EXPO_PUBLIC_ELEVENLABS_API_KEY in .env');
      process.exit(1);
    }
    for (let i = 0; i < toGen.length; i++) {
      const { target, dest } = toGen[i];
      console.log(`⏳ [${i + 1}/${toGen.length}] ${target.manifestKey} "${target.text.slice(0, 50)}"`);
      const ok = await synth(target, dest);
      if (!ok) failed.push(target);
      if (i < toGen.length - 1) await new Promise(r => setTimeout(r, 500));
    }
  } else if (toGen.length) {
    console.log(`\n(--match-only: skipped ${toGen.length} ElevenLabs generations)`);
  }

  // ── Build manifest from whatever is on disk now ──────────────────────────
  const entries = new Map<Target, ManifestEntry>();
  for (const list of [already, matched, toGen]) {
    for (const { target, dest, hash } of list) {
      if (!existsSync(dest)) continue; // skipped / failed
      entries.set(target, {
        bucket: target.bucket,
        manifestKey: target.manifestKey,
        hash,
        path: dest,
        text: target.text,
        source: target.source,
      });
    }
  }
  writeManifests(entries);

  if (failed.length) {
    console.log(`\n⚠ ${failed.length} failed (not in manifest):`);
    for (const f of failed.slice(0, 20)) {
      console.log(`  [${f.manifestKey}] ${f.text.slice(0, 60)}  (${f.source})`);
    }
    if (failed.length > 20) console.log(`  … and ${failed.length - 20} more`);
  }

  console.log('\n🎉 done');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
