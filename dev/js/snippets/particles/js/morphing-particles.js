// import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import * as THREE from 'three';
// import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/+esm';
import { gsap } from 'gsap';
// import PoissonDiskSampling from 'https://cdn.jsdelivr.net/npm/poisson-disk-sampling@2.3.1/+esm'
import PoissonDiskSampling from 'poisson-disk-sampling';
// import { PoissonDiskSampling } from './poisson-disk-sampling.js';
import { PerlinNoise1D } from './perlin-noise.js';
import { GLSL_NOISE } from './simplex-noise.js';
import { MouseTracker } from './mouse-tracker.js';
// import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18.0/+esm';
import GUI from 'lil-gui';

const {
    Vector2,
    Color,
    Scene,
    WebGLRenderer,
    Clock,
    Raycaster,
    Vector3,
    BufferGeometry,
    BufferAttribute,
    ShaderMaterial,
    Mesh,
    PlaneGeometry,
    Points,
    DataTexture,
    WebGLRenderTarget,
    RepeatWrapping,
    NearestFilter,
    RGBAFormat,
    sRGBEncoding,
    FloatType,
    PerspectiveCamera,
    OrthographicCamera,
    ColorManagement,
    DoubleSide,
    MeshBasicMaterial,
    NoToneMapping
} = THREE;
const Animator = gsap;
const mt = new MouseTracker();

function createPointsDistanceWorker() {
    const inlineWorkerSource = globalThis.__POINTS_DISTANCE_WORKER_SOURCE__;
    if (typeof inlineWorkerSource === 'string' && inlineWorkerSource.length > 0) {
        const workerBlob = new Blob([inlineWorkerSource], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(workerBlob);
        return new Worker(workerUrl, { type: 'module' });
    }

    return new Worker(new URL('./points-distance.worker.js', import.meta.url), { type: 'module' });
}

/**
 * Linear mapping utility function
 * Maps a value from one range to another.
 */
const mapRange = (value, inMin, inMax, outMin, outMax) => (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

/**
 * Particle System Class
 * Manages particle creation, updating, and rendering.
 */
class MorphingParticleSystem {
    constructor(scene, textures) {
        this.scene = scene;
        this.renderer = scene.renderer;
        this.gl = scene.gl; 
        this.camera = scene.camera;
        this.textures = textures;
        this.lastTime = 0;
        this.everRendered = false;
        this.mousePos = new Vector2(0, 0);
        this.cursorPos = new Vector2(0, 0);
        this.colorScheme = scene.theme === "dark" ? 0 : 1;
        this.particleScale = this.getParticleScale();
        this.shapeReady = false;
        this.setDomainFromCanvas();
    }
    getParticleScale() {
        if (this.scene.particlesScaleMode === 'absolute') {
            return this.scene.particlesScale;
        }
        return this.scene.renderer.domElement.width / this.scene.pixelRatio / 2000 * this.scene.particlesScale;
    }
    setDomainFromCanvas() {
        const canvas = this.scene.renderer.domElement;
        const aspect = Math.max(1e-6, canvas.width / canvas.height);
        if (aspect >= 1) {
            this.domainWidth = Math.round(500 * aspect);
            this.domainHeight = 500;
        } else {
            this.domainWidth = 500;
            this.domainHeight = Math.round(500 / aspect);
        }
        this.domainCenterX = this.domainWidth * 0.5;
        this.domainCenterY = this.domainHeight * 0.5;
        this.domainScale = Math.min(this.domainCenterX, this.domainCenterY);
    }
    static async create(scene, textures) {
        let instance = new MorphingParticleSystem(scene, textures);
        instance.createPoints();
        instance.nearestPointsData = [instance.pointsData.slice()];
        instance.init();

        instance.createPointsFromImage()
            .then(() => {
                if (instance.nearestPointsData && instance.nearestPointsData.length > 0) {
                    instance.setPointsTextureFromIndex(0);
                    instance.shapeReady = true;
                    if (instance.scene && instance.scene.hoverRequested) {
                        instance.scene.onHoverStart();
                    }
                }
            })
            .catch((err) => {
                console.error('[morphing-particles] Failed to load morph targets, fallback to base points.', err);
                instance.nearestPointsData = [instance.pointsData.slice()];
                instance.shapeReady = true;
                if (instance.scene && instance.scene.hoverRequested) {
                    instance.scene.onHoverStart();
                }
            });

        return instance;
    }
    async getImageData(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.src = src;
            img.onload = () => {
                let canvas = document.createElement("canvas");
                canvas.width = this.domainWidth;
                canvas.height = this.domainHeight;
                let ctx = canvas.getContext("2d");
                const imageRatio = img.width / img.height;
                const canvasRatio = canvas.width / canvas.height;
                let drawWidth;
                let drawHeight;
                let drawX;
                let drawY;

                if (imageRatio > canvasRatio) {
                    drawWidth = canvas.width;
                    drawHeight = drawWidth / imageRatio;
                    drawX = 0;
                    drawY = (canvas.height - drawHeight) * 0.5;
                } else {
                    drawHeight = canvas.height;
                    drawWidth = drawHeight * imageRatio;
                    drawX = (canvas.width - drawWidth) * 0.5;
                    drawY = 0;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resolve(imageData);
            };
            img.onerror = reject;
        });
    }
    createPoints() {
        const minDistance = mapRange(this.scene.density, 0, 300, 10, 2);
        const maxDistance = mapRange(this.scene.density, 0, 300, 10, 50);
        let poisson = new PoissonDiskSampling({
            shape: [this.domainWidth, this.domainHeight],
            minDistance: minDistance,
            maxDistance: maxDistance,
            tries: 20
        }).fill();
        this.pointsBaseData = poisson.map(point => [point[0] - this.domainCenterX, point[1] - this.domainCenterY]);
        this.pointsData = [];
        for (let i = 0; i < poisson.length; i++) {
            this.pointsData.push(poisson[i][0] - this.domainCenterX, poisson[i][1] - this.domainCenterY);
        }
        this.count = this.pointsData.length / 2;
    }
    async createPointsFromImage() {
        let images = [];
        if (!this.textures || this.textures.length === 0) {
            this.nearestPointsData = [this.pointsData.slice()];
            return;
        }
        for (let i = 0; i < this.textures.length; i++) {
            let imgData = await this.getImageData(this.textures[i]);
            images.push(imgData);
        }
        this.nearestPointsData = [];
        let promises = [];
        for (let i = 0; i < this.textures.length; i++) {
            promises.push(this.createPointsDistanceDataWorker(images[i], this.pointsBaseData, i));
        }
        let results = await Promise.all(promises);
        results.sort((a, b) => a.index - b.index);
        results.forEach(result => {
            this.nearestPointsData.push(result.nearestPoints);
        });
        // Return the assembled results so caller can continue initialization
        return results;
    }

    /**
     * Creates a Web Worker to compute nearest points based on image data
     * This is used to offload the computationally expensive task of finding
     * nearest points for each particle based on the image's pixel data,
     * allowing the main thread to remain responsive.
     * 
     * @param {ImageData} imageData - The pixel data of the image to sample from
     * @param {Array} pointsBase - The base points to find nearest neighbors for
     * @param {number} index - The index of the current image/points set (for tracking results)
     * @returns {Promise} - A promise that resolves with the nearest points data
     */
    createPointsDistanceDataWorker(imageData, pointsBase, index) {
        return new Promise((resolve, reject) => {
            try {
                const worker = createPointsDistanceWorker();
                worker.onmessage = (evt) => {
                    resolve(evt.data);
                    worker.terminate();
                };
                worker.onerror = (err) => {
                    reject(err);
                    worker.terminate();
                };
                worker.postMessage({
                    imageData,
                    pointsBase,
                    index,
                    density: this.scene.density,
                    domainWidth: this.domainWidth,
                    domainHeight: this.domainHeight
                });
            } catch (err) {
                reject(err);
            }
        });
    }
    createDataTexturePosition(e) {
        let t = new Float32Array(this.length * 4);
        for (let r = 0; r < this.count; r++) {
            let o = r * 4;
            t[o + 0] = e[r * 2 + 0] * (1 / this.domainScale),
            t[o + 1] = e[r * 2 + 1] * (1 / this.domainScale),
            t[o + 2] = 0,
            t[o + 3] = 0
        }
        let i = new DataTexture(t, this.size, this.size, RGBAFormat, FloatType);
        return i.needsUpdate = !0,
        i
    }
    createRenderTarget() {
        return new WebGLRenderTarget(this.size,this.size,{
            wrapS: RepeatWrapping,
            wrapT: RepeatWrapping,
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            texture: this.posTex,
            format: RGBAFormat,
            type: FloatType,
            depthBuffer: false,
            stencilBuffer: false
        })
    }
    setPointsTextureFromIndex(e) {
        this.posNearestTex = this.createDataTexturePosition(this.nearestPointsData[e]),
        this.posNearestTex.needsUpdate = !0,
        this.simMaterial.uniforms.uPosNearest.value = this.posNearestTex
    }
    init() {
        this.size = 256,
        this.length = this.size * this.size,
        this.posTex = this.createDataTexturePosition(this.pointsData),
        this.posNearestTex = this.createDataTexturePosition(this.nearestPointsData[0]),
        this.rt1 = this.createRenderTarget(),
        this.rt2 = this.createRenderTarget(),
        this.renderer.setRenderTarget(this.rt1),
        this.renderer.setClearColor(0, 0),
        this.renderer.clear(),
        this.renderer.setRenderTarget(this.rt2),
        this.renderer.setClearColor(0, 0),
        this.renderer.clear(),
        this.renderer.setRenderTarget(null),
        this.noise = new PerlinNoise1D(),
        this.simScene = new Scene,
        this.simCamera = new OrthographicCamera(-1,1,1,-1,0,1),
        this.simMaterial = new ShaderMaterial({
            uniforms: {
                uPosition: {
                    value: this.posTex
                },
                uPosRefs: {
                    value: this.posTex
                },
                uPosNearest: {
                    value: this.posNearestTex
                },
                uMousePos: {
                    value: new Vector2(0,0)
                },
                uRingRadius: {
                    value: .2
                },
                uDeltaTime: {
                    value: 0
                },
                uRingWidth: {
                    value: .05
                },
                uRingWidth2: {
                    value: .015
                },
                uIsHovering: {
                    value: 1
                },
                uRingDisplacement: {
                    value: this.scene.ringDisplacement
                },
                uTime: {
                    value: 0
                }
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform sampler2D uPosition;
                uniform sampler2D uPosRefs;
                uniform sampler2D uPosNearest;

                uniform vec2 uMousePos;
                uniform float uTime;
                uniform float uDeltaTime;
                uniform float uIsHovering;

                vec2 hash( vec2 p ){
                    p = vec2( dot(p,vec2(2127.1,81.17)), dot(p,vec2(1269.5,283.37)) );
                    return fract(sin(p)*43758.5453);
                }

                void main() {

                    vec2 simTexCoords = gl_FragCoord.xy / vec2(${this.size.toFixed(1)}, ${this.size.toFixed(1)});
                    vec4 pFrame = texture2D(uPosition, simTexCoords);

                    float scale = pFrame.z;
                    float velocity = pFrame.w;
                    vec2 refPos = texture2D(uPosRefs, simTexCoords).xy;
                    vec2 nearestPos = texture2D(uPosNearest, simTexCoords).xy;
                    float seed = hash(simTexCoords).x;
                    float seed2 = hash(simTexCoords).y;

                    float time = uTime * .5;
                    float lifeEnd = 3. + sin(seed2 * 100.) * 1.;
                    float lifeTime = mod((seed * 100.) + time, lifeEnd);

                    vec2 disp = vec2(0., 0.);
                    vec2 pos = pFrame.xy;

                    float distRadius = 0.15;

                    vec2 targetPos = refPos;
                    targetPos = mix(targetPos, nearestPos, uIsHovering * uIsHovering);

                    vec2 direction = normalize(targetPos - pos);
                    direction *= .01;

                    float dist = length(targetPos - pos);
                    float distStrength = smoothstep(distRadius, 0., dist);

                    if(dist > 0.005){
                        pos += direction * distStrength;
                    }

                    if(lifeTime < .01){
                        pos = refPos;
                        pFrame.xy = refPos;
                        scale = 0.;
                    }

                    // Add scale
                    float targetScale = smoothstep(.01, 0.5, lifeTime) - smoothstep(0.5, 1., lifeTime/lifeEnd);
                    targetScale += smoothstep(0.1, 0., smoothstep(0.001, .1, dist)) * 1.5 * uIsHovering;
                    // targetScale *= distStrength;

                    float scaleDiff = targetScale - scale;
                    scaleDiff *= .1;
                    scale += scaleDiff;

                    // Final position
                    vec2 finalPos = pos + (disp * smoothstep(0.001, distRadius, dist));
                    vec2 diff = finalPos - pFrame.xy;
                    diff *= .2;

                    velocity = smoothstep(distRadius, .001, dist) * uIsHovering;

                    vec4 frame = vec4(pFrame.xy + diff, scale, velocity);

                    gl_FragColor = frame;

                }
            `
        });
        let e = new Mesh(new PlaneGeometry(2,2),this.simMaterial);
        this.simScene.add(e);
        let t = new BufferGeometry
          , i = new Float32Array(this.count * 2)
          , r = new Float32Array(this.count * 3)
          , o = new Float32Array(this.count * 4);
        for (let s = 0; s < this.count; s++) {
            let a = s % this.size
              , l = Math.floor(s / this.size);
            i[s * 2] = a / this.size,
            i[s * 2 + 1] = l / this.size
        }
        for (let s = 0; s < this.count; s++)
            o[s * 4] = Math.random(),
            o[s * 4 + 1] = Math.random(),
            o[s * 4 + 2] = Math.random(),
            o[s * 4 + 3] = Math.random();
        t.setAttribute("position", new BufferAttribute(r,3)),
        t.setAttribute("uv", new BufferAttribute(i,2)),
        t.setAttribute("seeds", new BufferAttribute(o,4)),
        this.renderMaterial = new ShaderMaterial({
            uniforms: {
                uPosition: {
                    value: this.posTex
                },
                uTime: {
                    value: 0
                },
                uColor1: {
                    value: new Color(this.scene.colorControls.color1)
                },
                uColor2: {
                    value: new Color(this.scene.colorControls.color2)
                },
                uColor3: {
                    value: new Color(this.scene.colorControls.color3)
                },
                uAlpha: {
                    value: 1
                },
                uIsHovering: {
                    value: 0
                },
                uPulseProgress: {
                    value: 0
                },
                uMousePos: {
                    value: new Vector2(0,0)
                },
                uRez: {
                    value: new Vector2(this.scene.renderer.domElement.width,this.scene.renderer.domElement.height)
                },
                uParticleScale: {
                    value: this.particleScale
                },
                uParticleShape: {
                    value: 0
                },
                uPixelRatio: {
                    value: this.scene.pixelRatio
                },
                uColorScheme: {
                    value: this.colorScheme
                }
            },
            vertexShader: `
                precision highp float;
                attribute vec4 seeds;

                uniform sampler2D uPosition;
                uniform float uTime;
                uniform float uParticleScale;
                uniform float uPixelRatio;
                uniform int uColorScheme;
                uniform float uIsHovering;
                uniform float uPulseProgress;

                varying vec4 vSeeds;
                varying float vVelocity;
                varying vec2 vLocalPos;
                varying vec2 vScreenPos;
                varying float vScale;

                ${GLSL_NOISE}

                void main() {

                    vec4 pos = texture2D(uPosition, uv);
                    vSeeds = seeds;

                    float noiseX = snoise(vec3( vec2(pos.xy * 10.), uTime * .2 + 100.));
                    float noiseY = snoise(vec3( vec2(pos.xy * 10.), uTime * .2));

                    float noiseX2 = snoise(vec3( vec2(pos.xy * .5), uTime * .15 + 45.));
                    float noiseY2 = snoise(vec3( vec2(pos.xy * .5), uTime * .15 + 87.));

                    // make a smooth disc
                    float cDist = length(pos.xy) * 1.;
                    float progress = uPulseProgress;
                    float t = smoothstep(progress - .25, progress, cDist) - smoothstep(progress, progress + .25, cDist);
                    t *= smoothstep(1., .0, cDist);
                    pos.xy *= 1. + (t * .02);

                    float dist = smoothstep(0., 0.9, pos.w);
                    dist = mix(0., dist, uIsHovering);

                    pos.y += noiseY * 0.005 * dist;
                    pos.x += noiseX * 0.005 * dist;
                    pos.y += noiseY2 * 0.02;
                    pos.x += noiseX2 * 0.02;

                    vVelocity = pos.w;
                    vScale = pos.z;
                    vLocalPos = pos.xy;
                    vec4 viewSpace  = modelViewMatrix * vec4(vec3(pos.xy, 0.), 1.0);

                    gl_Position = projectionMatrix * viewSpace;
                    vScreenPos = gl_Position.xy;

                    float minScale = .25;
                    minScale += float(uColorScheme) * .75;

                    gl_PointSize = ((vScale * 7.) * (uPixelRatio * 0.5) * uParticleScale) + (minScale * uPixelRatio);

                }
            `,
            fragmentShader: `
                precision highp float;

                varying vec4 vSeeds;
                varying vec2 vScreenPos;
                varying vec2 vLocalPos;
                varying float vScale;
                varying float vVelocity;

                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;

                uniform vec2 uMousePos;
                uniform vec2 uRez;

                uniform float uAlpha;
                uniform float uTime;

                uniform int uColorScheme;
                uniform float uParticleShape;

                ${GLSL_NOISE}

                #define PI 3.1415926535897932384626433832795

                float sdRoundBox( in vec2 p, in vec2 b, in vec4 r )
                {
                    r.xy = (p.x>0.0)?r.xy : r.zw;
                    r.x  = (p.y>0.0)?r.x  : r.y;
                    vec2 q = abs(p)-b+r.x;
                    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
                }

                // rotate uv by angle
                vec2 rotate(vec2 v, float a) {
                    float s = sin(a);
                    float c = cos(a);
                    mat2 m = mat2(c, s, -s, c);
                    return m * v;
                }

                void main() {

                    float uBorderSize = 0.2;
                    vec2 center = vec2(.48, .4);
                    float ratio = uRez.x / uRez.y;

                    // get angle between
                    float angle = atan(vLocalPos.y - uMousePos.y, vLocalPos.x - uMousePos.x);

                    vec2 uv = gl_PointCoord.xy;
                    uv -= vec2(0.5);
                    uv.y *= -1.;

                    vec2 tuv = vScreenPos;
                    tuv = rotate(tuv, uTime * 1.);
                    tuv.y *= 1./ratio;
                    tuv += .5;

                    float h = 0.8; // adjust position of middleColor
                    float progress = vVelocity;
                    vec3 col = mix(mix(uColor1, uColor2, progress/h), mix(uColor2, uColor3, (progress - h)/(1.0 - h)), step(h, progress));
                    vec3 color = col;

                    float dist = sqrt(dot(uv, uv));

                    float dr = .5;
                    float t = smoothstep(dr+(uBorderSize + .0001), dr-uBorderSize, dist);
                    t = clamp(t, 0., 1.);

                    float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25));
                    rounded = smoothstep(.1, 0., rounded);

                    // circular mask
                    float disc = smoothstep(.5, .45, length(uv));

                    // square mask (use max of abs coords to form a box)
                    float square = smoothstep(.5, .45, max(abs(uv.x), abs(uv.y)));

                    // uParticleShape: 0 -> circle (default), 1 -> square
                    float mask = mix(disc, square, float(uParticleShape));

                    float a = uAlpha * mask * smoothstep(0.1, 0.2, vScale);

                    if(a < 0.01){
                        discard;
                    }

                    color = clamp(color, 0., 1.);
                    color = mix(color, color * clamp(vVelocity, 0., 1.), float(uColorScheme));

                    gl_FragColor = vec4(color, clamp(a, 0., 1.));

                    #ifdef SRGB_TRANSFER
                        gl_FragColor = sRGBTransferOETF( gl_FragColor );
                    #endif

                }
            `,
            transparent: !0,
            depthTest: !1,
            depthWrite: !1
        }),
        this.mesh = new Points(t,this.renderMaterial),
        this.mesh.position.set(0, 0, 0),
        this.mesh.scale.set(5, -5, 5),
        this.scene.scene.add(this.mesh)
    }
    resize() {
        this.renderMaterial.uniforms.uRez.value = new Vector2(this.scene.renderer.domElement.width,this.scene.renderer.domElement.height),
        this.renderMaterial.uniforms.uPixelRatio.value = this.scene.pixelRatio,
        this.renderMaterial.needsUpdate = !0
    }
    update() {
        let e = this.scene.clock.getElapsedTime() - this.lastTime;
        this.lastTime = this.scene.clock.getElapsedTime(),
        this.scene.isIntersecting ? this.mousePos.set(this.scene.intersectionPoint.x * .175, this.scene.intersectionPoint.y * .175) : this.mousePos.set(this.scene.intersectionPoint.x * .175, this.scene.intersectionPoint.y * .175),
        this.particleScale = this.getParticleScale(),
        this.simMaterial.uniforms.uPosition.value = this.everRendered ? this.rt1.texture : this.posTex,
        this.simMaterial.uniforms.uTime.value = this.scene.clock.getElapsedTime(),
        this.simMaterial.uniforms.uDeltaTime.value = e,
        this.simMaterial.uniforms.uRingRadius.value = .175 + Math.sin(this.scene.time * 1) * .03 + Math.cos(this.scene.time * 3) * .02,
        this.simMaterial.uniforms.uMousePos.value = this.mousePos,
        this.simMaterial.uniforms.uRingWidth.value = this.scene.ringWidth,
        this.simMaterial.uniforms.uRingWidth2.value = this.scene.ringWidth2,
        this.simMaterial.uniforms.uRingDisplacement.value = this.scene.ringDisplacement,
        this.simMaterial.uniforms.uIsHovering.value = this.scene.hoverProgress,
        this.simMaterial.uniforms.uPosNearest.value = this.posNearestTex,
        this.renderer.setRenderTarget(this.rt2),
        this.renderer.render(this.simScene, this.simCamera),
        this.renderer.setRenderTarget(null),
        this.renderMaterial.uniforms.uPosition.value = this.everRendered ? this.rt2.texture : this.posTex,
        this.renderMaterial.uniforms.uTime.value = this.scene.clock.getElapsedTime(),
        this.renderMaterial.uniforms.uMousePos.value = this.mousePos,
        this.renderMaterial.uniforms.uParticleScale.value = this.particleScale,
        this.renderMaterial.uniforms.uParticleShape.value = this.scene.particleShape,
        this.renderMaterial.uniforms.uIsHovering.value = this.scene.hoverProgress,
        this.renderMaterial.uniforms.uPulseProgress.value = this.scene.pushProgress
    }
    postRender() {
        let e = this.rt1;
        this.rt1 = this.rt2,
        this.rt2 = e,
        this.everRendered = !0
    }
    kill() {
        this.mesh.geometry.dispose(),
        this.mesh.material.dispose(),
        this.rt1.dispose(),
        this.rt2.dispose(),
        this.posTex.dispose(),
        this.simMaterial.dispose(),
        this.renderMaterial.dispose()
    }
}

/**
 * Morphing Particles Scene Class
 * Manages the overall scene, camera, renderer, and interactions.
 */
class MorphingParticlesScene {
    constructor(e) {
        this.loaded = !1;
        this.textures = e.textures || ["example.png"];
        this.color1 = e.color1 || "#aecbfa";
        this.color2 = e.color2 || "#aecbfa";
        this.color3 = e.color3 || "#93bbfc";
        this.options = e;
        this.particleShape = e.particleShape || 0;
        this.theme = e.theme || "dark";
        this.interactive = e.interactive || !1;
        // Set scene background according to theme. Use null for true transparency.
        // this.options.background = this.theme === "dark" ? new Color(1184535) : new Color(16777215);
        this.options.background = null;
        this.pixelRatio = e.pixelRatio || window.devicePixelRatio;
        this.particlesScale = e.particlesScale || .5;
        this.particlesScaleMode = e.particlesScaleMode || 'relative';
        this.density = e.density || 150;
        this.cameraZoom = e.cameraZoom || 3.5;
        this.responsive = e.responsive !== false;
        this.verbose = e.verbose || !1;
        this.onLoadedCallback = e.onLoaded || null;
        this.hoverRequested = false;
        this.isHovering = !1;
        this.hoverProgress = 0;
        this.pushProgress = 0;
        this.scene = new Scene;
        this.scene.background = this.options.background;
        this.canvas = document.createElement("canvas");
        this.options.container.appendChild(this.canvas);
        const size = this.getCanvasSizeFromParent();
        this.canvas.width = size.width;
        this.canvas.height = size.height;
        ColorManagement.enabled = false;
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: !0,
            alpha: !0,
            powerPreference: "high-performance",
            preserveDrawingBuffer: !0,
            stencil: !1,
            precision: "highp"
        });
        this.gl = this.renderer.getContext();
        this.renderer.extensions.get("EXT_color_buffer_float");
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.toneMapping = NoToneMapping;
        this.onWindowResize = this.onWindowResize.bind(this);
        this.initCamera();
        this.initScene();
        this.initEvents();
        this.clock = new Clock();
        this.time = 0;
        this.lastTime = 0;
        this.dt = 0;
        this.skipFrame = !1;
        this.isPaused = !1;
        this.resizeDebounceId = null;
        this.onResizeHandler = null;
        this.isRebuildingParticles = false;
        this.pendingParticlesRebuild = false;
        this.raycaster = new Raycaster();
        this.mouse = new Vector2();
        this.intersectionPoint = new Vector3();
        this.isIntersecting = !1;
        this.mouseIsOver = !1;
        // Create an invisible plane to receive raycasts for this scene
        this.raycastPlane = new Mesh(new PlaneGeometry(12.5,12.5), new MeshBasicMaterial({
            color: 16711680,
            visible: !1,
            side: DoubleSide
        }));
        this.scene.add(this.raycastPlane);
    }
    getCanvasSizeFromParent() {
        const containerWidth = this.options.container.offsetWidth || this.options.container.parentElement?.offsetWidth || window.innerWidth;
        const containerHeight = this.options.container.offsetHeight || this.options.container.parentElement?.offsetHeight || window.innerHeight;
        return {
            width: Math.max(1, containerWidth),
            height: Math.max(1, containerHeight)
        };
    }
    initEvents() {
        if (!this.responsive) return;
        this.onResizeHandler = () => {
            if (this.resizeDebounceId) {
                clearTimeout(this.resizeDebounceId);
            }
            this.resizeDebounceId = setTimeout(() => {
                this.onWindowResize();
            }, 80);
        };
        window.addEventListener("resize", this.onResizeHandler);
    }
    onWindowResize() {
        const size = this.getCanvasSizeFromParent();
        this.canvas.width = size.width;
        this.canvas.height = size.height;
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.camera.aspect = this.canvas.width / this.canvas.height;
        this.camera.updateProjectionMatrix();
        this.particles && this.particles.resize();
        if (this.responsive) {
            this.rebuildParticlesAfterResize();
        }
    }
    async rebuildParticlesAfterResize() {
        if (!this.particles) return;
        if (this.isRebuildingParticles) {
            this.pendingParticlesRebuild = true;
            return;
        }

        this.isRebuildingParticles = true;
        do {
            this.pendingParticlesRebuild = false;
            const shouldRestoreHover = this.hoverRequested;
            this.killParticles();
            await this.initParticles();
            if (shouldRestoreHover) {
                this.onHoverStart();
            }
        } while (this.pendingParticlesRebuild);

        this.isRebuildingParticles = false;
    }
    onHoverStart() {
        this.hoverRequested = true;
        if (!this.particles || !this.particles.shapeReady) return;
        Animator.to(this, { hoverProgress: 1, duration: .5, ease: "power3.out" });
        Animator.fromTo(this, { pushProgress: 0 }, { pushProgress: 1, duration: 2, delay: .1, ease: "power2.out" });
    }
    onHoverEnd() {
        this.hoverRequested = false;
        if (!this.particles || !this.particles.shapeReady) return;
        Animator.to(this, { hoverProgress: 0, duration: .5, ease: "power3.out" });
        Animator.fromTo(this, { pushProgress: 0 }, { pushProgress: 1, duration: 2, delay: 0, ease: "power2.out" });
    }
    setPointsTextureFromIndex(e) {
        Animator.delayedCall(.1, () => { this.particles && this.particles.setPointsTextureFromIndex(e); });
        Animator.fromTo(this, { pushProgress: 0 }, { pushProgress: 1, duration: 2, ease: "power2.out" });
    }
    initCamera() {
        this.camera = new PerspectiveCamera(40, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight, .1, 1e3);
        this.camera.position.z = this.cameraZoom;
    }
    async initScene() {
        this.colorControls = {
            color1: this.theme === "dark" ? this.color1 || "#318bf7" : this.color1 || "#676A72",
            color2: this.theme === "dark" ? this.color2 || "#bada4c" : this.color2 || "#FF4641",
            color3: this.theme === "dark" ? this.color3 || "#e35058" : this.color3 || "#346BF1"
        };
        await this.initParticles();
        this.options.gui && this.initGUI();
        this.onLoaded();
    }
    async initParticles() {
        this.particles = await MorphingParticleSystem.create(this, this.textures);
    }
    initGUI() {
        if (typeof GUI === 'undefined') return;

        this.gui = new GUI({
            autoPlace: !1
        });
        this.options.container.appendChild(this.gui.domElement);
        this.gui.domElement.style.position = "absolute";
        this.gui.domElement.style.top = "0";
        this.gui.domElement.style.right = "0";
        this.gui.domElement.style.zIndex = "1000";
        
        let c = this.gui.addFolder("Colors");
        c.addColor(this.colorControls, "color1").name("Color 1").onChange(t => {
            this.particles.renderMaterial.uniforms.uColor1.value.set(new Color(t));
        });
        c.addColor(this.colorControls, "color2").name("Color 2").onChange(t => {
            this.particles.renderMaterial.uniforms.uColor2.value.set(new Color(t));
        });
        c.addColor(this.colorControls, "color3").name("Color 3").onChange(t => {
            this.particles.renderMaterial.uniforms.uColor3.value.set(new Color(t));
        });

        let p = this.gui.addFolder("Particles");
        p.add(this, "particlesScale").name("Particles Scale").min(.1).max(4).step(.01).onChange(t => {
            this.particlesScale = t;
        });
        p.add(this, "density").name("Density").min(50).max(250).step(10).onChange(async t => {
            this.density = t;
            this.verbose;
            this.killParticles();
            await this.initParticles();
        });
        // Particle shape control: 0 = circle, 1 = square
        p.add(this, "particleShape").name("Particle Shape").min(0).max(1).step(1).onChange(t => {
            this.particles && (this.particles.renderMaterial.uniforms.uParticleShape.value = t);
        });
    }
    stop() {
        this.isPaused = !0;
        this.clock.stop();
        this.verbose;
    }
    resume() {
        this.isPaused = !1;
        this.clock.start();
        this.verbose;
    }
    killParticles() {
        if (!this.particles) return;
        this.scene.remove(this.particles.mesh);
        this.particles.kill();
        this.particles = null;
    }
    kill() {
        this.stop();
        if (this.resizeDebounceId) {
            clearTimeout(this.resizeDebounceId);
            this.resizeDebounceId = null;
        }
        if (this.onResizeHandler) {
            window.removeEventListener("resize", this.onResizeHandler);
            this.onResizeHandler = null;
        }
        this.raycastPlane && (this.scene.remove(this.raycastPlane),
        this.raycastPlane.geometry.dispose(),
        this.raycastPlane.material.dispose());
        this.renderer && this.renderer.dispose();
        this.canvas && this.canvas.parentElement && this.canvas.parentElement.removeChild(this.canvas);
    }
    onLoaded() {
        this.loaded = !0;
        this.onLoadedCallback && typeof this.onLoadedCallback == "function" && this.onLoadedCallback(this);
    }
    preRender() {
        if (this.dt = this.clock.getElapsedTime() - this.lastTime,
            this.lastTime = this.clock.getElapsedTime(),
            this.time += this.dt,
            this.particles.update(),
            this.interactive && !this.skipFrame) {
            let e = this.canvas.getBoundingClientRect(),
                t = mt.cursor;
            this.mouse.x = (mt.cursor.x - e.left) * (mt.screenWidth / e.width);
            this.mouse.y = (mt.cursor.y - e.top) * (mt.screenHeight / e.height);
            this.mouse.x = this.mouse.x / mt.screenWidth * 2 - 1;
            this.mouse.y = -(this.mouse.y / mt.screenHeight) * 2 + 1;
            this.mouse.x < -1 || this.mouse.x > 1 || this.mouse.y < -1 || this.mouse.y > 1 ? this.mouseIsOver = !1 : this.mouseIsOver = !0;
        }
        if (this.skipFrame = !this.skipFrame,
            !this.skipFrame && this.raycastPlane) {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            let e = this.raycaster.intersectObject(this.raycastPlane);
            e.length > 0 && this.mouseIsOver ? (this.intersectionPoint.copy(e[0].point),
                this.isIntersecting = !0) : this.isIntersecting = !1;
        }
    }
    render() {
        !this.loaded || this.isPaused || (this.preRender(),
            this.renderer.setRenderTarget(null),
            this.renderer.autoClear = !1,
            this.renderer.clear(),
            this.renderer.render(this.scene, this.camera),
            this.postRender());
    }
    postRender() {
        this.particles.postRender();
    }
}

/**
 * Morphing Particles Web Component
 * Encapsulates the MorphingParticlesScene within a custom HTML element.
 */
class MorphingParticlesComponent extends HTMLElement {
    constructor(){
        super();
        this._container = document.createElement('div');
        this._container.className = 'morphing-particles-container';
        this._isVisible = false;
        this._animationFrameId = null;
        this._intersectionObserver = null;
        this.scene = null;
    }
    static get observedAttributes() {
        return ['particle-shape', 'responsive', 'particles-scale-mode'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'particle-shape' && this.scene) {
            const v = parseFloat(newValue);
            if (this.scene) {
                this.scene.particleShape = isNaN(v) ? 1 : v;
                this.scene.particles && (this.scene.particles.renderMaterial.uniforms.uParticleShape.value = this.scene.particleShape);
            }
        }
        if (name === 'responsive' && this.scene) {
            const responsive = newValue !== 'false';
            this.scene.responsive = responsive;
            if (responsive) {
                this.scene.initEvents();
                this.scene.onWindowResize();
            } else if (this.scene.onResizeHandler) {
                window.removeEventListener('resize', this.scene.onResizeHandler);
                this.scene.onResizeHandler = null;
            }
        }
        if (name === 'particles-scale-mode' && this.scene) {
            const mode = newValue === 'absolute' ? 'absolute' : 'relative';
            this.scene.particlesScaleMode = mode;
        }
    }
    connectedCallback(){
        this._isVisible = true;
        // append container and initialize scene with attributes (fallback to defaults)
        this.appendChild(this._container);
        const theme = this.getAttribute('theme') || 'dark';
        const density = parseInt(this.getAttribute('density')) || 100;
        const particlesScale = parseFloat(this.getAttribute('particlesScale')) || 1;
        const particlesScaleMode = this.getAttribute('particles-scale-mode') === 'absolute' ? 'absolute' : 'relative';
        const cameraZoom = parseFloat(this.getAttribute('cameraZoom')) || 3.5;
        const responsive = this.getAttribute('responsive') !== 'false';
        const texture = this.getAttribute('texture') || 'example.png';
        let textures = [];
        try { textures = this.hasAttribute('textures') ? JSON.parse(this.getAttribute('textures')) : []; } catch(e){}
        const color1 = this.getAttribute('color1');
        const color2 = this.getAttribute('color2');
        const color3 = this.getAttribute('color3');
        const particleShape = this.hasAttribute('particle-shape') ? parseFloat(this.getAttribute('particle-shape')) : 0;
        const gui = this.hasAttribute('gui') ? this.getAttribute('gui') === 'true' : false;

        if (typeof MorphingParticlesScene === 'function') {
            this.scene = new MorphingParticlesScene({
                container: this._container,
                theme,
                density,
                particlesScale,
                particlesScaleMode,
                cameraZoom,
                responsive,
                texture,
                textures,
                particleShape,
                color1,
                color2,
                color3,
                interactive: true,
                gui: gui
            });
        }
        this._initIntersectionObserver();
        // Enable hover interactions directly on the component container
        try {
            this._container.addEventListener('mouseenter', () => { this.scene && this.scene.onHoverStart(); });
            this._container.addEventListener('mouseleave', () => { this.scene && this.scene.onHoverEnd(); });
        } catch (e) {}
        this._animate();
    }
    _initIntersectionObserver(){
        const opts = { root: null, rootMargin: '0px', threshold: 0 };
        this._intersectionObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                const hasRenderableArea = e.boundingClientRect.width > 0 && e.boundingClientRect.height > 0;
                this._isVisible = e.isIntersecting || !hasRenderableArea;
                if (this._isVisible) this.scene && this.scene.resume(); else this.scene && this.scene.stop();
            });
        }, opts);
        this._intersectionObserver.observe(this);
    }
    _animate = () => {
        this._animationFrameId = requestAnimationFrame(this._animate);
        if (this._isVisible) this.scene && this.scene.render();
    }
    disconnectedCallback(){
        this._intersectionObserver && this._intersectionObserver.disconnect();
        this._animationFrameId && cancelAnimationFrame(this._animationFrameId);
        this.scene && this.scene.kill();
    }
}
customElements.define('morphing-particles', MorphingParticlesComponent);
