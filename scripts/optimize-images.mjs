#!/usr/bin/env node

/**
 * Controlled image optimizer.
 *
 * Protected assets are never converted:
 * - assets/images/animations/**
 * - app/store icons, adaptive icons, splash assets, logos and favicons
 * - transparent Yusuf character artwork
 *
 * Modes:
 * - --report-only: inspect sources and write reports without encoding
 * - --dry-run: encode into --output only
 * - --apply: encode into --output, validate, then atomically install a sibling
 *   .webp file. The source is deliberately retained for reference migration.
 */
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const PROJECT_ROOT = process.cwd();
const DEFAULT_OUTPUT = 'tmp/image-optimization';
const DEFAULT_QUALITY = 86;
const DEFAULT_MAX_WIDTH = 1290;
const DEFAULT_MIN_SIZE = 512 * 1024;
const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

const PROTECTED_DIRECTORIES = [
  'assets/images/animations',
];

const PROTECTED_FILES = new Set([
  'assets/images/adaptive-icon.png',
  'assets/images/android-icon-background.png',
  'assets/images/android-icon-foreground.png',
  'assets/images/android-icon-monochrome.png',
  'assets/images/favicon.png',
  'assets/images/icon.png',
  'assets/images/logo.png',
  'assets/images/splash-icon.png',
  'assets/images/yusuf-welcome.png',
]);

function usage() {
  console.log(`
Usage:
  node scripts/optimize-images.mjs --report-only --input assets/images
  node scripts/optimize-images.mjs --dry-run --input <file-or-dir> [--input ...]
  node scripts/optimize-images.mjs --apply --input <file-or-dir> [--input ...]

Options:
  --report-only       Inspect only; do not encode images
  --dry-run           Encode only into the temporary output directory
  --apply             Validate temporary output, then install sibling .webp files
  --input <path>      Input file or directory; may be repeated
  --output <path>     Temporary output directory (default: ${DEFAULT_OUTPUT})
  --quality <1-100>   WebP quality (default: ${DEFAULT_QUALITY})
  --max-width <px>    Maximum output width; never upscales (default: ${DEFAULT_MAX_WIDTH})
  --min-size <bytes>  Skip smaller sources (default: ${DEFAULT_MIN_SIZE})
  --allow-larger      Permit output that is not smaller than its source
  --help              Show this help
`);
}

function parseArgs(argv) {
  const options = {
    mode: null,
    inputs: [],
    output: DEFAULT_OUTPUT,
    quality: DEFAULT_QUALITY,
    maxWidth: DEFAULT_MAX_WIDTH,
    minSize: DEFAULT_MIN_SIZE,
    allowLarger: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--report-only' || arg === '--dry-run' || arg === '--apply') {
      if (options.mode) throw new Error('Choose exactly one mode.');
      options.mode = arg.slice(2);
    } else if (arg === '--input') {
      options.inputs.push(argv[++index]);
    } else if (arg === '--output') {
      options.output = argv[++index];
    } else if (arg === '--quality') {
      options.quality = Number(argv[++index]);
    } else if (arg === '--max-width') {
      options.maxWidth = Number(argv[++index]);
    } else if (arg === '--min-size') {
      options.minSize = Number(argv[++index]);
    } else if (arg === '--allow-larger') {
      options.allowLarger = true;
    } else if (arg === '--help') {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (!options.mode) throw new Error('Choose --report-only, --dry-run, or --apply.');
  if (!options.inputs.length || options.inputs.some(input => !input)) {
    throw new Error('Provide at least one valid --input path.');
  }
  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) {
    throw new Error('--quality must be an integer from 1 to 100.');
  }
  if (!Number.isInteger(options.maxWidth) || options.maxWidth < 1) {
    throw new Error('--max-width must be a positive integer.');
  }
  if (!Number.isInteger(options.minSize) || options.minSize < 0) {
    throw new Error('--min-size must be a non-negative integer.');
  }

  return options;
}

async function collectFiles(inputPath) {
  const absolute = path.resolve(PROJECT_ROOT, inputPath);
  const inputStat = await stat(absolute);
  if (inputStat.isFile()) return [absolute];

  const files = [];
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const child = path.join(absolute, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(child));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

function projectRelative(absolutePath) {
  return path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join('/');
}

function isProtected(relativePath) {
  return PROTECTED_FILES.has(relativePath)
    || PROTECTED_DIRECTORIES.some(directory => (
      relativePath === directory || relativePath.startsWith(`${directory}/`)
    ));
}

async function sha256(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

async function atomicWriteImage(pipeline, destination) {
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.tmp-${process.pid}`;
  try {
    await pipeline.toFile(temporary);
    await rename(temporary, destination);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

function csvValue(value) {
  const text = Array.isArray(value) ? value.join(';') : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

async function writeReports(outputRoot, options, records) {
  await mkdir(outputRoot, { recursive: true });
  const summary = {
    mode: options.mode,
    quality: options.quality,
    maxWidth: options.maxWidth,
    minSize: options.minSize,
    allowLarger: options.allowLarger,
    protectedDirectories: PROTECTED_DIRECTORIES,
    protectedFiles: [...PROTECTED_FILES].sort(),
    totals: {
      inspected: records.length,
      converted: records.filter(record => record.status === 'converted').length,
      applied: records.filter(record => record.status === 'applied').length,
      skipped: records.filter(record => record.status === 'skipped').length,
      failed: records.filter(record => record.status === 'failed').length,
      sourceBytes: records.reduce((sum, record) => sum + (record.sourceBytes || 0), 0),
      outputBytes: records.reduce((sum, record) => sum + (record.outputBytes || 0), 0),
    },
    records,
  };

  await writeFile(path.join(outputRoot, 'image-optimization-report.json'), `${JSON.stringify(summary, null, 2)}\n`);

  const columns = [
    'sourcePath', 'outputPath', 'appliedPath', 'status', 'reason',
    'sourceFormat', 'sourceWidth', 'sourceHeight', 'sourceHasAlpha',
    'sourceAnimated', 'sourceBytes', 'sourceHash', 'outputFormat',
    'outputWidth', 'outputHeight', 'outputBytes', 'outputHash',
    'savingsPercent',
  ];
  const csv = [
    columns.join(','),
    ...records.map(record => columns.map(column => csvValue(record[column])).join(',')),
  ].join('\n');
  await writeFile(path.join(outputRoot, 'image-optimization-report.csv'), `${csv}\n`);
}

async function inspectAndConvert(source, options, outputRoot) {
  const relative = projectRelative(source);
  const sourceStats = await stat(source);
  const extension = path.extname(relative).toLowerCase();
  const record = {
    sourcePath: relative,
    outputPath: null,
    appliedPath: null,
    status: 'skipped',
    reason: null,
    sourceFormat: extension.slice(1),
    sourceWidth: null,
    sourceHeight: null,
    sourceHasAlpha: null,
    sourceAnimated: null,
    sourceBytes: sourceStats.size,
    sourceHash: await sha256(source),
    outputFormat: null,
    outputWidth: null,
    outputHeight: null,
    outputBytes: null,
    outputHash: null,
    savingsPercent: null,
  };

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    record.reason = 'unsupported extension';
    return record;
  }
  if (isProtected(relative)) {
    record.reason = 'protected asset';
    return record;
  }

  const metadata = await sharp(source, { animated: true }).metadata();
  record.sourceFormat = metadata.format;
  record.sourceWidth = metadata.width;
  record.sourceHeight = metadata.height;
  record.sourceHasAlpha = Boolean(metadata.hasAlpha);
  record.sourceAnimated = (metadata.pages || 1) > 1;

  if (record.sourceAnimated) {
    record.reason = 'animated image';
    return record;
  }
  if (sourceStats.size < options.minSize) {
    record.reason = `below minimum size (${options.minSize} bytes)`;
    return record;
  }
  if (options.mode === 'report-only') {
    record.reason = 'report only';
    return record;
  }

  const outputRelative = relative.replace(/\.(png|jpe?g)$/i, '.webp');
  const outputPath = path.join(outputRoot, outputRelative);
  const targetWidth = Math.min(metadata.width, options.maxWidth);
  const pipeline = sharp(source, { animated: false })
    .rotate()
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({
      quality: options.quality,
      alphaQuality: options.quality,
      effort: 6,
      smartSubsample: true,
    });

  await atomicWriteImage(pipeline, outputPath);
  const outputStats = await stat(outputPath);
  const outputMetadata = await sharp(outputPath).metadata();

  record.outputPath = projectRelative(outputPath);
  record.outputFormat = outputMetadata.format;
  record.outputWidth = outputMetadata.width;
  record.outputHeight = outputMetadata.height;
  record.outputBytes = outputStats.size;
  record.outputHash = await sha256(outputPath);
  record.savingsPercent = Number(((1 - outputStats.size / sourceStats.size) * 100).toFixed(2));

  if (outputStats.size >= sourceStats.size && !options.allowLarger) {
    await rm(outputPath, { force: true });
    throw Object.assign(new Error(`Output is not smaller for ${relative}`), { record });
  }

  record.status = 'converted';
  record.reason = null;

  if (options.mode === 'apply') {
    const appliedPath = path.join(path.dirname(source), path.basename(outputRelative));
    const temporaryAppliedPath = `${appliedPath}.tmp-${process.pid}`;
    await writeFile(temporaryAppliedPath, await readFile(outputPath));
    await rename(temporaryAppliedPath, appliedPath);
    record.appliedPath = projectRelative(appliedPath);
    record.status = 'applied';
  }

  return record;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const outputRoot = path.resolve(PROJECT_ROOT, options.output);
  const allFiles = (await Promise.all(options.inputs.map(collectFiles))).flat();
  const files = [...new Set(allFiles)].sort();
  const records = [];
  let failed = false;

  for (const file of files) {
    try {
      records.push(await inspectAndConvert(file, options, outputRoot));
    } catch (error) {
      failed = true;
      const record = error.record || {
        sourcePath: projectRelative(file),
        status: 'failed',
      };
      record.status = 'failed';
      record.reason = error instanceof Error ? error.message : String(error);
      records.push(record);
      console.error(record.reason);
    }
  }

  await writeReports(outputRoot, options, records);
  const converted = records.filter(record => ['converted', 'applied'].includes(record.status)).length;
  const skipped = records.filter(record => record.status === 'skipped').length;
  console.log(`Inspected ${records.length}; converted ${converted}; skipped ${skipped}; failed ${failed ? 'yes' : 'no'}.`);
  console.log(`Reports: ${projectRelative(outputRoot)}/image-optimization-report.{json,csv}`);
  if (failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
