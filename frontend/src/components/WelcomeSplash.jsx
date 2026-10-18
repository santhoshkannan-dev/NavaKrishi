import React, { useEffect, useRef, useState } from 'react';
import {
  Scene, WebGLRenderer, PerspectiveCamera, Color, Group, Box3, Vector3,
  Mesh, ExtrudeGeometry, MeshStandardMaterial,
  InstancedMesh, BoxGeometry, Object3D,
  AmbientLight, DirectionalLight,
  ShaderMaterial, SphereGeometry, BackSide,
} from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { animate, createTimeline, createTimer, utils, cubicBezier, linear, stagger } from 'animejs';
import { getInstances } from 'animejs/adapters/three';

// 3D Extruded Vector Paths for NAVAKRISHI
const SVG_CODE = `<svg id="logo" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
  <g fill-rule="evenodd" transform="scale(0.01118)">
    <polygon id="i-dot" fill="#22c55e" points="488 207, 510 207, 510 215, 488 215" />
    <polygon id="i2-dot" fill="#22c55e" points="698 207, 720 207, 720 215, 698 215" />
    
    <path id="n1" fill="#FFF" d="M 60,295 L 60,210 L 82,210 L 108,272 L 108,210 L 128,210 L 128,295 L 106,295 L 80,233 L 80,295 Z" />
    <path id="a1" fill="#FFF" d="M 140,295 L 168,210 L 192,210 L 220,295 L 198,295 L 190,267 L 170,267 L 162,295 Z M 175,249 L 185,249 L 180,229 Z" />
    <path id="v" fill="#FFF" d="M 230,210 L 254,210 L 270,274 L 286,210 L 310,210 L 282,295 L 258,295 Z" />
    <path id="a2" fill="#FFF" d="M 320,295 L 348,210 L 372,210 L 400,295 L 378,295 L 370,267 L 350,267 L 342,295 Z M 355,249 L 365,249 L 360,229 Z" />
    <path id="k" fill="#FFF" d="M 410,295 L 410,210 L 432,210 L 432,248 L 462,210 L 488,210 L 454,254 L 490,295 L 464,295 L 436,257 L 432,263 L 432,295 Z" />
    
    <path id="r" fill="#FFF" d="M 500,295 L 500,210 L 544,210 C 562,210 574,220 574,236 C 574,248 564,258 548,260 L 578,295 L 554,295 L 528,257 L 522,257 L 522,295 Z M 522,244 L 540,244 C 548,244 554,240 554,235 C 554,230 548,226 540,226 L 522,226 Z" />
    <polygon id="i-bar" fill="#FFF" points="588 295, 588 220, 610 220, 610 295" />
    <path id="s" fill="#FFF" d="M 678,234 L 658,234 C 644,234 634,232 634,226 C 634,221 642,218 654,218 C 666,218 674,222 676,230 L 696,228 C 692,216 678,210 654,210 C 630,210 612,218 612,234 C 612,248 628,254 648,256 L 660,258 C 672,260 678,264 678,272 C 678,280 668,284 654,284 C 638,284 626,278 624,266 L 604,268 C 608,286 626,296 654,296 C 680,296 698,284 698,268 C 698,252 682,246 662,244 Z" />
    <path id="h" fill="#FFF" d="M 708,295 L 708,210 L 730,210 L 730,246 L 766,246 L 766,210 L 788,210 L 788,295 L 766,295 L 766,264 L 730,264 L 730,295 Z" />
    <polygon id="i2-bar" fill="#FFF" points="798 295, 798 220, 820 220, 820 295" />
  </g>
</svg>`;

const WelcomeSplash = ({ onFinish }) => {
  const containerRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  const handleSkip = () => {
    setHidden(true);
    setTimeout(() => {
      onFinish?.();
    }, 600);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Split NAVAKRISHI into animation tracks
    const LETTER_IDS = ['n1', 'a1', 'v', 'a2', 'k']; // NAVAK (Main floor pop)
    const JS_IDS = ['r', 'i-bar', 's'];              // RIS (Plug track 1)
    const THREED_IDS = ['h', 'i2-bar'];             // HI  (Plug track 2)
    const DEPTH = 0.2565;
    const ITALIC_SKEW = 8;

    // Parse SVG string into DOM
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(SVG_CODE, 'image/svg+xml');
    const svgEl = svgDoc.querySelector('svg');
    const data = new SVGLoader().parse(svgEl.outerHTML);

    const parsed = {};
    function flipShapeY(shape) {
      const flipPath = (p) => p.curves.forEach((c) => {
        if (c.v0) c.v0.y = -c.v0.y;
        if (c.v1) c.v1.y = -c.v1.y;
        if (c.v2) c.v2.y = -c.v2.y;
        if (c.v3) c.v3.y = -c.v3.y;
      });
      flipPath(shape);
      shape.holes.forEach(flipPath);
    }

    for (const path of data.paths) {
      const id = path.userData?.node?.id;
      if (!id) continue;
      const shapes = path.toShapes ? path.toShapes(true) : SVGLoader.createShapes(path);
      shapes.forEach(flipShapeY);
      const geom = new ExtrudeGeometry(shapes, { depth: DEPTH, bevelEnabled: false });
      const bbox = new Box3().setFromBufferAttribute(geom.attributes.position);
      const center = bbox.getCenter(new Vector3());
      const size = bbox.getSize(new Vector3());
      geom.translate(-center.x, -center.y, -center.z);
      parsed[id] = { geom, center, size, color: path.userData.style.fill || '#fff' };
    }

    if (parsed['i-dot'] && parsed['i-bar']) {
      parsed['i-dot'].center.x = parsed['i-bar'].center.x;
    }

    const meshes = {};
    const logoGroup = new Group();
    const allIds = [...LETTER_IDS, 'i-dot', 'i2-dot', ...JS_IDS, ...THREED_IDS];
    for (const id of allIds) {
      if (!parsed[id]) continue;
      const { geom, center, size, color } = parsed[id];
      const mesh = new Mesh(geom, new MeshStandardMaterial({
        color: new Color(color), roughness: 0.4, metalness: 0.1,
      }));
      mesh.position.copy(center);
      mesh.userData.halfHeight = size.y / 2;
      meshes[id] = mesh;
      logoGroup.add(mesh);
    }

    const FLOOR_COLS = 31;
    const FLOOR_ROWS = 31;
    const tileSize = 1;

    const dotSizeX = parsed['i-dot'] ? parsed['i-dot'].size.x : 1;
    const scale = tileSize / dotSizeX;
    logoGroup.scale.setScalar(scale);

    const iLocalBottomY = parsed['i-bar'] ? parsed['i-bar'].center.y - parsed['i-bar'].size.y / 2 : 0;
    const iDotCenterX = parsed['i-dot'] ? parsed['i-dot'].center.x : 0;
    logoGroup.position.set(
      -iDotCenterX * scale,
      tileSize / 2 - iLocalBottomY * scale,
      0,
    );

    const wrapper = new Group();
    wrapper.add(logoGroup);
    wrapper.position.y = -5;

    const SCENE_GREY = '#1b2e23';
    const HORIZON_GREY = '#152b1e';
    const SKY_GREY = '#0a1910';
    const BG = '#050c07';

    const scene = new Scene();
    scene.background = new Color(BG);

    const skyMaterial = new ShaderMaterial({
      uniforms: {
        topColor: { value: new Color(SKY_GREY) },
        bottomColor: { value: new Color(HORIZON_GREY) },
        offset: { value: 32 },
        exponent: { value: 0.6 },
      },
      side: BackSide,
      fog: false,
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, pow(max(h, 0.0), exponent)), 1.0);
          #include <colorspace_fragment>
        }
      `,
    });
    const sky = new Mesh(new SphereGeometry(600, 32, 15), skyMaterial);
    scene.add(sky);
    scene.add(wrapper);

    const floorGroup = new Group();
    const floor = new InstancedMesh(
      new BoxGeometry(tileSize, tileSize, tileSize),
      new MeshStandardMaterial({ color: new Color(SCENE_GREY), roughness: 0.7, metalness: 0.05 }),
      FLOOR_COLS * FLOOR_ROWS,
    );
    const dummy = new Object3D();
    for (let r = 0; r < FLOOR_ROWS; r++) {
      for (let c = 0; c < FLOOR_COLS; c++) {
        dummy.position.set(c - (FLOOR_COLS - 1) / 2, 0, r - (FLOOR_ROWS - 1) / 2);
        dummy.updateMatrix();
        floor.setMatrixAt(r * FLOOR_COLS + c, dummy.matrix);
      }
    }
    floorGroup.add(floor);

    const tiles = getInstances(floor);

    const FLOOR_HALF_X = FLOOR_COLS * tileSize / 2;
    const FLOOR_HALF_Z = FLOOR_ROWS * tileSize / 2;
    const SKIRT_EXT = 5;
    const skirts = [];
    const addSkirt = (width, depth, x, z) => {
      const skirt = new Mesh(new BoxGeometry(width, tileSize, depth), floor.material);
      skirt.position.set(x, 0, z);
      floorGroup.add(skirt);
      skirts.push(skirt);
    };
    addSkirt(SKIRT_EXT, 2 * FLOOR_HALF_Z, FLOOR_HALF_X + SKIRT_EXT / 2, 0);
    addSkirt(SKIRT_EXT, 2 * FLOOR_HALF_Z, -FLOOR_HALF_X - SKIRT_EXT / 2, 0);
    addSkirt(2 * FLOOR_HALF_X + 2 * SKIRT_EXT, SKIRT_EXT, 0, FLOOR_HALF_Z + SKIRT_EXT / 2);
    addSkirt(2 * FLOOR_HALF_X + 2 * SKIRT_EXT, SKIRT_EXT, 0, -FLOOR_HALF_Z - SKIRT_EXT / 2);
    scene.add(floorGroup);

    const cube = new Mesh(
      new BoxGeometry(tileSize, tileSize, tileSize),
      new MeshStandardMaterial({ color: '#22c55e', roughness: 0.4, metalness: 0.1 }),
    );
    scene.add(cube);

    const ambient = new AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const keyLight = new DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(100, 200, 300);
    scene.add(keyLight);
    const rimLight = new DirectionalLight(0x86efac, 0.6);
    rimLight.position.set(-200, -50, 150);
    scene.add(rimLight);

    const camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 100);
    const cameraRig = new Group();
    cameraRig.add(camera);
    scene.add(cameraRig);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const handleResize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const letters = LETTER_IDS.map(id => meshes[id]).filter(Boolean);
    const dot = meshes['i-dot'];
    const bottomOrigin = (m) => `0 ${-m.userData.halfHeight} 0`;
    const dotRestX = dot ? dot.position.x : 0;

    letters.forEach(m => utils.set(m, {
      skewX: -ITALIC_SKEW,
      transformOrigin: bottomOrigin(m),
    }));

    const jsLetters = [...JS_IDS, ...THREED_IDS].map(id => meshes[id]).filter(Boolean);
    const refKeyMesh = meshes['k'] || meshes['a2'] || letters[letters.length - 1];
    const jsBaselineShift = refKeyMesh ? 1.9 - refKeyMesh.position.y : 0;
    jsLetters.forEach(m => utils.set(m, {
      y: m.position.y + jsBaselineShift,
      z: 6.5,
      rotateX: 20,
      transformOrigin: bottomOrigin(m),
    }));

    if (dot) {
      utils.set(dot, {
        x: dotRestX - .045,
        y: 15,
        scaleY: 0,
        transformOrigin: bottomOrigin(dot),
      });
    }

    utils.set(camera, {
      x: 0,
      y: 5.64,
      z: 20.66,
      rotateX: -14.73,
      fov: 60,
      zoom: 1,
      near: 1,
      far: 2000,
    });

    const DEG2RAD = Math.PI / 180;
    const FLATTEN_BASE_FOV = camera.fov;
    const FLATTEN_DIST_NUM = camera.position.z * Math.tan(FLATTEN_BASE_FOV * 0.5 * DEG2RAD);
    const flattenDezoom = { value: 1 };

    const renderTimer = createTimer({
      priority: 0,
      onUpdate: () => {
        camera.position.z = FLATTEN_DIST_NUM * flattenDezoom.value / Math.tan(camera.fov * 0.5 * DEG2RAD);
        renderer.render(scene, camera);
      },
    });

    utils.set(skyMaterial, {
      topColor: '#0f291a',
      bottomColor: '#1a3d28',
      offset: -38,
      exponent: 1.15,
    });

    utils.set(ambient, {
      intensity: 0.6,
    });

    utils.set(keyLight, {
      intensity: 1.6,
      color: '#ffffff',
      x: 0,
      y: 30,
      z: 0,
    });

    utils.set(rimLight, {
      intensity: 0.6,
      color: '#86efac',
      x: -200,
      y: -50,
      z: 150,
    });

    utils.set(tiles, {
      x: stagger(1, { grid: true, from: 'center', axis: 'x' }),
      z: stagger(1, { grid: true, from: 'center', axis: 'z' }),
      y: 0,
    });

    utils.set(floor, {
      color: '#152b1e',
    });

    utils.set(cube, {
      x: 0,
      y: 0,
      z: 0,
      transformOriginY: -0.5,
    });

    utils.set(logoGroup, {
      x: -10.922,
      y: -0.31,
      z: -0.5,
    });

    const centerTile = tiles[Math.floor(FLOOR_ROWS / 2) * FLOOR_COLS + Math.floor(FLOOR_COLS / 2)];

    const EXPLODE_RADIUS = 10;
    const tileRingDistance = (i) => Math.hypot(
      (i % FLOOR_COLS) - Math.floor(FLOOR_COLS / 2),
      Math.floor(i / FLOOR_COLS) - Math.floor(FLOOR_ROWS / 2),
    );
    const getCenterTiles = (radius) => tiles.filter((tile, i) => tileRingDistance(i) <= radius);
    const getOuterTiles = (radius) => tiles.filter((tile, i) => tileRingDistance(i) > radius);

    const explodeDurX = utils.createSeededRandom(4, 800, 1279);
    const explodeDurZ = utils.createSeededRandom(0, 800, 1279);
    const explodeDurY = utils.createSeededRandom(7, 800, 1279);
    const explodeRotX = utils.createSeededRandom(7, -1080, 1080);
    const explodeRotY = utils.createSeededRandom(13, -1080, 1080);
    const explodeRotZ = utils.createSeededRandom(21, -1080, 1080);
    const explodeScaleDur = utils.createSeededRandom(0, 500, 1200);
    const burstRotX = utils.createSeededRandom(10, -540, 540);
    const burstRotY = utils.createSeededRandom(7, -540, 540);
    const burstRotZ = utils.createSeededRandom(12, -540, 540);

    const shake = (amp, cycles, { decay = 1, sweep = 0, settle = 0, dir = 1, center = 0 } = {}) =>
      t => center + dir * (settle + (amp - settle) * Math.pow(1 - t, decay)) * Math.sin(cycles * (t + sweep * t * t) * 2 * Math.PI);

    const lateShake = (amp, cycles, start, opts = {}) => {
      const inner = shake(amp, cycles, opts);
      return t => t < start ? 0 : inner((t - start) / (1 - start));
    };

    const tl = createTimeline({
      id: 'NavaKrishi 3D logo',
      autoplay: false,
      onComplete: () => {
        handleSkip();
      }
    })
      .add(renderer.domElement, {
        id: 'fade in',
        opacity: [0, 1],
        duration: 1300, ease: 'inOut(2)',
      }, 0)
      .add(camera, {
        id: 'camera follow',
        rotateX: [
          { to: 38, duration: 700, ease: 'inOut(2)' },
          { to: 41, duration: 500, delay: 0, ease: 'inOutSine' },
          { to: 40.5, duration: 200, delay: 0, ease: 'inOutSine' },
          { to: 36, duration: 180, delay: 0, ease: 'in(2)' },
          { to: 24, duration: 80, delay: 0, ease: 'in(2)' },
          { to: -10, duration: 40, delay: 0, ease: 'in(1.5)' },
          { to: -16.5, duration: 90, delay: 20, ease: 'out(2)' },
          { to: -14.73, duration: 190, delay: 0, ease: 'inOutSine' },
        ],
        y: [
          { to: 6.3, duration: 900, ease: 'inOut(2)' },
          { to: 6.4, duration: 500, delay: 0, ease: 'inOutSine' },
          { to: 6.15, duration: 180, delay: 0, ease: 'in(2)' },
          { to: 5.04, duration: 120, delay: 0, ease: 'in(2)' },
        ],
      }, 300)
      .add(cube, {
        id: 'cube enter',
        y: [
          { from: 24, to: 1, duration: 300, delay: 1700, ease: 'in(5.0825)' },
          { from: 0, to: 0.138, duration: 60, delay: 0, ease: cubicBezier(0, 1.1575, 0.5712, 0.9605) },
          { to: -0.75, duration: 1040, ease: cubicBezier(0, 1.1575, 0.5712, 0.9605) },
          { from: -1.75, to: -2.5, duration: 146, delay: 0, ease: 'out(9.8523)' },
        ],
        scaleX: [
          { from: 0, to: 1, duration: 2000, delay: 0 },
          { from: 1.3, to: 1, duration: 100, ease: 'out(2)' },
        ],
        scaleY: [
          { from: 5, to: 2, duration: 2000, delay: 0 },
          { to: 1.25, duration: 200, delay: 0, ease: cubicBezier(0.1, 0.7, 0.5763, 0.7728) },
          { to: 1, duration: 900, delay: 0, ease: cubicBezier(0.1, 0.7, 0.5763, 0.7728) },
        ],
        scaleZ: [
          { from: 0, to: 1, duration: 2000 },
          { from: 1.3, to: 1, duration: 100, ease: 'out(2)' },
        ],
        ease: 'in(2.4146)',
        skewX: { from: 0, to: 1, duration: 1143, delay: 2000, ease: 'linear', modifier: shake(8, 18, { decay: 2 }) },
        skewZ: { from: 0, to: 1, duration: 1143, delay: 2000, ease: 'linear', modifier: shake(8, 18, { decay: 2 }) },
      }, 0)
      .set(centerTile, { scale: 0 }, 2000)
      .add(tiles, {
        id: 'floor crash',
        y: [
          { from: 0, to: stagger([0.15, 0], { from: 'center', ease: linear('0', '0.185 70.69%', '0.4644 84.63%', '0.7852 95.62%', '1'), grid: true }), duration: 50, delay: stagger([0, 451], { from: 'center', ease: 'in(2.5507)', grid: true }), ease: cubicBezier(0.5621, 0.9568, 0.5, 1) },
          { to: stagger([-1.5, 0], { from: 'center', ease: linear('0', '0.2812 12.72%', '0.5478 20.84%', '1 41.29%', '1'), grid: true, jitter: [0.102, 0], seed: 0 }), duration: 1050, delay: 0, ease: cubicBezier(0, 0.8, 0, 1.0128) },
          { to: stagger([-3, 0], { from: 'center', ease: linear('0', '0 14.17%', '0.5317 25.26%', '0.8904 47.35%', '1 47.8%', '1'), grid: true, jitter: [0.3, 0], seed: 0 }), duration: stagger([0, 656], { from: 'center', ease: linear('0', '0.0368 14.54%', '0.3042 62.23%', '1 62.24%', '1'), grid: true, jitter: [50, 0], seed: 0 }), delay: 0, ease: cubicBezier(0, 1.0807, 0.3512, 1.2537) },
        ],
        rotateX: { to: stagger([0, 0], { from: 'center', ease: linear('0', '0 13.93%', '0.2419 40.77%', '1 55.03%', '1'), grid: true, jitter: [20, 0], seed: 6 }), duration: 1200, delay: 0 },
        rotateY: { to: stagger([0, 0], { from: 'center', ease: linear('0', '0 13.93%', '0.2419 40.77%', '1 55.03%', '1'), grid: true, jitter: [20, 0], seed: 12 }), duration: 1260, delay: 0 },
        rotateZ: { to: stagger([0, 0], { from: 'center', ease: linear('0', '0 13.93%', '0.2419 40.77%', '1 55.03%', '1'), grid: true, jitter: [20, 0], seed: 3 }), duration: 1200, delay: 50 },
      }, 2000)
      .add(camera, {
        id: 'camera shake',
        y: { from: 0, to: 1, duration: 1412, ease: 'linear', modifier: t => shake(0.12, 15, { decay: 2, center: 5.64 })(t) + lateShake(0.97, 2, 0.78, { decay: 1.6 })(t) },
        rotateZ: { from: 0, to: 1, duration: 1437, ease: 'linear', modifier: t => shake(0.42, 10, { decay: 1.8 })(t) + lateShake(0.42, 2, 0.79, { decay: 1.4 })(t) },
        ease: 'inOutSine',
      }, 2000)
      .add(cube, {
        id: 'cube recover',
        skewX: [
          { to: -9, duration: 58, ease: cubicBezier(0.3815, 0.0684, 0.5, 1) },
          { to: 7, duration: 63, delay: 0, ease: cubicBezier(0.3815, 0.0684, 0.5, 1) },
          { to: -5, duration: 71, delay: 0, ease: cubicBezier(0.3815, 0.0684, 0.5, 1) },
          { to: 3.5, duration: 77, delay: 0, ease: cubicBezier(0.3815, 0.0684, 0.5, 1) },
          { to: -2, duration: 82, delay: 0, ease: cubicBezier(0.3815, 0.0684, 0.5, 1) },
          { to: 1, duration: 90, delay: 0, ease: cubicBezier(0.3815, 0.0684, 0.5, 1) },
          { to: -0.5, duration: 96, delay: 0, ease: cubicBezier(0.3815, 0.0684, 0.5, 1) },
          { to: 0, duration: 83, delay: 0, ease: cubicBezier(0.3815, 0.0684, 0.5, 1) },
        ],
        scaleY: [
          { to: 0.8, duration: 77, ease: 'out(3)' },
          { to: 1.12, duration: 102, delay: 0, ease: 'inOutSine' },
          { to: 0.94, duration: 109, delay: 0, ease: 'inOutSine' },
          { to: 1.05, duration: 115, delay: 0, ease: 'inOutSine' },
          { to: 0.98, duration: 109, delay: 0, ease: 'inOutSine' },
          { to: 0.97, duration: 108, delay: 0, ease: 'inOutSine' },
        ],
        scaleX: [
          { to: 1.15, duration: 77, ease: 'out(3)' },
          { to: 0.93, duration: 102, delay: 0, ease: 'inOutSine' },
          { to: 1.04, duration: 109, delay: 0, ease: 'inOutSine' },
          { to: 0.97, duration: 115, delay: 0, ease: 'inOutSine' },
          { to: 1.01, duration: 109, delay: 0, ease: 'inOutSine' },
          { to: 1.02, duration: 108, delay: 0, ease: 'inOutSine' },
        ],
        scaleZ: [
          { to: 1.15, duration: 77, ease: 'out(3)' },
          { to: 0.93, duration: 102, delay: 0, ease: 'inOutSine' },
          { to: 1.04, duration: 109, delay: 0, ease: 'inOutSine' },
          { to: 0.97, duration: 115, delay: 0, ease: 'inOutSine' },
          { to: 1.01, duration: 109, delay: 0, ease: 'inOutSine' },
          { to: 1.02, duration: 108, delay: 0, ease: 'inOutSine' },
        ],
        y: [
          { to: -2.56, duration: 77, ease: 'out(3)' },
          { to: -2.47, duration: 128, delay: 0, ease: 'inOutSine' },
          { to: -2.52, duration: 140, delay: 0, ease: 'inOutSine' },
          { to: -2.53, duration: 275, delay: 0, ease: 'inOutSine' },
        ],
      }, 3230)
      .add(cube, {
        id: 'cube expand',
        scaleY: { to: 4, duration: 4150, delay: 800, ease: cubicBezier(0.2423, -0.0053, 0.3107, 0.5533) },
        scaleX: { to: 0.8, duration: 4150, delay: 800, ease: cubicBezier(0.2423, -0.0053, 0.3107, 0.5533) },
        scaleZ: { to: 0.8, duration: 4150, delay: 800, ease: cubicBezier(0.2423, -0.0053, 0.3107, 0.5533) },
        y: { to: 0.75, duration: 4150, delay: 800, ease: cubicBezier(0.2423, -0.0053, 0.3107, 0.5533) },
        skewX: { from: 0, to: 1, duration: 4150, delay: 800, ease: 'linear', modifier: shake(9.5, 21, { decay: 1.5, sweep: 1.2, settle: 3.1 }) },
        skewZ: { from: 0, to: 1, duration: 4150, delay: 800, ease: 'linear', modifier: shake(4.3, 18, { decay: 0.7, sweep: 1.4, dir: -1 }) },
      }, 3050)
      .add(getCenterTiles(8), {
        id: 'floor expand',
        y: [
          { to: stagger([-3.5, -0.82], { from: 'center', ease: linear('0', '0.0878 0.01%', '0.3904 50.14%', '0.7766 68.95%', '1'), grid: true, jitter: [0.3, 0], seed: 0 }), duration: 260, delay: 0, ease: 'out(3)' },
          { to: stagger([1.4, -0.72], { from: 'center', ease: linear('0', '0 28.61%', '0.27 28.62%', '0.7766 68.95%', '1'), grid: true, jitter: [0.3, 0], seed: 0 }), duration: 4100, delay: 440, ease: cubicBezier(0.2423, -0.0053, 0.367, 0.5896) },
        ],
      }, 3200)
      .label('POP', 8000)
      .label('slowmo start', 'POP-=0')
      .label('slowmo end', 'POP+=500')
      .add(camera, {
        id: 'camera zoom in',
        zoom: { to: 2, duration: 5500, delay: 0, ease: cubicBezier(0.6985, 0.1061, 0.5527, 0.7364) },
      }, 2500)
      .add(cameraRig, {
        id: 'camera orbit',
        rotateY: [
          { from: -270, to: -180, duration: 3600, delay: 0 },
          { to: 0, duration: 700, delay: 1000, ease: cubicBezier(0.375, -0.0148, 0, 1.0101) },
        ],
        rotateX: { to: 0, duration: 1900, delay: 2700 },
        y: [
          { to: 0, duration: 1900, delay: 2700 },
          { to: 0, duration: 300, delay: 0, ease: 'out(2)' },
        ],
        ease: 'inOut(2)',
      }, 3400)
      .add(getCenterTiles(EXPLODE_RADIUS), {
        id: 'floor explode',
        x: { to: stagger([1, 40], { from: 'center', grid: true, axis: 'x', jitter: 5, seed: 0 }), duration: () => explodeDurX(), delay: stagger([0, 137], { from: 'center', grid: true }), ease: 'out(5.3605)' },
        z: { to: stagger([1, 40], { from: 'center', grid: true, axis: 'z' }), duration: () => explodeDurZ(), delay: stagger([0, 137], { from: 'center', grid: true, jitter: 5, seed: 0 }), ease: 'out(5.3605)' },
        y: { to: stagger([40, 1], { from: 'center', ease: cubicBezier(0.3326, 0.0289, 0.9886, 0.4057), grid: true, jitter: 5, seed: 0 }), duration: () => explodeDurY(), delay: stagger([0, 137], { from: 'center', grid: true }), ease: 'out(5.3605)' },
        rotateX: { to: () => explodeRotX(), duration: 815, delay: stagger([0, 314], { from: 'center', grid: true }), ease: 'out(2)' },
        rotateY: { to: () => explodeRotY(), duration: 815, delay: stagger([0, 314], { from: 'center', grid: true }), ease: 'out(2)' },
        rotateZ: { to: () => explodeRotZ(), duration: 815, delay: stagger([0, 314], { from: 'center', grid: true }), ease: 'out(2)' },
        scale: { to: 0, duration: () => explodeScaleDur(), delay: stagger([0, 314], { from: 'center', grid: true }), ease: 'out(2.8731)' },
        duration: 113,
        delay: stagger([0, 210], { from: 'center', grid: true, seed: 0 }),
        ease: 'linear',
      }, 'POP-=15')
      .add([...getOuterTiles(EXPLODE_RADIUS), ...skirts], {
        id: 'floor drop',
        y: { to: -50, duration: 604, delay: 146, ease: cubicBezier(0.8109, 0.0308, 0.9152, 0.5479) },
      }, 'POP-=150')
      .add(letters, {
        id: 'letters pop',
        y: [
          { from: -0.39, to: 3.23, duration: 240, ease: cubicBezier(0.225, 1, 0.915, 0.98) },
          { to: 1.9, duration: 120, delay: 20, ease: 'inQuad' },
          { to: 1.9, duration: 120, delay: 0, ease: 'outQuad' },
        ],
        scaleX: [
          { to: [0.25, 0.85], duration: 240, ease: 'outQuad' },
          { to: 1.08, duration: 120, delay: 85, ease: 'inOutSine' },
          { to: 1, duration: 260, delay: 25, ease: 'outQuad' },
        ],
        scaleY: [
          { to: [0.4, 1.5], duration: 120, ease: 'outSine' },
          { to: 0.6, duration: 120, delay: 180, ease: 'inOutSine' },
          { to: 1.2, duration: 180, delay: 25, ease: 'outQuad' },
          { to: 1, duration: 190, delay: 15, ease: 'outQuad' },
        ],
        duration: 400,
        ease: 'outSine',
        delay: stagger(60, { from: 'center' }),
      }, 'POP')
      .add(cube, {
        id: 'cube dot pop',
        y: [
          { from: 0.75, to: 16.9, duration: 240, delay: 0, ease: cubicBezier(0.225, 1, 0.915, 0.98) },
          { to: 7.58, duration: 180, delay: 120, ease: 'inQuad' },
          { to: 11.7, duration: 250, delay: 0, ease: cubicBezier(0.225, 1, 0.915, 0.98) },
          { to: 9.11, duration: 170, delay: 20, ease: 'inQuad' },
          { to: 9.5, duration: 120, delay: 0, ease: 'outQuad' },
        ],
        scaleX: { to: [0.8, 1], duration: 260, delay: 0, ease: 'outQuad' },
        scaleY: { from: 4, to: 1, duration: 120, delay: 0, ease: 'outQuad' },
        scaleZ: { to: [0.8, 1], duration: 260, delay: 0, ease: 'outQuad' },
        transformOriginY: { to: 0, duration: 150, delay: 0, ease: 'out(2)' },
        rotateZ: [
          { to: -540, duration: 480, delay: 20, ease: cubicBezier(0.7865, 0.9809, 0.8395, 0.9559) },
          { to: -720, duration: 540, delay: 160, ease: 'outSine' },
        ],
        skewX: { to: 0, duration: 180, delay: 0, ease: 'out(2)' },
        skewZ: { to: 0, duration: 180, delay: 0, ease: 'out(2)' },
        ease: 'outSine',
      }, 'POP')
      .add(wrapper, {
        id: 'logo punch',
        scale: { from: 1.25, to: 1, duration: 600, delay: 0 },
        y: { from: -5.28, to: 0, duration: 600, delay: 0 },
        duration: 900,
        ease: 'outExpo',
      }, 'POP')
      .add(meshes['i-bar'] || letters[0], {
        id: 'i squish',
        scaleY: [
          { to: 0.25, duration: 150, delay: 0, ease: 'outExpo' },
          { to: 1, duration: 700, delay: 0, ease: 'outElastic(2.11, 0.61)' },
        ],
        scaleX: [
          { to: 1.5, duration: 50, delay: 0, ease: 'outSine' },
          { to: 1, duration: 900, delay: 0, ease: 'outElastic(2.11, 0.61)' },
        ],
      }, 'POP+=380')
      .add(camera, {
        id: 'camera pop',
        y: { to: 7, duration: 1100, ease: 'out(4.9225)' },
        rotateX: [
          { to: 9.1, duration: 260, ease: 'out(3.2713)' },
          { to: 0, duration: 700, ease: 'out(3)', delay: 140 },
        ],
        zoom: { to: 1, duration: 400, ease: 'out(3)' },
      }, 'POP')
      .add(letters, {
        id: 'letters skew',
        skewX: 0,
        duration: 1350,
        ease: 'outElastic(1.1, .9)',
      }, 'POP+=1050')
      .add(cube, {
        id: 'cube sweep',
        x: { to: 16.4, duration: 1350 },
        skewX: { to: 8, duration: 1350 },
        duration: 1450,
        ease: 'outElastic(1.1,1.7)',
      }, 'POP+=1050')
      .add(jsLetters, {
        id: 'js plug',
        z: { from: -2, to: 0.12825, duration: 1295 },
        rotateX: { from: -120, to: 0, duration: 1295 },
        delay: stagger(50),
        ease: 'outElastic(1.1, .9)',
        scale: { from: 0, to: 1, duration: 549 },
      }, 'POP+=1055')
      .add(logoGroup, {
        id: 'logo recenter',
        x: { to: '-=8.7', duration: 1350, ease: 'outElastic(1.1, .9)' },
        duration: 1250,
        ease: 'inOutQuint',
      }, 'POP+=1050')
      .add(camera, {
        id: 'camera flatten',
        fov: { to: 2, duration: 700, ease: 'out(2)' },
      }, 'POP+=1450')
      .add(flattenDezoom, {
        id: 'camera dezoom',
        value: { to: 1.5, duration: 1125, delay: 0 },
        duration: 1150, ease: 'out(2)',
      }, 'POP+=1050')
      .add(skyMaterial, {
        id: 'sky to bg',
        topColor: BG, bottomColor: BG,
        duration: 465, ease: 'inOut(4.348)',
      }, 'POP+=1500')
      .add(ambient, {
        id: 'ambient up',
        intensity: [{ to: 3, duration: 300 }, { to: 1, duration: 700, delay: 1050 }],
        duration: 240, ease: 'inOut(1.8042)',
      }, 'POP+=1650')
      .add(camera, {
        id: 'outro depth',
        fov: 35,
        duration: 1500, ease: 'out(2)',
      }, 11000)
      .add([...letters, ...jsLetters, cube], {
        id: 'outro burst',
        z: 62.1,
        y: 0.5,
        rotateX: () => burstRotX(),
        rotateY: () => burstRotY(),
        rotateZ: () => burstRotZ(),
        delay: stagger(100, { from: 'last', ease: 'in(2.3145)' }),
        duration: 1140, ease: 'in(2)',
      }, 10960)
      .init();

    const player = animate(tl, {
      id: 'Player',
      currentTime: [
        { to: () => tl.labels['slowmo start'], duration: () => tl.labels['slowmo start'], ease: cubicBezier(1, 0.7, 1, 0.85) },
        { to: () => tl.labels['slowmo end'], duration: 2000, ease: cubicBezier(0.0314, 0.3616, 0.8994, -0.2122) },
        { to: () => tl.duration, duration: () => tl.duration - tl.labels['slowmo end'] }
      ],
      duration: tl.duration,
      loop: false,
      ease: 'linear',
      onComplete: () => {
        handleSkip();
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      try {
        renderTimer.pause();
        player.pause();
        tl.pause();
      } catch (e) { }
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#050c07] overflow-hidden transition-opacity duration-700 ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Overlay UI: Header and Skip Controls */}
      <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
        <img src="/NK_logo.png" alt="NavaKrishi Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
        <div>
          <h1 className="text-white font-bold text-sm tracking-widest uppercase font-['Devil_Breeze']">NAVAKRISHI</h1>
          <p className="text-emerald-400 text-[10px] tracking-widest uppercase font-mono">AI FARMING PLATFORM</p>
        </div>
      </div>

      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 z-10 px-6 py-2.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono tracking-widest uppercase backdrop-blur-md transition-all duration-300 hover:bg-emerald-800/80 hover:border-emerald-400 hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer"
      >
        SKIP INTRO ➔
      </button>
    </div>
  );
};

export default WelcomeSplash;