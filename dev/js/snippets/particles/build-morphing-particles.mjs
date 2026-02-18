import { build, context } from 'esbuild';
import fs from 'fs';
import path from 'path';

const entry = path.resolve('./js/morphing-particles.js');
const workerEntry = path.resolve('./js/points-distance.worker.js');
const outdir = path.resolve('./dist');
await fs.promises.mkdir(outdir, { recursive: true });

const isWatch = process.argv.includes('--watch');
const isLight = process.argv.includes('--light');
const noSourcemap = process.argv.includes('--no-sourcemap');
const isProd = noSourcemap;
const noGui = process.argv.includes('--no-gui');
const guiShim = path.resolve('./js/shims/lil-gui-empty.js');

const lightExternal = [
    'three',
    'gsap',
    'lil-gui',
    'poisson-disk-sampling'
];

async function buildWorkerSource() {
    const workerResult = await build({
        entryPoints: [workerEntry],
        bundle: true,
        minify: true,
        format: 'esm',
        target: ['es2020'],
        platform: 'browser',
        write: false,
        logLevel: 'silent'
    });

    return workerResult.outputFiles[0].text;
}

async function createMainBuildOptions() {
    const workerSource = await buildWorkerSource();
    const outFileName = isLight ? 'morphing-particles.light.js' : 'morphing-particles.js';

    return {
        entryPoints: [entry],
        outfile: path.join(outdir, outFileName),
        bundle: true,
        
        minify: true,
        minifyWhitespace: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        drop: ['console', 'debugger'],
        legalComments: 'none',
        keepNames: false,

        sourcemap: !noSourcemap,
        format: 'esm',
        target: ['es2020'],
        platform: 'browser',
        define: { 'process.env.NODE_ENV': '"production"' },
        alias: noGui ? { 'lil-gui': guiShim } : {},
        external: isLight ? lightExternal : [],
        banner: {
            js: `globalThis.__POINTS_DISTANCE_WORKER_SOURCE__ = ${JSON.stringify(workerSource)};`
        },
        logLevel: 'info'
    };
}

if (isWatch) {
    const buildOnce = async () => {
        const opts = await createMainBuildOptions();
        await build(opts);
    };

    await buildOnce();

    const ctx = await context({
        entryPoints: [entry, workerEntry],
        bundle: false,
        write: false,
        logLevel: 'silent'
    });

    await ctx.watch();
    console.log('Watching source files. Restart build command after worker changes for refreshed inline payload.');
} else {
    const opts = await createMainBuildOptions();
    build(opts)
        .then(() => console.log(`Built dist/${isLight ? 'morphing-particles.light.js' : 'morphing-particles.js'}`))
        .catch(() => process.exit(1));
}