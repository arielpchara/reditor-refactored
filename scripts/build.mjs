import * as esbuild from 'esbuild';
import { chmodSync, rmSync } from 'fs';

const args = process.argv.slice(2);
const watch = args.includes('--watch');
const noClean = args.includes('--no-clean');

if (!noClean) {
  rmSync('dist', { recursive: true, force: true });
  console.log('🗑️  Cleaned dist/');
}

const shared = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  target: 'node18',
};

if (watch) {
  const binCtx = await esbuild.context({
    ...shared,
    entryPoints: ['src/bin.ts'],
    outfile: 'dist/bin.js',
    banner: { js: '#!/usr/bin/env node' },
  });
  const libCtx = await esbuild.context({
    ...shared,
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
  });
  await Promise.all([binCtx.watch(), libCtx.watch()]);
  console.log('👀  Watching for changes...');
} else {
  await Promise.all([
    esbuild.build({
      ...shared,
      entryPoints: ['src/bin.ts'],
      outfile: 'dist/bin.js',
      banner: { js: '#!/usr/bin/env node' },
    }),
    esbuild.build({
      ...shared,
      entryPoints: ['src/index.ts'],
      outfile: 'dist/index.js',
    }),
  ]);
  chmodSync('dist/bin.js', 0o755);
  console.log('✅  Build complete: dist/bin.js  dist/index.js');
}
