import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/+esm';
import PoissonDiskSampling from 'https://cdn.jsdelivr.net/npm/poisson-disk-sampling@2.3.1/+esm'
// import { PoissonDiskSampling } from './poisson-disk-sampling.js';
import { PerlinNoise1D } from './perlin-noise.js';
import { GLSL_NOISE } from './simplex-noise.js';
import { MouseTracker } from './mouse-tracker.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18.0/+esm';

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

/**
 * Linear mapping utility function
 * Maps a value from one range to another.
 */
const mapRange = (value, inMin, inMax, outMin, outMax) => (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

/**
 * Amoeba Particle System Class
 * Manages the particle system, including initialization, simulation, and rendering.
 */
class AmoebaParticleSystem {
    constructor(e) {
        this.scene = e,
        this.renderer = e.renderer,
        this.gl = e.gl,
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
        const minDistance = mapRange(this.scene.density, 0, 300, 10, 2);
        const maxDistance = mapRange(this.scene.density, 0, 300, 10, 50);
        let points = new PoissonDiskSampling({
            shape: [500, 500],
            minDistance: minDistance,
            maxDistance: maxDistance,
            tries: 20
        }).fill();
        this.pointsData = [];
        for (let i = 0; i < points.length; i++)
            this.pointsData.push(points[i][0] - 250, points[i][1] - 250);
        this.count = this.pointsData.length / 2
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

                ${GLSL_NOISE}

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

/**
 * Amoeba Particles Scene Class
 * Manages the overall scene, including camera, renderer, and particle system.
 */
class AmoebaParticlesScene {
    constructor(e) {
        this.loaded = !1;
        this.texture = null;
        this.options = e;
        this.theme = e.theme || "dark";
        this.interactive = e.interactive || !1;
        // this.options.background = this.theme === "dark" ? new Color(0) : new Color(16777215);
        this.options.background = null;
        this.pixelRatio = e.pixelRatio || window.devicePixelRatio;
        this.particlesScale = e.particlesScale || 1;
        this.density = e.density || 200;
        this.verbose = e.verbose || !1;
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
        this.renderer.setPixelRatio(this.pixelRatio);
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
        this.mouse = new Vector2();
        this.intersectionPoint = new Vector3();
        this.isIntersecting = !1;
        this.mouseIsOver = !1;
        this.raycastPlane = new Mesh(new PlaneGeometry(12.5,12.5), new MeshBasicMaterial({
            color: 16711680,
            visible: !1,
            side: DoubleSide
        }));
        this.scene.add(this.raycastPlane);
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
        this.particles = new AmoebaParticleSystem(this)
    }
    initGUI() {
        if (typeof GUI === 'undefined') return;

        this.gui = new GUI({
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
        ,
        this.gui && (function(gui){
            try{ if (typeof gui.destroy === 'function') gui.destroy(); }catch(e){}
            if (gui.domElement && gui.domElement.parentNode) gui.domElement.parentNode.removeChild(gui.domElement);
        })(this.gui),
        this.gui = null
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
              , i = mt.cursor;
            this.mouse.x = (mt.cursor.x - t.left) * (mt.screenWidth / t.width),
            this.mouse.y = (mt.cursor.y - t.top) * (mt.screenHeight / t.height),
            this.mouse.x = this.mouse.x / mt.screenWidth * 2 - 1,
            this.mouse.y = -(this.mouse.y / mt.screenHeight) * 2 + 1,
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
};

/**
 * Amoeba Particles Web Component
 * Encapsulates the AmoebaParticlesScene within a custom HTML element.
 */
class AmoebaParticlesComponent extends HTMLElement {
    constructor(){
        super();
        this._container = document.createElement('div');
        this._container.className = 'amoeba-particles-container';
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
        const gui = this.hasAttribute('gui') ? this.getAttribute('gui') === 'true' : false;

        if (typeof AmoebaParticlesScene === 'function') {
            this.scene = new AmoebaParticlesScene({
                container: this._container,
                theme,
                particlesScale,
                density,
                interactive: true,
                gui: gui,
                verbose: false,
                ringWidth,
                ringWidth2,
                ringDisplacement,
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
customElements.define('amoeba-particles', AmoebaParticlesComponent);