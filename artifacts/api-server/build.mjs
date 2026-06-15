import * as esbuild from 'esbuild';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const external = Object.keys(pkg.dependencies).filter(dep => !dep.startsWith('@workspace/'));

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external,
});
