import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

const entry = path.resolve('./js/morphing-particles.js');
const outdir = path.resolve('./dist');
await fs.promises.mkdir(outdir, { recursive: true });

const isWatch = process.argv.includes('--watch');

const opts = {
    entryPoints: [entry],
    outfile: path.join(outdir, 'morphing-particles.js'),
    bundle: true,
    minify: true,
    sourcemap: true,
    format: 'esm',
    target: ['es2018'],
    platform: 'browser',
    define: { 'process.env.NODE_ENV': '"production"' },
    external: ['three', 'gsap'],
    logLevel: 'info',
};

if (isWatch) {
    build({
        ...opts,
        watch: {
            onRebuild(error) {
                if (error) console.error('rebuild failed', error);
                else console.log('rebuild succeeded');
            }
        }
    }).catch(() => process.exit(1));
} else {
    build(opts).then(() => console.log('Built dist/morphing-particles.js')).catch(() => process.exit(1));
}