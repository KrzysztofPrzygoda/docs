import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import PoissonDiskSampling from 'https://cdn.jsdelivr.net/npm/poisson-disk-sampling@2.3.1/+esm'
// import { PoissonDiskSampling } from './poisson-disk-sampling.js';

// GLSL Simplex Noise Functions
var GLSL_NOISE = `
  // MATHS
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}

  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

  // SIMPLEX NOISES
  // Simplex 2D noise
  //
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
            -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  //	Simplex 3D Noise
  //	by Ian McEwan, Ashima Arts
  //
  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0. + 0.0 * C
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  // Permutations
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

  // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }


  //	Simplex 4D Noise
  //	by Ian McEwan, Ashima Arts
  //
  vec4 grad4(float j, vec4 ip){
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;

    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

    return p;
  }

  float snoise(vec4 v){
    const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                          0.309016994374947451); // (sqrt(5) - 1)/4   F4
  // First corner
    vec4 i  = floor(v + dot(v, C.yyyy) );
    vec4 x0 = v -   i + dot(i, C.xxxx);

  // Other corners

  // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
    vec4 i0;

    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
  //  i0.x = dot( isX, vec3( 1.0 ) );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;

  //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;

    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    // i0 now contains the unique values 0,1,2,3 in each channel
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    //  x0 = x0 - 0.0 + 0.0 * C
    vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
    vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
    vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
    vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

  // Permutations
    i = mod(i, 289.0);
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
              i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
            + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
            + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
            + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
  // Gradients
  // ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
  // 7*7*6 = 294, which is close to the ring size 17*17 = 289.

    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);

  // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));

  // Mix contributions from the five corners
    vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
                + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

  }
`
    , Bp = {
        noise: GLSL_NOISE
};

    // Expect `THREE` to be provided as an ES module import (top of file) or as
    // a global script loaded before this file. Use destructuring from the
    // imported `THREE` namespace rather than creating ad-hoc runtime shims.
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
        FloatType,
        PerspectiveCamera,
        OrthographicCamera
    } = THREE;
    const { ColorManagement } = THREE;
    const { DoubleSide } = THREE;
    const { MeshBasicMaterial } = THREE;

// --- PerlinNoise1D ---
class PerlinNoise1D {
    constructor() {
        this.MAX_VERTICES = 256;
        this.MAX_VERTICES_MASK = this.MAX_VERTICES - 1;
        this.amplitude = 1;
        this.scale = 1;
        this.randoms = [];
        for (let i = 0; i < this.MAX_VERTICES; ++i) {
            this.randoms.push(Math.random());
        }
    }
    getValue(x) {
        let scaledX = x * this.scale;
        let xFloor = Math.floor(scaledX);
        let t = scaledX - xFloor;
        let fade = t * t * (3 - 2 * t);
        let idx0 = xFloor % this.MAX_VERTICES_MASK;
        let idx1 = (idx0 + 1) % this.MAX_VERTICES_MASK;
        let lerped = this.lerp(this.randoms[idx0], this.randoms[idx1], fade);
        return lerped * this.amplitude;
    }
    lerp(a, b, t) {
        return a * (1 - t) + b * t;
    }
}

// Use the imported UMD build which exposes `PoissonDiskSampling` on globalThis.
const PoissonDiskSampler = function(options, rng) {
    if (typeof PoissonDiskSampling === 'function') return new PoissonDiskSampling(options, rng);
    throw new Error('PoissonDiskSampling not available — ensure poisson-disk-sampling.umd.js is loaded');
};

// --- Linear Mapping Utility ---
const linearMap = (value, inMin, inMax, outMin, outMax) => (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

// --- ParticleSystem ---
class ParticleSystem {
    constructor(scene, textures) {
        this.scene = scene;
        this.renderer = scene.renderer; // Renderer for the particle system
        this.gl = scene.gl; 
        this.camera = scene.camera;
        this.textures = textures;
        this.lastTime = 0;
        this.everRendered = false;
        // Pozycja myszy i kursora (2D vector)
        this.mousePos = new Vector2(0, 0);
        this.cursorPos = new Vector2(0, 0);
        this.colorScheme = scene.theme === "dark" ? 0 : 1;
        this.particleScale = this.scene.renderer.domElement.width / this.scene.pixelRatio / 2000 * this.scene.particlesScale;
    }
    static async create(scene, textures) {
        let instance = new ParticleSystem(scene, textures); // Create a new instance of ParticleSystem
        instance.createPoints();
        await instance.createPointsFromImage();
        instance.init();
        return instance;
    }
    async getImageData(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.src = src; // Load image data from the source
            img.onload = () => {
                let canvas = document.createElement("canvas");
                canvas.width = 500;
                canvas.height = 500;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, 500, 500);
                let imageData = ctx.getImageData(0, 0, 500, 500);
                resolve(imageData);
            };
            img.onerror = reject;
        });
    }
    createPoints() {
        // Deminified: Poisson Disk Sampling for point generation
        console.log('[ParticleSystem] createPoints start, density=', this.scene && this.scene.density);
        const minDistance = linearMap(this.scene.density, 0, 300, 10, 2);
        const maxDistance = linearMap(this.scene.density, 0, 300, 10, 50);
        let poisson = new PoissonDiskSampler({
            shape: [500, 500],
            minDistance: minDistance,
            maxDistance: maxDistance,
            tries: 20
        }).fill();
        console.log('[ParticleSystem] poisson samples', poisson && poisson.length);
        this.pointsBaseData = poisson.map(point => [point[0] - 250, point[1] - 250]);
        this.pointsData = [];
        for (let i = 0; i < poisson.length; i++) {
            this.pointsData.push(poisson[i][0] - 250, poisson[i][1] - 250);
        }
        this.count = this.pointsData.length / 2;
        console.log('[ParticleSystem] density=', this.scene.density, 'points=', this.count, 'minDistance=', minDistance, 'maxDistance=', maxDistance);
    }
    async createPointsFromImage() {
        let images = [];
        if (!this.textures || this.textures.length === 0) {
            console.log('[ParticleSystem] no textures provided — using base points as nearestPoints fallback');
            this.nearestPointsData = [this.pointsData.slice()];
            return;
        }
        for (let i = 0; i < this.textures.length; i++) {
            let imgData = await this.getImageData(this.textures[i]);
            images.push(imgData);
        }
        this.nearestPointsData = [];
        let promises = [];
        console.log('[ParticleSystem] createPointsFromImage images count=', images.length);
        for (let i = 0; i < this.textures.length; i++) {
            promises.push(this.createPointsDistanceDataWorker(images[i], this.pointsBaseData, i));
        }
        let results = await Promise.all(promises);
        console.log('[ParticleSystem] createPointsFromImage results count=', results && results.length);
        results.sort((a, b) => a.index - b.index);
        results.forEach(result => {
            this.nearestPointsData.push(result.nearestPoints);
        });
        // Worker logic for finding nearest points based on image data
        return new Promise((resolve, reject) => {
            // ...existing code for worker creation and message passing...
            // (Zostawiamy szczegóły implementacji, bo są poprawne i czytelne)
            // ...existing code...
        });
    }
    createPointsDistanceDataWorker(imageData, pointsBase, index) {
        return new Promise((resolve, reject) => {
            try {
                console.log('[ParticleSystem] creating points worker, index=', index);
                const worker = new Worker(new URL('./points-worker.js', import.meta.url), { type: 'module' });
                worker.onmessage = (evt) => {
                    try { console.log('[ParticleSystem] worker.onmessage index=', evt.data && evt.data.index, 'nearestPoints length=', evt.data && evt.data.nearestPoints && evt.data.nearestPoints.length); } catch(e){}
                    resolve(evt.data);
                    worker.terminate();
                };
                worker.onerror = (err) => {
                    reject(err);
                    worker.terminate();
                };
                console.log('[ParticleSystem] posting to worker index=', index);
                worker.postMessage({ imageData, pointsBase, index, density: this.scene.density });
            } catch (err) {
                reject(err);
            }
        });
    }
    createDataTexturePosition(e) {
        let t = new Float32Array(this.length * 4);
        for (let r = 0; r < this.count; r++) {
            let o = r * 4;
            t[o + 0] = e[r * 2 + 0] * (1 / 250),
            t[o + 1] = e[r * 2 + 1] * (1 / 250),
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
        this.simMaterial.uniforms.uPosNearest = this.posNearestTex
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
                    value: 0
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

                ${Bp.noise}

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

                ${Bp.noise}

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

                    float disc = smoothstep(.5, .45, length(uv));

                    float a = uAlpha * disc * smoothstep(0.1, 0.2, vScale);

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
        try { console.log('[ParticleSystem] mesh added', 'count=', this.count, 'positionAttrCount=', this.mesh && this.mesh.geometry && this.mesh.geometry.attributes && this.mesh.geometry.attributes.position && this.mesh.geometry.attributes.position.count); } catch(e) {}
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
        this.particleScale = this.scene.renderer.domElement.width / this.scene.pixelRatio / 2e3 * this.scene.particlesScale,
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
// Czytelne aliasy i klasy
var MorphingParticles = ParticleSystem;
class MouseTracker {
    constructor() {
        this.cursor = new THREE.Vector2();
        this.initEvents();
        window.__debugMouse = this;
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.update();
    }
    initEvents() {
        window.addEventListener("mousemove", e => {
            this.onMouseMove(e);
        });
        window.addEventListener("resize", () => {
            this.screenWidth = window.innerWidth;
            this.screenHeight = window.innerHeight;
        });
    }
    onMouseMove(e) {
        this.cursor.x = e.clientX;
        this.cursor.y = e.clientY;
    }
    update() {
        requestAnimationFrame(() => {
            this.update();
        });
    }
}
var mouseTrackerInstance = new MouseTracker();
var $r = mouseTrackerInstance;
class MorphingParticlesScene {
    constructor(e) {
        this.loaded = !1;
        this.textures = e.textures || ["icon_cube.png"];
        this.color1 = e.color1 || "#aecbfa";
        this.color2 = e.color2 || "#aecbfa";
        this.color3 = e.color3 || "#93bbfc";
        this.options = e;
        this.theme = e.theme || "dark";
        this.interactive = !1;
        this.options.background = this.theme === "dark" ? new Color(1184535) : new Color(16777215);
        this.pixelRatio = e.pixelRatio || window.devicePixelRatio;
        this.particlesScale = e.particlesScale || .5;
        this.density = e.density || 150;
        this.cameraZoom = e.cameraZoom || 3.5;
        this.verbose = e.verbose || !1;
        this.onLoadedCallback = e.onLoaded || null;
        this.isHovering = !1;
        this.hoverProgress = 0;
        this.pushProgress = 0;
        this.scene = new Scene;
        this.scene.background = this.options.background;
        this.canvas = document.createElement("canvas");
        this.options.container.appendChild(this.canvas);
        this.canvas.width = this.options.container.offsetWidth;
        this.canvas.height = this.options.container.offsetHeight;
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
        // Ensure renderer uses device DPR and correct color/tone settings to match donor environment
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.NoToneMapping;
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
        this.raycaster = new Raycaster();
        this.mouse = new THREE.Vector2();
        this.intersectionPoint = new Vector3();
        this.isIntersecting = !1;
        this.mouseIsOver = !1;
    }
    initEvents() {
        window.addEventListener("resize", e => {
            this.onWindowResize();
        });
    }
    onWindowResize() {
        this.canvas.width = this.options.container.offsetWidth;
        this.canvas.height = this.options.container.offsetHeight;
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.camera.aspect = this.canvas.width / this.canvas.height;
        this.camera.updateProjectionMatrix();
        this.particles && this.particles.resize();
    }
    onHoverStart() {
        Je.to(this, {
            hoverProgress: 1,
            duration: .5,
            ease: "power3.out"
        });
        Je.fromTo(this, {
            pushProgress: 0
        }, {
            pushProgress: 1,
            duration: 2,
            delay: .1,
            ease: "power2.out"
        });
    }
    onHoverEnd() {
        Je.to(this, {
            hoverProgress: 0,
            duration: .5,
            ease: "power3.out"
        });
        Je.fromTo(this, {
            pushProgress: 0
        }, {
            pushProgress: 1,
            duration: 2,
            delay: 0,
            ease: "power2.out"
        });
    }
    setPointsTextureFromIndex(e) {
        Je.delayedCall(.1, () => {
            this.particles && this.particles.setPointsTextureFromIndex(e);
        });
        Je.fromTo(this, {
            pushProgress: 0
        }, {
            pushProgress: 1,
            duration: 2,
            ease: "power2.out"
        });
    }
    initCamera() {
        this.camera = new PerspectiveCamera(40, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight, .1, 1e3);
        this.camera.position.z = this.cameraZoom;
    }
    async initScene() {
        this.colorControls = {
            color1: this.theme === "dark" ? "#318bf7" : this.color1,
            color2: this.theme === "dark" ? "#bada4c" : this.color2,
            color3: this.theme === "dark" ? "#e35058" : this.color3
        };
        await this.initParticles();
        this.options.gui && this.initGUI();
        this.onLoaded();
    }
    async initParticles() {
        this.particles = await MorphingParticles.create(this, this.textures);
    }
    initGUI() {
        this.gui = new GUI({
            autoPlace: !1
        });
        this.options.container.appendChild(this.gui.domElement);
        this.gui.domElement.style.position = "absolute";
        this.gui.domElement.style.top = "0";
        this.gui.domElement.style.right = "0";
        this.gui.domElement.style.zIndex = "1000";
        let e = this.gui.addFolder("Colors");
        e.addColor(this.colorControls, "color1").name("Color 1").onChange(t => {
            this.particles.renderMaterial.uniforms.uColor1.value.set(new Color(t));
        });
        e.addColor(this.colorControls, "color2").name("Color 2").onChange(t => {
            this.particles.renderMaterial.uniforms.uColor2.value.set(new Color(t));
        });
        e.addColor(this.colorControls, "color3").name("Color 3").onChange(t => {
            this.particles.renderMaterial.uniforms.uColor3.value.set(new Color(t));
        });
        e.add(this, "particlesScale").name("Particles Scale").min(.1).max(4).step(.01).onChange(t => {
            this.particlesScale = t;
        });
        e.add(this, "density").name("Density").min(50).max(250).step(10).onChange(async t => {
            this.density = t;
            this.verbose;
            this.killParticles();
            await this.initParticles();
        });
        e.open();
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
        this.scene.remove(this.particles.mesh);
        this.particles.kill();
    }
    kill() {
        this.stop();
        window.removeEventListener("resize", this.onWindowResize);
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
                t = $r.cursor;
            this.mouse.x = ($r.cursor.x - e.left) * ($r.screenWidth / e.width);
            this.mouse.y = ($r.cursor.y - e.top) * ($r.screenHeight / e.height);
            this.mouse.x = this.mouse.x / $r.screenWidth * 2 - 1;
            this.mouse.y = -(this.mouse.y / $r.screenHeight) * 2 + 1;
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
// Removed unnecessary alias: use MorphingParticlesScene directly
const morphingParticlesContainerQuery = ["morphingParticlesContainer"]
    , MorphingParticlesComponent = class MorphingParticlesComponent {
    constructor(e) {
        this.route = e
    }
    theme = "dark";
    density = 100;
    particlesScale = 1;
    cameraZoom = 3.5;
    texture = "icon_cube.png";
    textures = [];
    color1;
    color2;
    color3;
    loaded = new SimpleEventEmitter();
    morphingParticlesContainer;
    scene;
    intersectionObserver;
    isVisible = !1;
    animationFrameId = null;
    // Angular-specific lifecycle hook ngAfterViewInit removed
    // This method has been removed to simplify the component lifecycle.
    initIntersectionObserver() {
        let e = {
            root: null,
            rootMargin: "0px",
            threshold: 0
        };
        this.intersectionObserver = new IntersectionObserver(t => {
            t.forEach(i => {
                this.isVisible = i.isIntersecting,
                i.isIntersecting ? this.scene.resume() : this.scene.stop()
            }
            )
        }
        ,e),
        this.intersectionObserver.observe(this.morphingParticlesContainer.nativeElement)
    }
    animate = () => {
        this.animationFrameId = requestAnimationFrame(this.animate),
        this.isVisible && this.scene.render()
    }
    ;
    onAllLoaded() {
        this.loaded.emit()
    }
    registerAnimation(e) {}
    onHover() {
        this.scene && this.scene.onHoverStart()
    }
    onLeave() {
        this.scene && this.scene.onHoverEnd()
    }
    setPointsTextureFromIndex(e) {
        this.scene && this.scene.setPointsTextureFromIndex(e)
    }
    };
    // Web Component replacement for the Angular morphing component
    // <landing-morphing-particles> will instantiate `MorphingParticlesScene` and manage lifecycle
    class LandingMorphingParticles extends HTMLElement {
        constructor(){
            super();
            this._container = document.createElement('div');
            this._container.className = 'morphing-particles-container';
            this._isVisible = false;
            this._animationFrameId = null;
            this._intersectionObserver = null;
            this.scene = null;
        }
        connectedCallback(){
            // append container and initialize scene with attributes (fallback to defaults)
            this.appendChild(this._container);
            const theme = this.getAttribute('theme') || 'dark';
            const density = parseInt(this.getAttribute('density')) || 100;
            const particlesScale = parseFloat(this.getAttribute('particlesScale')) || 1;
            const cameraZoom = parseFloat(this.getAttribute('cameraZoom')) || 3.5;
            const texture = this.getAttribute('texture') || 'icon_cube.png';
            let textures = [];
            try { textures = this.hasAttribute('textures') ? JSON.parse(this.getAttribute('textures')) : []; } catch(e){}
            const color1 = this.getAttribute('color1');
            const color2 = this.getAttribute('color2');
            const color3 = this.getAttribute('color3');

            if (typeof MorphingParticlesScene === 'function') {
                this.scene = new MorphingParticlesScene({
                    container: this._container,
                    theme,
                    density,
                    particlesScale,
                    cameraZoom,
                    texture,
                    textures,
                    color1,
                    color2,
                    color3,
                    interactive: true
                });
            }
            this._initIntersectionObserver();
            this._animate();
        }
        _initIntersectionObserver(){
            const opts = { root: null, rootMargin: '0px', threshold: 0 };
            this._intersectionObserver = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    this._isVisible = e.isIntersecting;
                    if (e.isIntersecting) this.scene && this.scene.resume(); else this.scene && this.scene.stop();
                });
            }, opts);
            this._intersectionObserver.observe(this._container);
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
    customElements.define('landing-morphing-particles', LandingMorphingParticles);
// Komponent sekcji "Wypróbuj rozwiązania" (Try Solutions)
class TrySolutionsComponent {
    header;
    description;
    cta;
    morphingComponent;
    sections = Zc.find(e => e.try_solutions)?.try_solutions?.sections || [];
    registerAnimation(e) {}
    onSectionMouseEnter(e) {
        let cmp = Array.from(this.morphingComponent)[e];
        cmp && cmp.onHover();
    }
    onSectionMouseLeave(e) {
        let cmp = Array.from(this.morphingComponent)[e];
        cmp && cmp.onLeave();
    }
    // Angular component metadata removed: TrySolutionsComponent converted/unused in vanilla context
}
// Poisson disk sampler for generating evenly distributed points
// Deminified: Use PoissonDiskSampler directly, no alias
// Linear mapping from one range to another
var mapRange = (value, inMin, inMax, outMin, outMax) => (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
var MainParticles = class {
    constructor(e) {
        this.scene = e,
        this.renderer = e.renderer,
        this.gl = this.gl,
        this.camera = e.camera,
        this.lastTime = 0,
        this.everRendered = !1,
        this.ringPos = new Vector2(0,0),
        this.cursorPos = new Vector2(0,0),
        this.colorScheme = e.theme === "dark" ? 0 : 1,
        this.particleScale = this.scene.renderer.domElement.width / this.scene.pixelRatio / 2e3 * this.scene.particlesScale,
        this.createPoints(),
        this.init()
    }
    createPoints() {
        // Generowanie punktów metodą Poissona
        const minDistance = mapRange(this.scene.density, 0, 300, 10, 2);
        const maxDistance = mapRange(this.scene.density, 0, 300, 10, 50);
        let points = new PoissonDiskSampler({
            shape: [500, 500],
            minDistance: minDistance,
            maxDistance: maxDistance,
            tries: 20
        }).fill();
        this.pointsData = [];
        for (let i = 0; i < points.length; i++)
            this.pointsData.push(points[i][0] - 250, points[i][1] - 250);
        this.count = this.pointsData.length / 2
        console.log('[MainParticles] density=', this.scene.density, 'points=', this.count, 'minDistance=', minDistance, 'maxDistance=', maxDistance);
    }
    createDataTexturePosition() {
        let e = new Float32Array(this.length * 4);
        for (let i = 0; i < this.count; i++) {
            let r = i * 4;
            e[r + 0] = this.pointsData[i * 2 + 0] * (1 / 250),
            e[r + 1] = this.pointsData[i * 2 + 1] * (1 / 250),
            e[r + 2] = 0,
            e[r + 3] = 0
        }
        let t = new DataTexture(e,this.size,this.size,RGBAFormat,FloatType);
        t.needsUpdate = true;
        return t
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
    init() {
        this.size = 256,
        this.length = this.size * this.size,
        this.posTex = this.createDataTexturePosition(),
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
                uRingPos: {
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
                uniform vec2 uRingPos;
                uniform float uTime;
                uniform float uDeltaTime;
                uniform float uRingRadius;

                uniform float uRingWidth;
                uniform float uRingWidth2;
                uniform float uRingDisplacement;

                ${Bp.noise}

                void main() {

                    vec2 simTexCoords = gl_FragCoord.xy / vec2(${this.size.toFixed(1)}, ${this.size.toFixed(1)});
                    vec4 pFrame = texture2D(uPosition, simTexCoords);
                    // float pTime = pFrame.w - uDeltaTime;

                    float scale = pFrame.z;
                    float velocity = pFrame.w;
                    vec2 refPos = texture2D(uPosRefs, simTexCoords).xy;

                    float time = uTime * .5;
                    vec2 curentPos = refPos;

                    vec2 pos = pFrame.xy;
                    pos *= .8;

                    float dist = distance(curentPos.xy, uRingPos);
                    float noise0 = snoise(vec3(curentPos.xy * .2 + vec2(18.4924, 72.9744), time * 0.5));
                    float dist1 = distance(curentPos.xy + (noise0 * .005), uRingPos);


                    float t = smoothstep(uRingRadius - (uRingWidth * 2.), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth, dist1);
                    float t2 = smoothstep(uRingRadius - (uRingWidth2 * 2.), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth2, dist1);
                    float t3 = smoothstep(uRingRadius + uRingWidth2, uRingRadius, dist);

                    t = pow(t, 2.);
                    t2 = pow(t2, 3.);

                    t += t2 * 3.;
                    t += t3 * .4;
                    t += snoise(vec3(curentPos.xy * 30. + vec2(11.4924, 12.9744), time * 0.5)) * t3 * .5;

                    float nS = snoise(vec3(curentPos.xy * 2. + vec2(18.4924, 72.9744), time * 0.5));
                    t += pow((nS + 1.5) * .5, 2.) * .6;

                    // Mid scale noise
                    float noise1 = snoise(vec3(curentPos.xy * 4. + vec2(88.494, 32.4397), time * 0.35));
                    float noise2 = snoise(vec3(curentPos.xy * 4. + vec2(50.904, 120.947), time * 0.35));

                    // Close scale noise
                    float noise3 = snoise(vec3(curentPos.xy * 20. + vec2(18.4924, 72.9744), time * .5));
                    float noise4 = snoise(vec3(curentPos.xy * 20. + vec2(50.904, 120.947), time * .5));

                    // Far scale noise
                    // float noise5 = snoise(vec3(curentPos.xy * .5 + vec2(89.4924, 12.9744), time * 0.1));
                    // float noise6 = snoise(vec3(curentPos.xy * .5 + vec2(70.904, 120.947), time * 0.1));

                    vec2 disp = vec2(noise1, noise2) * .03;
                    disp += vec2(noise3, noise4) * .005;
                    // disp += vec2(noise5, noise6) * .05;

                    // Sin wave
                    disp.x += sin((refPos.x * 20.) + (time * 4.)) * .02 * clamp(dist, 0., 1.);
                    disp.y += cos((refPos.y * 20.) + (time * 3.)) * .02 * clamp(dist, 0., 1.);

                    pos -= (uRingPos - (curentPos + disp)) * pow(t2, .75) * uRingDisplacement;

                    // Add min scale
                    // t += .25;


                    // Add scale
                    float scaleDiff = t - scale;
                    scaleDiff *= .2;
                    scale += scaleDiff;


                    // Final position
                    vec2 finalPos = curentPos + disp + (pos * .25);

                    velocity *= .5;
                    velocity += scale * .25;

                    vec4 frame = vec4(finalPos, scale, velocity);

                    gl_FragColor = frame;

                }
            `
        });
        let e = new Mesh(new PlaneGeometry(2,2), this.simMaterial);
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
                uRingPos: {
                    value: new Vector2(0,0)
                },
                uRez: {
                    value: new Vector2(this.scene.renderer.domElement.width,this.scene.renderer.domElement.height)
                },
                uParticleScale: {
                    value: this.particleScale
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

                varying vec4 vSeeds;
                varying float vVelocity;
                varying vec2 vLocalPos;
                varying vec2 vScreenPos;
                varying float vScale;

                void main() {

                    vec4 pos = texture2D(uPosition, uv);
                    vSeeds = seeds;

                    vVelocity = pos.w;
                    vScale = pos.z;
                    vLocalPos = pos.xy;
                    vec4 viewSpace  = modelViewMatrix * vec4(vec3(pos.xy, 0.), 1.0);

                    gl_Position = projectionMatrix * viewSpace;
                    vScreenPos = gl_Position.xy;

                    gl_PointSize = ((vScale * 7.) * (uPixelRatio * 0.5) * uParticleScale);

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

                uniform vec2 uRingPos;
                uniform vec2 uRez;

                uniform float uAlpha;
                uniform float uTime;

                uniform int uColorScheme;

                ${Bp.noise}

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

                    // Noise
                    float noiseAngle = snoise(vec3(vLocalPos * 10. + vec2(18.4924, 72.9744), uTime * .85));
                    float noiseColor = snoise(vec3(vLocalPos * 2. + vec2(74.664, 91.556), uTime * .5));
                    noiseColor = (noiseColor + 1.) * .5;

                    // get angle between
                    float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);

                    vec2 uv = gl_PointCoord.xy;
                    uv -= vec2(0.5);
                    uv.y *= -1.;
                    uv = rotate(uv, -angle + (noiseAngle * .5));

                    vec2 tuv = vScreenPos;
                    tuv = rotate(tuv, uTime * 1.);
                    tuv.y *= 1./ratio;
                    tuv += .5;

                    float h = 0.8; // adjust position of middleColor
                    float progress = smoothstep(0., .75, pow(noiseColor, 2.));
                    vec3 col = mix(mix(uColor1, uColor2, progress/h), mix(uColor2, uColor3, (progress - h)/(1.0 - h)), step(h, progress));
                    vec3 color = col;

                    float dist = sqrt(dot(uv, uv));

                    float dr = .5;
                    float t = smoothstep(dr+(uBorderSize + .0001), dr-uBorderSize, dist);
                    t = clamp(t, 0., 1.);

                    float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25));
                    rounded = smoothstep(.1, 0., rounded);

                    float a = uAlpha * rounded * smoothstep(0.1, 0.2, vScale);

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
        this.mesh.scale.set(5, 5, 5),
        this.scene.scene.add(this.mesh)
    }
    resize() {
        this.renderMaterial.uniforms.uRez.value = new Vector2(this.scene.renderer.domElement.width,this.scene.renderer.domElement.height),
        this.renderMaterial.uniforms.uPixelRatio.value = this.scene.pixelRatio,
        this.renderMaterial.needsUpdate = !0
    }
    update() {
        let e = this.scene.clock.getElapsedTime() - this.lastTime;
        this.lastTime = this.scene.clock.getElapsedTime();
                let t = (this.noise.getValue(this.scene.time * .66 + 94.234) - .5) * 2
                    , i = (this.noise.getValue(this.scene.time * .75 + 21.028) - .5) * 2;
        this.cursorPos.set(t * .2, i * .1),
        this.scene.isIntersecting ? (this.cursorPos.set(this.scene.intersectionPoint.x * .175 + t * .1, this.scene.intersectionPoint.y * .175 + i * .1),
        this.ringPos.set(this.ringPos.x + (this.cursorPos.x - this.ringPos.x) * .02, this.ringPos.y + (this.cursorPos.y - this.ringPos.y) * .02)) : (this.cursorPos.set(t * .2, i * .1),
        this.ringPos.set(this.ringPos.x + (this.cursorPos.x - this.ringPos.x) * .01, this.ringPos.y + (this.cursorPos.y - this.ringPos.y) * .01)),
        this.particleScale = this.scene.renderer.domElement.width / this.scene.pixelRatio / 2e3 * this.scene.particlesScale,
        this.simMaterial.uniforms.uPosition.value = this.everRendered ? this.rt1.texture : this.posTex,
        this.simMaterial.uniforms.uTime.value = this.scene.clock.getElapsedTime(),
        this.simMaterial.uniforms.uDeltaTime.value = e,
        this.simMaterial.uniforms.uRingRadius.value = .175 + Math.sin(this.scene.time * 1) * .03 + Math.cos(this.scene.time * 3) * .02,
        this.simMaterial.uniforms.uRingPos.value = this.ringPos,
        this.simMaterial.uniforms.uRingWidth.value = this.scene.ringWidth,
        this.simMaterial.uniforms.uRingWidth2.value = this.scene.ringWidth2,
        this.simMaterial.uniforms.uRingDisplacement.value = this.scene.ringDisplacement,
        this.renderer.setRenderTarget(this.rt2),
        this.renderer.render(this.simScene, this.simCamera),
        this.renderer.setRenderTarget(null),
        this.renderMaterial.uniforms.uPosition.value = this.everRendered ? this.rt2.texture : this.posTex,
        this.renderMaterial.uniforms.uTime.value = this.scene.clock.getElapsedTime(),
        this.renderMaterial.uniforms.uRingPos.value = this.ringPos,
        this.renderMaterial.uniforms.uParticleScale.value = this.particleScale
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
    // alias removed: MainParticles is now the class name
var MainScene = class {
    constructor(e) {
        this.loaded = !1,
        this.texture = null,
        this.options = e,
        this.theme = e.theme || "dark",
        this.interactive = e.interactive || !1,
        this.options.background = this.theme === "dark" ? new Color(0) : new Color(16777215),
        this.pixelRatio = e.pixelRatio || window.devicePixelRatio,
        this.particlesScale = e.particlesScale || 1,
        this.density = e.density || 200,
        this.verbose = e.verbose || !1,
        this.scene = new Scene,
        this.scene.background = this.options.background,
        this.canvas = document.createElement("canvas"),
        this.options.container.appendChild(this.canvas),
        this.canvas.width = this.options.container.offsetWidth,
        this.canvas.height = this.options.container.offsetHeight,
        ColorManagement.enabled = false,
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: !0,
            alpha: !0,
            powerPreference: "high-performance",
            preserveDrawingBuffer: !0,
            stencil: !1,
            precision: "highp"
        }),
        this.gl = this.renderer.getContext(),
        this.renderer.extensions.get("EXT_color_buffer_float"),
        this.renderer.setSize(this.canvas.width, this.canvas.height),
        this.renderer.setPixelRatio(this.pixelRatio),
        this.onWindowResize = this.onWindowResize.bind(this),
        this.initCamera(),
        this.initScene(),
        this.initEvents(),
        this.clock = new Clock(),
        this.time = 0,
        this.lastTime = 0,
        this.dt = 0,
        this.skipFrame = !1,
        this.isPaused = !1,
        this.raycaster = new Raycaster(),
        this.mouse = new THREE.Vector2(),
        this.intersectionPoint = new Vector3(),
        this.isIntersecting = !1,
        this.mouseIsOver = !1,
        this.raycastPlane = new Mesh(new PlaneGeometry(12.5,12.5), new MeshBasicMaterial({
            color: 16711680,
            visible: !1,
            side: DoubleSide
        })),
        this.scene.add(this.raycastPlane)
    }
    initEvents() {
        window.addEventListener("resize", e => {
            this.onWindowResize()
        }
        )
    }
    onWindowResize() {
        this.canvas.width = this.options.container.offsetWidth,
        this.canvas.height = this.options.container.offsetHeight,
        this.renderer.setSize(this.canvas.width, this.canvas.height),
        this.camera.aspect = this.canvas.width / this.canvas.height,
        this.camera.updateProjectionMatrix(),
        this.particles && this.particles.resize()
    }
    initCamera() {
        this.camera = new PerspectiveCamera(40, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight, 0.1, 1000);
        this.camera.position.z = 3.1;
    }
    initScene() {
        this.colorControls = {
            color1: this.theme === "dark" ? "#7189ff" : "#2c64ed",
            color2: this.theme === "dark" ? "#3074f9" : "#f84242",
            color3: this.theme === "dark" ? "#000000" : "#ffcf03"
        },
        this.ringWidth = this.options.ringWidth || .107,
        this.ringWidth2 = this.options.ringWidth2 || .05,
        this.ringDisplacement = this.options.ringDisplacement || .15,
        this.initParticles(),
        this.options.gui && this.initGUI(),
        this.onLoaded()
    }
    initParticles() {
        this.particles = new MainParticles(this)
    }
    initGUI() {
        this.gui = new yb({
            autoPlace: !1
        }),
        this.options.container.appendChild(this.gui.domElement),
        this.gui.domElement.style.position = "absolute",
        this.gui.domElement.style.top = "0",
        this.gui.domElement.style.right = "0",
        this.gui.domElement.style.zIndex = "1000";
        let e = this.gui.addFolder("Colors");
        e.addColor(this.colorControls, "color1").name("Color 1").onChange(t => {
            this.particles.renderMaterial.uniforms.uColor1.value.set(new Color(t))
        }
        ),
        e.addColor(this.colorControls, "color2").name("Color 2").onChange(t => {
            this.particles.renderMaterial.uniforms.uColor2.value.set(new Color(t))
        }
        ),
        e.addColor(this.colorControls, "color3").name("Color 3").onChange(t => {
            this.particles.renderMaterial.uniforms.uColor3.value.set(new Color(t))
        }
        ),
        e.add(this, "ringWidth").name("Ring Width").min(.001).max(.2).step(.001).onChange(t => {
            this.ringWidth = t
        }
        ),
        e.add(this, "ringWidth2").name("Ring Width 2").min(.001).max(.2).step(.001).onChange(t => {
            this.ringWidth2 = t
        }
        ),
        e.add(this, "particlesScale").name("Particles Scale").min(.1).max(2).step(.01).onChange(t => {
            this.particlesScale = t
        }
        ),
        e.add(this, "ringDisplacement").name("Displacement").min(.01).max(1).step(.01).onChange(t => {
            this.ringDisplacement = t
        }
        ),
        e.add(this, "density").name("Density").min(100).max(300).step(10).onChange(t => {
            this.density = t,
            this.verbose,
            this.killParticles(),
            this.initParticles()
        }
        ),
        e.open()
    }
    stop() {
        this.isPaused = !0,
        this.clock.stop(),
        this.verbose
    }
    resume() {
        this.isPaused = !1,
        this.clock.start(),
        this.verbose
    }
    killParticles() {
        this.scene.remove(this.particles.mesh),
        this.particles.kill()
    }
    kill() {
        this.stop(),
        window.removeEventListener("resize", this.onWindowResize),
        this.raycastPlane && (this.scene.remove(this.raycastPlane),
        this.raycastPlane.geometry.dispose(),
        this.raycastPlane.material.dispose()),
        this.renderer && this.renderer.dispose(),
        this.canvas && this.canvas.parentElement && this.canvas.parentElement.removeChild(this.canvas)
    }
    onLoaded() {
        this.loaded = !0
    }
    preRender() {
        if (this.dt = this.clock.getElapsedTime() - this.lastTime,
        this.lastTime = this.clock.getElapsedTime(),
        this.time += this.dt,
        this.particles.update(),
        this.interactive && !this.skipFrame) {
            let t = this.canvas.getBoundingClientRect()
              , i = $r.cursor;
            this.mouse.x = ($r.cursor.x - t.left) * ($r.screenWidth / t.width),
            this.mouse.y = ($r.cursor.y - t.top) * ($r.screenHeight / t.height),
            this.mouse.x = this.mouse.x / $r.screenWidth * 2 - 1,
            this.mouse.y = -(this.mouse.y / $r.screenHeight) * 2 + 1,
            this.mouse.x < -1 || this.mouse.x > 1 || this.mouse.y < -1 || this.mouse.y > 1 ? this.mouseIsOver = !1 : this.mouseIsOver = !0
        }
        if (this.skipFrame = !this.skipFrame,
        this.skipFrame)
            return;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let e = this.raycaster.intersectObject(this.raycastPlane);
        e.length > 0 && this.mouseIsOver ? (this.intersectionPoint.copy(e[0].point),
        this.isIntersecting = !0) : this.isIntersecting = !1
    }
    render() {
        !this.loaded || this.isPaused || (this.preRender(),
        this.renderer.setRenderTarget(null),
        this.renderer.autoClear = !1,
        this.renderer.clear(),
        this.renderer.render(this.scene, this.camera),
        this.postRender())
    }
    postRender() {
        this.particles.postRender()
    }
        }
    , H9 = MainScene;
var mainParticlesContainerQuery = ["mainParticlesContainer"]
    , MainParticlesAngularComponent = class n {
    theme = "light";
    ringWidth = .15;
    ringWidth2 = .05;
    ringDisplacement = .15;
    density = 200;
    particlesScale = .75;
    mainParticlesContainer;
    scene;
    intersectionObserver;
    isVisible = !1;
    animationFrameId = null;
    ngAfterViewInit() {
        let t = new URLSearchParams(window.location.search).get("gui") === "true";
        this.scene = new H9({
            container: this.mainParticlesContainer.nativeElement,
            theme: this.theme,
            particlesScale: this.particlesScale,
            density: this.density,
            interactive: !0,
            gui: t,
            verbose: !1,
            ringWidth: this.ringWidth,
            ringWidth2: this.ringWidth2,
            ringDisplacement: this.ringDisplacement
        }),
        this.initIntersectionObserver(),
        this.animate()
    }
    initIntersectionObserver() {
        let e = {
            root: null,
            rootMargin: "0px",
            threshold: 0
        };
        this.intersectionObserver = new IntersectionObserver(t => {
            t.forEach(i => {
                this.isVisible = i.isIntersecting,
                i.isIntersecting ? this.scene.resume() : this.scene.stop()
            }
            )
        }
        ,e),
        this.intersectionObserver.observe(this.mainParticlesContainer.nativeElement)
    }
    animate = () => {
        this.animationFrameId = requestAnimationFrame(this.animate),
        this.isVisible && this.scene.render()
    }
    ;
    ngOnDestroy() {
        this.intersectionObserver && this.intersectionObserver.disconnect(),
        this.animationFrameId !== null && cancelAnimationFrame(this.animationFrameId),
        this.scene && this.scene.kill()
    }
    };
    // Web Component replacement for the Angular main particles component
    // <landing-main-particles> will instantiate `H9` (Main scene) and manage lifecycle
    class LandingMainParticles extends HTMLElement {
        constructor(){
            super();
            this._container = document.createElement('div');
            this._container.className = 'main-particles-container';
            this._isVisible = false;
            this._animationFrameId = null;
            this._intersectionObserver = null;
            this.scene = null;
        }
        connectedCallback(){
            this.appendChild(this._container);
            const theme = this.getAttribute('theme') || 'light';
            const particlesScale = parseFloat(this.getAttribute('particlesScale')) || 0.75;
            const density = parseInt(this.getAttribute('density')) || 200;
            const ringWidth = parseFloat(this.getAttribute('ringWidth')) || 0.15;
            const ringWidth2 = parseFloat(this.getAttribute('ringWidth2')) || 0.05;
            const ringDisplacement = parseFloat(this.getAttribute('ringDisplacement')) || 0.15;

            if (typeof H9 === 'function') {
                this.scene = new H9({
                    container: this._container,
                    theme,
                    particlesScale,
                    density,
                    interactive: true,
                    gui: false,
                    verbose: false,
                    ringWidth,
                    ringWidth2,
                    ringDisplacement
                });
            }
            this._initIntersectionObserver();
            this._animate();
        }
        _initIntersectionObserver(){
            const opts = { root: null, rootMargin: '0px', threshold: 0 };
            this._intersectionObserver = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    this._isVisible = e.isIntersecting;
                    if (e.isIntersecting) this.scene && this.scene.resume(); else this.scene && this.scene.stop();
                });
            }, opts);
            this._intersectionObserver.observe(this._container);
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
    customElements.define('landing-main-particles', LandingMainParticles);

// Angular component markup examples removed (migrated to native Web Components)