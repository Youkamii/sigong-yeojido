// app/engine.js — 렌더러 · 직교 카메라 · 라이팅 리그 · PMREM 환경 · 후처리 · 조작 · 루프 · 피킹
//
// 정본: docs/03-art-bible.md §1.4(라이팅 리그) §1.5(톤매핑) §5(성능 예산) P12(후처리)
//        docs/02-contracts.md §7(기술 계약) · 대개편 R6(원근·초점 제거)/R7(조작 계약)
// 외부 요청 0 — 벤더 상대경로만 쓴다. 환경맵은 외부 HDR 이 아니라 **절차 하늘을 구워서** 만든다.
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { EffectComposer } from '../vendor/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/postprocessing/RenderPass.js';
import { SSAOPass } from '../vendor/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from '../vendor/postprocessing/UnrealBloomPass.js';
import { FilmPass } from '../vendor/postprocessing/FilmPass.js';
import { SMAAPass } from '../vendor/postprocessing/SMAAPass.js';
import { OutputPass } from '../vendor/postprocessing/OutputPass.js';
import { clamp, easeInOutCubic } from './util.js';
import { U, timePreset, fanDepthMaterial } from './style.js';
import { setTransmissionEnabled } from './materials.js';
import {
  CAMERA, FOG, LIGHT, KEY_DIR, RIM_DIR, SKY, POST, POST_ORDER,
  QUALITY, QUALITY_ORDER, AUTO_QUALITY, hexNum,
} from './artbible.js';

/** 토큰(hex 문자열) → THREE.Color. artbible 은 three 에 의존하지 않으므로 여기서 변환한다. */
const col = (hex) => new THREE.Color(hex);

/* ── 직교 카메라 (R6 원근감 제거) ─────────────────────────────────────────
 * 화면 배율은 zoom 하나로 정해지고, zoom 은 카메라~목표 **거리**에서 매 프레임 유도한다
 * (_syncOrthoZoom). 거리→배율 관계가 원근 시절(FOV 42°)과 같아서 flyTo · 지도 편집기 고도 ·
 * 라벨 LOD/스케일 · 포인트 스프라이트(1/-mv.z) 같은 거리 기반 코드가 의미 그대로 동작한다. */
const ORTHO_HALF_H = 120;                                          // zoom 1 기준 절두체 반높이
const ORTHO_REF = ORTHO_HALF_H / Math.tan((CAMERA.FOV * Math.PI) / 360);   // zoom = REF / 거리

/* ── 조작 계약 (R7) ── */
const DRAG_PX = 5;                                  // 클릭/드래그 판정 임계 (px)
// ── WASD 비행 물리 (표준 플라이캠 관례: 가속 → 관성 → 감쇠. Unity 씬뷰류) ──
const FLY_SPEED = 0.75;                             // W·S 목표 속도 — 초당 (누른 순간 시선 거리 × 이 값), 나는 동안 고정
const STRAFE_SPEED = 0.55;                          // A·D 목표 속도 — 초당 (누른 순간 시선 거리 × 이 값)
const FLY_ACCEL = 9;                                // 가속 지수(1/s) — 누르면 ~0.25초에 제 속도
const FLY_DAMP = 6;                                 // 감쇠 지수(1/s) — 떼면 미끄러지다 ~0.5초에 정지
const FLY_SPRINT = 3;                               // Shift — 표준 관례(3~4배)
const FLY_STOP = 0.4;                               // 이 속도(units/s) 아래는 정지로 본다
const TILT_GUARD = 0.342;                           // cos(70°) — 시선이 이보다 수평이면 지면 교차가 발산한다 (OrbitControls TILT_LIMIT 관례)
const KEYPAN_RIM = 1.6;                             // 섬 반경의 이 배까지만 — 허공으로 튕겨나가지 않게
const PAN_KEYS = { KeyW: 1, KeyA: 1, KeyS: 1, KeyD: 1, ShiftLeft: 1, ShiftRight: 1 };

export class Engine {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,                 // SMAAPass 가 담당한다 (MSAA 와 중복 비용 회피)
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.quality = 'medium';                        // 기본 프리셋은 중 (§T6)
    this._qualityLocked = false;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.pixelRatio = Math.min(this.devicePixelRatio, QUALITY.medium.pixelRatio);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);

    // §1.5 톤매핑 — ACES · exposure 1.05 · sRGB 출력
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = CAMERA.EXPOSURE;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(hexNum(SKY.CLEAR), 1);

    // 그림자 — PCFSoft 2048, 캐스터는 KEY 하나뿐 (§1.4)
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;

    container.appendChild(this.renderer.domElement);

    const aspect = this._aspect();
    this.camera = new THREE.OrthographicCamera(
      -ORTHO_HALF_H * aspect, ORTHO_HALF_H * aspect, ORTHO_HALF_H, -ORTHO_HALF_H,
      CAMERA.NEAR, CAMERA.FAR);
    this.camera.position.set(178, 132, 226);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 16, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.062;
    this.controls.rotateSpeed = 0.62;
    this.controls.minDistance = 46;
    this.controls.maxDistance = 940;
    this.controls.maxPolarAngle = Math.PI * 0.93;      // 아래에서 역원뿔 암반을 올려다볼 수 있게
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.28;
    // R7 조작 계약 — 좌끌기 = 이동(팬), 우끌기 = 회전, 휠 = 확대/축소.
    // 팬은 OrbitControls 가 아니라 우리가 지면 붙잡기로 직접 한다(_bindEvents) —
    // OrbitControls 팬은 화면 추종이 0.6×/|시선기울기|× 로 깎여 커서 밑의 땅이 미끄러진다.
    this.controls.enablePan = false;
    this.controls.mouseButtons = {
      LEFT: -1, MIDDLE: THREE.MOUSE.ROTATE, RIGHT: THREE.MOUSE.ROTATE,
    };
    // 휠 줌은 OrbitControls 의 ortho zoom(거리와 분리)이 아니라 **거리 돌리**로 처리한다
    // (_bindEvents 의 wheel) — zoom 은 거리에서 유도되므로 거리 하나만 움직이면 된다.
    this.controls.enableZoom = false;
    this.controls.update();

    // stats 는 _buildComposer 안의 setQuality 보다 먼저 있어야 한다
    this.stats = { calls: 0, triangles: 0, sceneCalls: 0, sceneTriangles: 0, fps: 0, quality: this.quality };
    this._frameSamples = [];
    this._autoDone = false;
    this._autoStart = 0;
    this._frameIndex = 0;
    this._adaptSamples = [];
    this._adaptStart = 0;
    // pixelRatio 를 보는 컴포넌트들(파티클 uPix). 품질 강등이 여기까지 전달되어야
    // 백버퍼가 작아진 만큼 포인트 스프라이트도 같이 작아진다.
    this._prWatchers = [];
    this._materializing = false;

    this._buildLights();
    this._buildComposer();
    this.bakeEnvironment(null);        // 데이터 로드 전에도 PBR 반사가 살아 있게 기본 하늘을 굽는다

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pickTargets = [];
    this.instanceResolver = null;
    this.pickFilter = null;          // 지금 연대에 없는 것은 집히지 않는다 (setPickFilter)
    this.onPick = null;
    this.onHover = null;
    this.fly = null;
    this.sunDir = new THREE.Vector3(KEY_DIR[0], KEY_DIR[1], KEY_DIR[2]);

    // 안개 짙기 0~100 (50 = 배율 1.0 = 기존 값) — setFogLevel 이 Fog near/far 에 factor 를 곱한다
    this._fogLevel = 50;
    this._fogFactor = 1.0;

    // WASD 팬 상태 — window blur 시 전부 해제한다 (키가 눌린 채 남는 사고 방지)
    this._keys = Object.create(null);
    this._panFwd = new THREE.Vector3();
    this._panLimit = 0;                 // frameWorld 가 섬 반경에서 정한다
    this._flyVel = { f: 0, s: 0 };      // 비행 속도(units/s) — 전진·옆걸음. 가속·관성이 산다
    this._flyBase = 0;                  // 속도 기준 거리 — 키를 누른 순간 한 번 재고, 나는 동안 고정 (D5)
    this._flyHeld = false;              // 직전 프레임에 W/S/A/D 가 눌려 있었나 — "새로 누름" 판정용
    this._grab = null;                  // 좌드래그 팬 — 붙잡은 지면점 {x,z} (커서 밑의 땅이 따라온다)
    this._wheelOffset = new THREE.Vector3();

    this._syncOrthoZoom();
    this._bindEvents();
    this._exposeQualityAPI();

    // 저장된 품질이 있으면 그걸로 시작 — 재방문은 첫 5초 측정(그 사이의 끊김)을 건너뛴다.
    // 수동 선택은 잠금까지 복원하고, 자동 판정 결과는 시작점만 복원한 뒤 상시 적응은 계속 돈다.
    const saved = this._loadQualityPref();
    if (saved && QUALITY[saved.name]) {
      this.setQuality(saved.name, { manual: !!saved.manual, persist: false });
      this._autoDone = true;
    }
  }

  _aspect() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    return w / Math.max(1, h);
  }

  /* ═════════════════════ 라이팅 리그 (§1.4 — 4개 고정) ═════════════════════ */

  _buildLights() {
    const K = LIGHT.KEY;

    // KEY — 태양. 고도 38° 방위 -35°. 그림자 캐스터는 이것 하나뿐.
    this.key = new THREE.DirectionalLight(col(K.color), K.intensity);
    this.key.position.set(KEY_DIR[0] * K.distance, KEY_DIR[1] * K.distance, KEY_DIR[2] * K.distance);
    this.key.castShadow = true;
    const sh = this.key.shadow;
    sh.mapSize.set(K.shadow.mapSize, K.shadow.mapSize);
    sh.camera.near = K.shadow.near;
    sh.camera.far = K.shadow.far;
    sh.camera.left = -K.shadow.halfExtent;
    sh.camera.right = K.shadow.halfExtent;
    sh.camera.top = K.shadow.halfExtent;
    sh.camera.bottom = -K.shadow.halfExtent;
    sh.bias = K.shadow.bias;
    sh.normalBias = K.shadow.normalBias;
    sh.radius = K.shadow.radius;
    sh.camera.updateProjectionMatrix();
    this.scene.add(this.key);
    this.scene.add(this.key.target);

    // FILL — 반구광. KEY 의 0.35 이하.
    this.fill = new THREE.HemisphereLight(
      col(LIGHT.FILL.skyColor), col(LIGHT.FILL.groundColor), K.intensity * LIGHT.FILL.ratioOfKey);
    this.scene.add(this.fill);

    // RIM — KEY 반대편 후방. 실루엣 분리 전용, 그림자 없음.
    this.rim = new THREE.DirectionalLight(col(LIGHT.RIM.color), LIGHT.RIM.intensity);
    this.rim.position.set(RIM_DIR[0] * LIGHT.RIM.distance, RIM_DIR[1] * LIGHT.RIM.distance, RIM_DIR[2] * LIGHT.RIM.distance);
    this.rim.castShadow = false;
    this.scene.add(this.rim);
    this.scene.add(this.rim.target);

    // 광원은 위 3개 + ENV 뿐이다. PointLight 살포 금지 (§1.4).
  }

  /* ═════════════════════ ENV — 절차 하늘을 PMREM 으로 굽는다 ═════════════════════ */

  /**
   * 외부 HDR 파일 금지(§1.4) — 그라디언트 돔 + 태양 원반을 씬으로 만들어 PMREM 에 굽는다.
   * 모든 PBR 재질의 반사·간접광이 여기서 나온다.
   */
  bakeEnvironment(mood) {
    const E = LIGHT.ENV;
    const top = (mood && mood.skyTop) || SKY.TOP;
    const horizon = (mood && mood.skyHorizon) || SKY.HORIZON;
    const sun = (mood && mood.sunColor) || SKY.SUN;

    const skyScene = new THREE.Scene();
    const geo = new THREE.SphereGeometry(E.domeRadius, 32, 20);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: col(top) },
        uHorizon: { value: col(horizon) },
        uGround: { value: col(SKY.GROUND) },
        uSun: { value: col(sun) },
        uSunDir: { value: new THREE.Vector3(KEY_DIR[0], KEY_DIR[1], KEY_DIR[2]) },
        uSunGain: { value: E.sunGain },
        uSunSize: { value: E.sunAngularSize },
        uHorizonGain: { value: E.horizonGain },
        uHaloGain: { value: E.haloGain },
      },
      vertexShader: /* glsl */`
        varying vec3 vDir;
        void main(){
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uTop, uHorizon, uGround, uSun, uSunDir;
        uniform float uSunGain, uSunSize, uHorizonGain, uHaloGain;
        varying vec3 vDir;
        void main(){
          vec3 d = normalize(vDir);
          float up = smoothstep(-0.05, 0.55, d.y);
          vec3 c = mix(uHorizon, uTop, up);
          c = mix(uGround, c, smoothstep(-0.35, 0.02, d.y));         // 지면 반사 성분
          c += uSun * pow(1.0 - abs(d.y), 8.0) * uHorizonGain;        // 지평 따뜻한 띠
          float sd = max(dot(d, normalize(uSunDir)), 0.0);
          c += uSun * smoothstep(1.0 - uSunSize, 1.0, sd) * uSunGain; // 태양 원반
          c += uSun * pow(sd, 12.0) * uHaloGain;                      // 헤일로
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    const dome = new THREE.Mesh(geo, mat);
    dome.frustumCulled = false;
    skyScene.add(dome);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    // near/far 기본값(0.1~100)은 돔 반경보다 작아 잘린다 — 반드시 넘긴다.
    const rt = pmrem.fromScene(skyScene, E.pmremSigma, 1, E.domeRadius * 2);
    if (this.envRT) this.envRT.dispose();
    this.envRT = rt;
    this.scene.environment = rt.texture;
    // 간접광 세기 — worldstyle.mood.ambient 가 여기까지 온다 (applyMood 가 정한다)
    if (this.envIntensity == null) this.envIntensity = E.intensity;
    if ('environmentIntensity' in this.scene) this.scene.environmentIntensity = this.envIntensity;
    pmrem.dispose();
    geo.dispose();
    mat.dispose();
    return rt;
  }

  /* ═════════════════════ 후처리 풀스택 (P12 — 순서 고정) ═════════════════════ */

  _buildComposer() {
    const size = this.renderer.getSize(new THREE.Vector2());
    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(this.pixelRatio);

    // 1) RenderPass
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // 2) SSAOPass — 접촉 그림자로 물체를 지면에 앉힌다 (약하게)
    this.ssao = new SSAOPass(this.scene, this.camera, size.x, size.y, POST.SSAO.kernelSize);
    this.ssao.kernelRadius = POST.SSAO.kernelRadius;
    this.ssao.minDistance = POST.SSAO.minDistance;
    this.ssao.maxDistance = POST.SSAO.maxDistance;
    this.ssao.output = SSAOPass.OUTPUT.Default;
    this._patchSSAOIntensity(this.ssao, POST.SSAO.intensity);
    // 직교 카메라 — SSAO 깊이 복원이 직교 공식으로 돌게 디파인만 바꾼다 (벤더 파일 무수정)
    if (this.ssao.ssaoMaterial) {
      this.ssao.ssaoMaterial.defines.PERSPECTIVE_CAMERA = 0;
      this.ssao.ssaoMaterial.needsUpdate = true;
    }
    if (this.ssao.depthRenderMaterial) {
      this.ssao.depthRenderMaterial.defines.PERSPECTIVE_CAMERA = 0;
      this.ssao.depthRenderMaterial.needsUpdate = true;
    }
    this.composer.addPass(this.ssao);

    // 3) UnrealBloomPass — 발광부에만 (threshold 0.85 · strength 0.35)
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(size.x, size.y), POST.BLOOM.strength, POST.BLOOM.radius, POST.BLOOM.threshold);
    this.composer.addPass(this.bloom);

    // (초점·피사계 심도 패스는 대개편 R6 로 완전히 삭제됐다)

    // 4) FilmPass — grain 0.12, 스캔라인 없음
    this.film = new FilmPass(POST.FILM.grain, POST.FILM.grayscale);
    this.composer.addPass(this.film);

    // 5) SMAAPass
    this.smaa = new SMAAPass(size.x * this.pixelRatio, size.y * this.pixelRatio);
    this.composer.addPass(this.smaa);

    // 6) OutputPass — 톤매핑·색공간 변환은 여기서 끝난다
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    this.passOrder = POST_ORDER.slice();
    // 패스를 다 넣은 뒤에 크기를 맞춘다 — setSize 는 "그 시점에 등록된" 패스만 리사이즈한다.
    this.resize();
    this._measureScenePass();
    this.setQuality('medium', { manual: false, persist: false });  // 초기값(기본 중) — 저장된 선호를 덮어쓰지 않는다
  }

  /**
   * SSAOPass 에는 강도 파라미터가 없다 — 블러 결과를 1(=AO 없음)쪽으로 당겨 강도를 만든다.
   * 벤더 파일은 건드리지 않고 셰이더 문자열만 교체한다. 문자열이 다르면 조용히 건너뛴다.
   */
  _patchSSAOIntensity(pass, intensity) {
    const m = pass.blurMaterial;
    if (!m || typeof m.fragmentShader !== 'string') return;
    const needle = 'gl_FragColor = vec4( vec3( result / ( 5.0 * 5.0 ) ), 1.0 );';
    if (m.fragmentShader.indexOf(needle) < 0) return;
    m.fragmentShader = m.fragmentShader.replace(needle,
      'float fanAO = result / ( 5.0 * 5.0 );\n\t\t\tgl_FragColor = vec4( vec3( mix( 1.0, fanAO, uAoIntensity ) ), 1.0 );');
    m.fragmentShader = 'uniform float uAoIntensity;\n' + m.fragmentShader;
    m.uniforms.uAoIntensity = { value: intensity };
    m.needsUpdate = true;
  }

  /** RenderPass 만의 드로우콜·삼각형을 따로 잰다 (§5 예산은 씬 기준으로 판정한다) */
  _measureScenePass() {
    const pass = this.renderPass;
    const orig = pass.render.bind(pass);
    const self = this;
    pass.render = function (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
      const c0 = renderer.info.render.calls, t0 = renderer.info.render.triangles;
      orig(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
      self.stats.sceneCalls = renderer.info.render.calls - c0;
      self.stats.sceneTriangles = renderer.info.render.triangles - t0;
    };
  }

  /* ═════════════════════ 품질 프리셋 3단 (§5 · §T6) ═════════════════════ */

  /** 프리셋: 하 0.75 / 중 min(dpr,1) / 상 min(dpr,2) + 블룸 토글. manual:true 면 자동 감지를 멈춘다. */
  setQuality(name, opts = {}) {
    const q = QUALITY[name] ? name : 'medium';
    const cfg = QUALITY[q];
    this.quality = q;
    if (opts.manual !== false) { this._qualityLocked = true; this._autoDone = true; }

    // 물질화 중에는 SSAO 가 아직 없는 물체의 접촉 그림자를 그리므로 프리셋 위에 한 겹 더 눌러 둔다
    if (this.ssao) this.ssao.enabled = cfg.ssao && !this._materializing;
    if (this.bloom) this.bloom.enabled = cfg.bloom;
    if (this.film) this.film.enabled = cfg.film;
    if (this.smaa) this.smaa.enabled = cfg.smaa;

    // 픽셀비율 = min(기기 dpr, 프리셋 상한) — 하 0.75(고정) / 중 1.0 / 상 2.0 (§T6)
    const pr = Math.min(this.devicePixelRatio, cfg.pixelRatio);
    if (Math.abs(pr - this.pixelRatio) > 1e-3) {
      this.pixelRatio = pr;
      this.renderer.setPixelRatio(pr);
      if (this.composer) this.composer.setPixelRatio(pr);
      this.resize();
      this._emitPixelRatio();          // 파티클 uPix 도 같이 내려간다
    }

    // 굴절(투과) — three 는 transmissive 가 하나라도 있으면 매 프레임 불투명 씬을
    // 풀해상도 렌더타깃에 **다시 그린다**. 저사양에서 가장 큰 한 덩어리라 low 에서 끈다.
    setTransmissionEnabled(cfg.transmission !== false);

    this.renderer.shadowMap.enabled = cfg.shadows;
    if (this.key && this.key.shadow.mapSize.x !== cfg.shadowMap) {
      this.key.shadow.mapSize.set(cfg.shadowMap, cfg.shadowMap);
      if (this.key.shadow.map) { this.key.shadow.map.dispose(); this.key.shadow.map = null; }
    }
    this.stats.quality = q;
    if (opts.persist !== false) this._persistQuality();
    try {
      window.dispatchEvent(new CustomEvent('fan:quality', {
        detail: { quality: q, manual: this._qualityLocked, auto: opts.manual === false },
      }));
    } catch (e) { /* CustomEvent 미지원 환경이어도 렌더는 계속 */ }
    return q;
  }

  /* ═════════════════════ 품질 기억 (localStorage) ═════════════════════ */

  _persistQuality() {
    try {
      localStorage.setItem('fantology.quality.v1', JSON.stringify({ name: this.quality, manual: this._qualityLocked }));
    } catch (e) { /* 프라이빗 모드 등 — 기억 없이 동작 */ }
  }

  _loadQualityPref() {
    try {
      const raw = localStorage.getItem('fantology.quality.v1');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /** '자동' 선택 — 잠금·기억을 지우고 high 에서 다시 측정을 시작한다 */
  resetQualityAuto() {
    try { localStorage.removeItem('fantology.quality.v1'); } catch (e) { /* 무시 */ }
    this._qualityLocked = false;
    this._autoDone = false;
    this._autoStart = 0;
    this._frameIndex = 0;
    this._frameSamples.length = 0;
    this._adaptSamples.length = 0;
    this._adaptStart = 0;
    return this.setQuality('high', { manual: false, persist: false });
  }

  /* ═════════════════════ pixelRatio 구독 (파티클 uPix 동기화) ═════════════════════ */

  /**
   * pixelRatio 가 바뀔 때마다 fn(pr) 을 부른다. 등록 즉시 한 번 호출한다.
   * (gl_PointSize 는 백버퍼 픽셀 단위라, 강등으로 백버퍼가 작아지면 같이 줄어야 한다.)
   */
  watchPixelRatio(fn) {
    if (typeof fn !== 'function') return;
    this._prWatchers.push(fn);
    fn(this.pixelRatio);
  }

  /** 세계를 헐 때 호출 — 사라진 컴포넌트의 콜백을 붙들고 있지 않게 한다 */
  clearPixelRatioWatchers() { this._prWatchers.length = 0; }

  _emitPixelRatio() {
    for (const fn of this._prWatchers) {
      try { fn(this.pixelRatio); } catch (e) { /* 한 컴포넌트의 실패가 루프를 막지 않게 */ }
    }
  }

  /* ═════════════════════ 물질화 중의 패스 게이트 ═════════════════════ */

  /**
   * 소환(디졸브) 중에는 SSAO 를 끈다.
   * `scene.overrideMaterial` 로 씬을 통째로 다시 그리므로 style.js 의 디졸브 discard 가
   * 사라진다 — 아직 피어나지 않은 성의 접촉 그림자를 먼저 칠하게 된다.
   * (그림자는 캐스터의 customDepthMaterial 이 같은 discard 를 굽기 때문에 끄지 않는다.)
   */
  _syncMaterializePasses() {
    const on = U.materialize.value < 0.999;
    if (on === this._materializing) return;
    this._materializing = on;
    const cfg = QUALITY[this.quality] || QUALITY.medium;
    if (this.ssao) this.ssao.enabled = cfg.ssao && !on;
  }

  /**
   * 품질 자동 조절 — 두 층.
   * 초기 판정: 프레임타임 5초 중앙값으로 시작 프리셋 확정. **물질화 중에는 측정하지 않는다** —
   *   그 구간은 SSAO 가 게이트로 꺼져 있어 실부하보다 싸게 측정되고, 그 오판이
   *   "물질화가 끝나자마자 끊기기 시작하는" 증상의 원인이었다.
   * 상시 적응: 판정 이후에도 4초 창 중앙값이 임계를 넘으면 한 단계씩 강등한다.
   *   승격은 자동으로 하지 않는다(진동 방지) — 올리고 싶으면 수동 토글.
   */
  _autoQuality(dtms) {
    if (this._qualityLocked) return;
    if (this._materializing || document.hidden) {
      // 물질화·백그라운드 프레임은 실부하가 아니다 — 창을 버리고 끝난 뒤 다시 잰다
      this._autoStart = 0; this._frameSamples.length = 0;
      this._adaptStart = 0; this._adaptSamples.length = 0;
      return;
    }
    if (!this._autoDone) {
      this._frameIndex++;
      if (this._frameIndex <= AUTO_QUALITY.WARMUP_FRAMES) return;
      if (!this._autoStart) this._autoStart = performance.now();
      this._frameSamples.push(dtms);
      if (performance.now() - this._autoStart < AUTO_QUALITY.SAMPLE_MS) return;
      this._autoDone = true;
      if (this._frameSamples.length >= AUTO_QUALITY.MIN_SAMPLES) {
        const med = this._median(this._frameSamples);
        this.stats.autoMedianMs = med;
        if (med > AUTO_QUALITY.LOW_MS) this.setQuality('low', { manual: false });
        else if (med > AUTO_QUALITY.MEDIUM_MS) this.setQuality('medium', { manual: false });
        else this._persistQuality();     // high 확정도 기억 — 재방문은 측정을 건너뛴다
      }
      this._frameSamples.length = 0;
      return;
    }
    // 상시 적응 — low 밑은 없으니 low 면 멈춘다
    if (this.quality === 'low') return;
    if (!this._adaptStart) this._adaptStart = performance.now();
    this._adaptSamples.push(dtms);
    if (performance.now() - this._adaptStart < AUTO_QUALITY.ADAPT_WINDOW_MS) return;
    const n = this._adaptSamples.length;
    const med = this._median(this._adaptSamples);
    this._adaptSamples.length = 0; this._adaptStart = 0;
    if (n < AUTO_QUALITY.ADAPT_MIN_SAMPLES) return;    // 탭 전환 등으로 샘플이 빈약하면 판정 보류
    this.stats.adaptMedianMs = med;
    if (this.quality === 'high' && med > AUTO_QUALITY.MEDIUM_MS) this.setQuality('medium', { manual: false });
    else if (this.quality === 'medium' && med > AUTO_QUALITY.LOW_MS) this.setQuality('low', { manual: false });
  }

  _median(arr) {
    const s = arr.slice().sort((a, b) => a - b);
    return s.length ? s[Math.floor(s.length / 2)] : 0;
  }

  /** window.fanAPI.setQuality(name) — main.js 가 fanAPI 를 세운 뒤에 얹는다 (계약 키는 건드리지 않는다) */
  _exposeQualityAPI() {
    const attach = () => {
      if (!window.fanAPI) return;
      window.fanAPI.setQuality = (name) =>
        name === 'auto' ? this.resetQualityAuto() : this.setQuality(name, { manual: true });
      window.fanAPI.getQuality = () => this.quality;
      window.fanAPI.isQualityAuto = () => !this._qualityLocked;
      window.fanAPI.qualityPresets = () => QUALITY_ORDER.slice();
      window.fanAPI.setFogLevel = (v) => this.setFogLevel(v);
      window.fanAPI.getFogLevel = () => this.getFogLevel();
    };
    this._onFanAPI = attach;
    window.addEventListener('fanapi:ready', attach);
    attach();
  }

  /* ═════════════════════ mood 반영 ═════════════════════ */

  /** worldstyle.mood 를 라이팅 리그·안개·환경맵에 반영 (계약 §4b) */
  applyMood(mood) {
    const preset = timePreset(mood.timeOfDay);
    const K = LIGHT.KEY;
    const F = LIGHT.FILL, E = LIGHT.ENV;

    // mood.ambient — 주변광의 양. 기준값(ambientRef)이 배율 1.0 이라 지정이 없으면 화면이 그대로다.
    // 반구광은 §1.4 의 상한(KEY 의 0.35) 때문에 위로 못 가므로, 넘치는 몫은 간접광(환경맵)이 받는다.
    const ambRaw = typeof mood.ambient === 'number' ? mood.ambient : F.ambientRef;
    const ambRatio = ambRaw / (F.ambientRef || 1);
    const ambFill = clamp(ambRatio, F.ambientMin, F.ambientMax);
    this.envIntensity = E.intensity * clamp(ambRatio, E.ambientMin, E.ambientMax);

    // KEY — 방향은 아트 바이블 고정값, 색만 mood 를 따른다
    this.key.color.set(mood.sunColor);
    this.key.intensity = preset.sunI;
    this.key.position.set(KEY_DIR[0] * K.distance, KEY_DIR[1] * K.distance, KEY_DIR[2] * K.distance);
    this.key.target.position.set(0, 0, 0);
    this.key.target.updateMatrixWorld();

    // FILL — 항상 KEY 의 0.35 이하
    this.fill.color.set(mood.skyTop);
    this.fill.groundColor.set(SKY.GROUND);
    this.fill.intensity = this.key.intensity * F.ratioOfKey * clamp(preset.hemiI / 1.25, 0.25, 1) * ambFill;

    // RIM — 실루엣 분리 전용, 세기 고정. 실루엣 림은 **이 광원 하나뿐**이다 (§1.4).
    this.rim.color.set(LIGHT.RIM.color);
    this.rim.intensity = LIGHT.RIM.intensity;
    this.rim.position.set(RIM_DIR[0] * LIGHT.RIM.distance, RIM_DIR[1] * LIGHT.RIM.distance, RIM_DIR[2] * LIGHT.RIM.distance);

    // P11 대기 원근 — 사용자 안개 짙기(setFogLevel)의 배율을 함께 얹는다
    this.scene.fog = new THREE.Fog(
      col(mood.fogColor), FOG.NEAR * this._fogFactor, FOG.FAR * this._fogFactor);

    // 블룸은 P12 고정값이다 — mood 로 키우지 않는다 (과다 블룸 금지)
    this.bloom.strength = POST.BLOOM.strength;
    this.bloom.threshold = POST.BLOOM.threshold;
    this.bloom.radius = POST.BLOOM.radius;

    this.sunDir = new THREE.Vector3(KEY_DIR[0], KEY_DIR[1], KEY_DIR[2]);
    this.bakeEnvironment(mood);
  }

  /* ═════════════════════ 안개 짙기 (§T6 — 0~100, 50 = 기준) ═════════════════════ */

  /**
   * v≤50: factor = 2.0 − v/50 (0 → 2.0 가장 옅음) · v>50: factor = 1.0 − (v−50)/100 (100 → 0.5 가장 짙음).
   * factor 는 Fog near·far 에 곱한다 — 값이 클수록 안개가 가까이 내려와 짙어지고, 50 이 정확히 기존 값.
   */
  setFogLevel(v) {
    const n = Number(v);
    if (!isFinite(n)) return this._fogLevel;
    const lv = clamp(n, 0, 100);
    this._fogLevel = lv;
    this._fogFactor = lv <= 50 ? 2.0 - lv / 50 : 1.0 - (lv - 50) / 100;
    if (this.scene.fog) {
      this.scene.fog.near = FOG.NEAR * this._fogFactor;
      this.scene.fog.far = FOG.FAR * this._fogFactor;
    }
    return this._fogLevel;
  }

  getFogLevel() { return this._fogLevel; }

  /* ═════════════════════ 씬 관리 ═════════════════════ */

  /**
   * 씬에 넣으면서 그림자 참여를 정해준다.
   * 불투명 메시만 캐스터·리시버가 된다 (하늘 돔·발광·스프라이트·파티클은 제외).
   * userData.fanNoShadow 로 개별 제외 가능.
   */
  add(obj) {
    if (obj) this._tagShadows(obj);
    this.scene.add(obj);
  }

  _tagShadows(root) {
    root.traverse((o) => {
      if (!o.isMesh || o.isSprite || o.isPoints || o.isLine) return;
      if (o.userData && o.userData.fanNoShadow) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const opaque = mats.every((m) => m && m.transparent !== true && m.depthWrite !== false && m.toneMapped !== false);
      // 지면은 받기만 한다 — 지형 전체를 그림자맵에 굽는 건 낭비다
      const isGround = !!(o.userData && o.userData.fanGround);
      o.castShadow = opaque && !isGround;
      o.receiveShadow = opaque;
      if (o.castShadow) this._attachDepthMaterial(o, mats);
    });
  }

  /**
   * 캐스터에 물질화 디졸브·바람이 그대로 들어간 depth 재질을 붙인다.
   * three 는 그림자 depth 재질을 원본에서 복제할 때 `onBeforeCompile` 을 가져가지 않으므로,
   * 이걸 안 붙이면 아직 피어나지 않은 성의 그림자가 먼저 땅에 깔리고 나무 그림자가 흔들리지 않는다.
   */
  _attachDepthMaterial(mesh, mats) {
    if (mesh.customDepthMaterial || Array.isArray(mesh.material)) return;
    const m = mats[0];
    if (!m || !m.userData || !m.userData.fanPatch) return;
    const d = fanDepthMaterial(m);
    if (d) mesh.customDepthMaterial = d;
  }

  remove(obj) { if (obj) this.scene.remove(obj); }

  /* ═════════════════════ 피킹 ═════════════════════ */

  setPickTargets(list) { this.pickTargets = list.filter(Boolean); }

  /**
   * 집을 수 있는 대상인가 (기본: 전부). 시간 디졸브는 프래그먼트 discard 로만 지우고
   * 랜드마크 픽 프록시는 애초에 `visible = false` 라, three 의 레이캐스트는 "지금 없는 것"을
   * 구분하지 못한다 — 그 판정을 여기 한 줄로 위임한다 (main.js 가 존재도를 물려준다).
   */
  setPickFilter(fn) { this.pickFilter = typeof fn === 'function' ? fn : null; }

  _pickable(id) { return !!id && (!this.pickFilter || this.pickFilter(id)); }

  _pointerFrom(ev) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  }

  pick(ev) {
    this._pointerFrom(ev);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickTargets, true);
    for (const h of hits) {
      // 걸러진 히트는 건너뛰고 **뒤쪽 히트를 계속 본다** — 사라진 성 너머의 것을 집을 수 있어야 한다
      if (h.object && h.object.isInstancedMesh && h.instanceId != null && this.instanceResolver) {
        const id = this.instanceResolver(h.instanceId);
        if (id) {
          if (this._pickable(id)) return { id, point: h.point };
          continue;
        }
      }
      let o = h.object;
      let guard = 0;
      while (o && guard++ < 12) {
        const id = o.userData && o.userData.fanNodeId;
        if (id) {
          if (this._pickable(id)) return { id, point: h.point };
          break;
        }
        o = o.parent;
      }
    }
    return null;
  }

  /**
   * 커서가 가리키는 지면점(시선중심 높이의 평면) — 직교 광선은 전부 시선과 평행하다.
   * 시선이 지평에 가까우면(TILT_GUARD) 교차가 발산하므로 null — 호출부는 안전 폴백.
   * halfH 는 camera.zoom 이 아니라 **현재 거리에서 직접** 유도한다: 휠이 한 프레임에
   * 여러 번 와도 zoom 갱신(_syncOrthoZoom, tick 당 1회)을 기다리다 낡은 배율을 쓰지 않게.
   */
  _cursorGroundPoint(clientX, clientY, out) {
    const t = this.controls.target;
    const cx = this.camera.position.x - t.x;
    const cy = this.camera.position.y - t.y;
    const cz = this.camera.position.z - t.z;
    const d = Math.hypot(cx, cy, cz) || 1e-6;
    const gx = -cx / d, gy = -cy / d, gz = -cz / d;      // 카메라 → 시선중심 (단위)
    if (Math.abs(gy) < TILT_GUARD) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const nx = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    const ny = -(((clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
    // right = gaze × 세계Up, up = right × gaze (직교엔 롤이 없다)
    const rx0 = -gz, rz0 = gx;
    const rl = Math.hypot(rx0, rz0) || 1;
    const rx = rx0 / rl, rz = rz0 / rl;
    const upx = -rz * gy, upy = rz * gx - rx * gz, upz = rx * gy;
    const aspect = (this.camera.right - this.camera.left) / (this.camera.top - this.camera.bottom);
    const halfH = ORTHO_HALF_H * d / ORTHO_REF;          // = camera.top / zoom, 단 항상 신선하다
    const ox = nx * halfH * aspect, oy = ny * halfH;
    const Ox = this.camera.position.x + rx * ox + upx * oy;
    const Oy = this.camera.position.y + upy * oy;
    const Oz = this.camera.position.z + rz * ox + upz * oy;
    const tt = (t.y - Oy) / gy;
    out.x = Ox + gx * tt;
    out.z = Oz + gz * tt;
    return out;
  }

  /**
   * 시선중심 이동분(mx,mz)을 섬 경계 안으로 다듬는다 — **지금보다 더 나가는 것만** 막는다.
   * (이미 밖에 있으면 그 자리는 존중한다: 하드 투영은 한 프레임 순간이동을 만든다)
   */
  _clampTargetMove(mx, mz) {
    const limit = this._panLimit;
    if (!limit) return { x: mx, z: mz };
    const t = this.controls.target;
    const cap = Math.max(limit, Math.hypot(t.x, t.z));   // 현 초과분은 보존 — 더 늘리지만 않는다
    const nx = t.x + mx, nz = t.z + mz;
    const dd = Math.hypot(nx, nz);
    if (dd <= cap || dd < 1e-6) return { x: mx, z: mz };
    const sh = cap / dd;
    return { x: nx * sh - t.x, z: nz * sh - t.z };
  }

  _bindEvents() {
    const el = this.renderer.domElement;

    /* ── 클릭/드래그 판정 (R7) — 5px 임계 · 포인터 캡처 · 드래그 후 click 억제 ── */
    this._down = null;
    this._suppressClick = false;
    el.addEventListener('pointerdown', (ev) => {
      this._suppressClick = false;
      this._down = { x: ev.clientX, y: ev.clientY, id: ev.pointerId, button: ev.button, dragged: false };
      try { el.setPointerCapture(ev.pointerId); } catch (e) { /* 캡처 미지원 환경 */ }
      // 좌버튼 — 커서 밑의 땅을 붙잡는다. 이후 움직임은 그 점이 커서를 따라오게 민다.
      this._grab = null;
      if (ev.button === 0 && this.controls.enabled) {
        const g = this._cursorGroundPoint(ev.clientX, ev.clientY, { x: 0, z: 0 });
        if (g) this._grab = g;
      }
    });
    el.addEventListener('pointerup', (ev) => {
      try { el.releasePointerCapture(ev.pointerId); } catch (e) { /* 무시 */ }
      el.style.cursor = '';                                // 끌기 커서를 놓아 준다
      this._grab = null;
      const d = this._down;
      if (!d || d.id !== ev.pointerId) return;
      this._down = null;
      const moved = d.dragged || Math.hypot(ev.clientX - d.x, ev.clientY - d.y) > DRAG_PX;
      if (moved) { this._suppressClick = true; return; }   // 드래그는 클릭이 아니다
      if (d.button !== 0) return;                          // 선택은 좌클릭만 — 우클릭은 회전
      const hit = this.pick(ev);
      if (this.onPick) this.onPick(hit ? hit.id : null, ev);
    });
    el.addEventListener('pointercancel', () => { this._down = null; this._grab = null; el.style.cursor = ''; });
    // 드래그가 끝난 뒤 브라우저가 쏘는 click 은 캡처 단계에서 삼킨다 — 다른 리스너로 새지 않게
    el.addEventListener('click', (ev) => {
      if (!this._suppressClick) return;
      this._suppressClick = false;
      ev.stopImmediatePropagation();
      ev.preventDefault();
    }, true);
    // 우끌기 = 회전이므로 컨텍스트 메뉴는 항상 억제한다
    el.addEventListener('contextmenu', (ev) => ev.preventDefault());

    /* ── 호버 픽 — 드래그 중에는 쉬고, 55ms 스로틀 ── */
    let last = 0;
    el.addEventListener('pointermove', (ev) => {
      const d = this._down;
      if (d && d.id === ev.pointerId && !d.dragged
          && Math.hypot(ev.clientX - d.x, ev.clientY - d.y) > DRAG_PX) d.dragged = true;
      if (d) {
        el.style.cursor = 'grabbing';
        // 지면 붙잡기 팬 — 붙잡은 점이 커서 밑에 계속 있도록 1:1 로 민다 (고무줄·배율 손실 없음)
        if (d.button === 0 && d.dragged && this._grab && this.controls.enabled) {
          const cur = this._cursorGroundPoint(ev.clientX, ev.clientY, { x: 0, z: 0 });
          if (cur) {
            const mv = this._clampTargetMove(this._grab.x - cur.x, this._grab.z - cur.z);
            this.controls.target.x += mv.x; this.controls.target.z += mv.z;
            this.camera.position.x += mv.x; this.camera.position.z += mv.z;
          }
        }
        return;
      }
      const now = performance.now();
      if (now - last < 55) return;
      last = now;
      const hit = this.pick(ev);
      if (this.onHover) this.onHover(hit ? hit.id : null, ev);
      el.style.cursor = hit ? 'pointer' : 'grab';
    });
    el.addEventListener('pointerleave', () => { if (this.onHover) this.onHover(null, null); });

    /* ── 휠 줌 (R7·D4) — **커서 아래 지점으로** 줌한다 (Blender 'Zoom to Mouse Position' ·
       지도 앱 표준). ortho zoom 은 거리에서 유도되므로 거리를 밀고, 커서가 가리키던
       지면점이 화면에서 제자리에 머물도록 시선중심을 그쪽으로 끌어당긴다. ── */
    el.addEventListener('wheel', (ev) => {
      ev.preventDefault();                                 // 페이지 스크롤·브라우저 줌 억제
      if (!this.controls.enabled) return;                  // 지도 편집 등 — 카메라 주인이 따로 있다
      const dy = ev.deltaMode === 1 ? ev.deltaY * 33 : ev.deltaY;   // LINE 모드(Firefox) 환산
      const k = Math.exp(clamp(dy, -400, 400) * 0.00115);
      this.fly = null;                                     // 사용자 입력이 비행보다 세다
      this._flyBase = 0;                                   // 배율이 바뀌었다 — WASD 속도 기준을 다시 재게 한다
      const t = this.controls.target;
      this._wheelOffset.copy(this.camera.position).sub(t);
      const d0 = this._wheelOffset.length();
      const dist = clamp(d0 * k, this.controls.minDistance, this.controls.maxDistance);
      const kk = dist / Math.max(d0, 1e-6);                // 실제 적용된 배율 (한계에 막히면 1)
      // 커서가 가리키던 지면점 P: 배율이 kk 로 갈 때 P 가 화면에 붙박이려면
      // 시선중심이 P 쪽으로 (1-kk) 만큼 다가서야 한다. 시선이 지평에 가까우면(_cursorGroundPoint
      // 의 TILT_GUARD) 교차가 발산하므로 중앙 줌으로 폴백한다 — 한 칸에 수백 유닛 튀는 사고 방지.
      if (Math.abs(kk - 1) > 1e-4) {
        const P = this._cursorGroundPoint(ev.clientX, ev.clientY, { x: 0, z: 0 });
        if (P) {
          const mv = this._clampTargetMove((P.x - t.x) * (1 - kk), (P.z - t.z) * (1 - kk));
          t.x += mv.x; t.z += mv.z;
        }
      }
      this._wheelOffset.setLength(dist);
      this.camera.position.copy(t).add(this._wheelOffset);
    }, { passive: false });

    /* ── WASD 팬 (R6) — 입력 필드·contenteditable 포커스 중 무시, blur 시 키 해제 ── */
    this._onKeyDown = (ev) => {
      if (!PAN_KEYS[ev.code]) return;
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;   // 조합키(Ctrl+W 등)는 브라우저 몫
      const t = ev.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ''))) return;
      this._keys[ev.code] = true;
    };
    this._onKeyUp = (ev) => { if (PAN_KEYS[ev.code]) this._keys[ev.code] = false; };
    this._onWinBlur = () => { this._keys = Object.create(null); };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onWinBlur);

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
  }

  resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    // 직교 절두체 — 세로 반높이는 고정, 가로는 화면비를 따른다 (zoom 은 보존된다)
    const aspect = w / Math.max(1, h);
    this.camera.left = -ORTHO_HALF_H * aspect;
    this.camera.right = ORTHO_HALF_H * aspect;
    this.camera.top = ORTHO_HALF_H;
    this.camera.bottom = -ORTHO_HALF_H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);      // 패스 크기까지 composer 가 함께 맞춘다
    this._syncPassCameras();
  }

  /** SSAO 는 카메라 투영을 생성 시점에 복사해 둔다 — 리사이즈·줌 변화 때 다시 맞춘다 */
  _syncPassCameras() {
    if (this.ssao && this.ssao.ssaoMaterial) {
      const u = this.ssao.ssaoMaterial.uniforms;
      u.cameraNear.value = this.camera.near;
      u.cameraFar.value = this.camera.far;
      u.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix);
      u.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse);
    }
  }

  /**
   * 직교 zoom 을 카메라~목표 거리에서 유도한다 — zoom = ORTHO_REF / 거리.
   * 거리→화면 배율 관계가 원근(FOV 42°) 시절과 같아, flyTo(거리 지정)·지도 편집기 고도·
   * 휠 돌리(거리 조작)가 전부 "줌"으로 나타난다 (포커스 비행 = dolly 대신 zoom, §T5).
   */
  _syncOrthoZoom() {
    const d = Math.max(1e-3, this.camera.position.distanceTo(this.controls.target));
    // 직교 화면의 배율은 깊이가 아니라 이 거리 하나가 정한다 — 명패처럼 "화면에서 같은 크기"가
    // 필요한 것들이 노드별 거리 대신 이 값을 읽는다 (views.js 명패 스케일).
    this.camera.userData.fanViewDist = d;
    const z = ORTHO_REF / d;
    if (Math.abs(z - this.camera.zoom) < 1e-4) return;
    this.camera.zoom = z;
    this.camera.updateProjectionMatrix();
    this._syncPassCameras();          // SSAO 깊이 복원이 보는 투영도 함께 간다
  }

  /* ═════════════════════ 카메라 이동 ═════════════════════ */

  /**
   * 포커스 비행 — 목표를 궤도 중심으로 옮기고 지정 거리까지 다가간다.
   * 직교 카메라에서 "다가간다" = zoom 이 커진다 (_syncOrthoZoom 이 거리에서 유도) —
   * 원근 dolly 는 없지만 호출자 계약(거리 지정)은 그대로다.
   */
  flyTo(target, distance = 78, ms = 950) {
    this._flyVel.f = 0; this._flyVel.s = 0; this._flyBase = 0;   // 관성이 비행 경로를 덧칠하지 않게
    const from = { pos: this.camera.position.clone(), tgt: this.controls.target.clone() };
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    if (dir.lengthSq() < 1e-6) dir.set(0.6, 0.5, 0.7).normalize();
    if (dir.y < 0.22) dir.setY(0.22).normalize();
    const to = { pos: target.clone().add(dir.multiplyScalar(distance)), tgt: target.clone() };
    this.fly = { from, to, t: 0, ms };
  }

  frameWorld(radius = 160) {
    this.fly = null;                                     // 진행 중 비행이 재프레이밍을 되돌리지 않게
    this._flyVel.f = 0; this._flyVel.s = 0; this._flyBase = 0;
    this._panLimit = Math.max(60, radius) * KEYPAN_RIM;   // WASD 가 벗어나지 못할 반경
    this.controls.target.set(0, 14, 0);
    this.camera.position.set(radius * 1.15, radius * 0.86, radius * 1.45);
    this.controls.update();
    this._fitShadowTo(radius);
  }

  /** 그림자 카메라를 섬 크기에 맞춘다 — 2048 맵을 낭비하지 않게 */
  _fitShadowTo(radius) {
    const ext = Math.max(60, Math.min(LIGHT.KEY.shadow.halfExtent, radius * 1.35));
    const c = this.key.shadow.camera;
    c.left = -ext; c.right = ext; c.top = ext; c.bottom = -ext;
    c.updateProjectionMatrix();
    this.key.shadow.needsUpdate = true;
  }

  _updateFly(dtms) {
    if (!this.fly) return;
    this.fly.t = clamp(this.fly.t + dtms / this.fly.ms, 0, 1);
    const e = easeInOutCubic(this.fly.t);
    this.camera.position.lerpVectors(this.fly.from.pos, this.fly.to.pos, e);
    this.controls.target.lerpVectors(this.fly.from.tgt, this.fly.to.tgt, e);
    if (this.fly.t >= 1) this.fly = null;
  }

  /**
   * WASD (R6·D5a) — **지면이 흐르는 비행이다. 리그(카메라+닻)가 시선의 지면 방향으로 난다.**
   *
   * 일곱 번째(2026-08-31 저녁). 6차는 "카메라가 시선 벡터를 충실히 직진"이었는데,
   * 직교 카메라에서 시선 방향 평행이동은 광학 흐름이 0이라 화면에 **배율로만** 보인다 —
   * 그래서 W 가 "중앙을 향한 확대 + minDistance 에서 보이지 않는 벽"으로 읽혔다
   * (사용자: "중앙에서 뭐에 부딪히는데? 이동 기능이 맞아? 확대가 아닌거 확실해?").
   * 이동으로 읽히려면 지면이 흘러야 한다. 그래서 전진을 지면 기준으로 나눈다:
   *
   *   · W·S — 수평 몫(시선의 지면 방향)은 리그 전체가 그 방향으로 나는 **진짜 이동**:
   *     땅이 흘러가고, 조준한 지점을 지나쳐 계속 간다. 수직 몫(내려다보는 각도만큼)만
   *     거리 = 고도에 실린다 — 은은한 "줌 당기듯" 접근. 바닥·천장에 막힌 수직 몫은
   *     수평으로 이월(활공)하므로 벽에 부딪혀 서는 일이 없다.
   *   · 속도는 **키를 새로 누른 순간의** 시선 거리에서 한 번만 정한다(_flyBase ×
   *     FLY_SPEED). 나는 동안 거리가 줄어도 다시 줄이지 않는다 — 감속·수렴 금지(D5).
   *     가속(FLY_ACCEL)·관성·감쇠(FLY_DAMP)·Shift 3배(FLY_SPRINT)만 산다.
   *   · target 은 접근 대상이 아니라 **닻**(회전 피벗)이다 — 언제나 화면 중앙의 땅
   *     (시선 광선 위·작업 평면 t.y 보존)이며 리그와 함께 난다. 우드래그 회전의
   *     피벗이 늘 화면 중앙이고, 수렴할 "먼 기준점"은 없다.
   *   · A·D 는 지면과 평행한 옆걸음 — 높이·거리(=배율) 불변. 지수 가속·감쇠는
   *     프레임 독립(dt 환산)이라 주사율이 달라도 체감이 같다.
   */
  _updateKeyPan(dt) {
    const k = this._keys;
    const vel = this._flyVel;
    if (!this.controls.enabled) {                      // 지도 편집 등 — 카메라 주인이 따로 있다.
      vel.f = 0; vel.s = 0; this._flyBase = 0;         // 관성을 들고 넘어가면 편집기 카메라가 끌려간다
      this._flyHeld = false;
      return;
    }
    const x = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0);
    const z = (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0);
    const t = this.controls.target;
    const cam = this.camera.position;
    const dist = cam.distanceTo(t);
    if (dist < 1e-6) return;                           // 병적 상태(외부 세팅) — 광선이 없다, 손대지 않는다

    // 속도의 기준 거리는 **새로 누른 순간** 한 번만 잰다 — 매 프레임 거리에서 다시 재면
    // 다가갈수록 느려진다(감속·끌림 — 폐기한 구조). 관성으로 미끄러지는 중이라도 키를
    // 다시 누르면 그 순간 거리로 다시 재고(연타 주행: 가까이선 촘촘히, 멀리선 성큼),
    // 휠 줌은 기준을 지워 두므로(_flyBase=0) 여기서 새 배율 기준으로 다시 잰다 —
    // 낡은 배율에 고정된 속도로 폭주·기어가지 않게 (적대 리뷰 D5-1).
    const held = !!(x || z);
    if (held && (!this._flyHeld || !this._flyBase))
      this._flyBase = clamp(dist, this.controls.minDistance, this.controls.maxDistance);
    this._flyHeld = held;
    const sprint = (k.ShiftLeft || k.ShiftRight) ? FLY_SPRINT : 1;
    const base = this._flyBase * sprint;

    // 가속(누르는 동안) / 감쇠(뗀 뒤 관성) — 지수 접근이라 프레임 독립이다
    vel.f += (z * base * FLY_SPEED - vel.f) * (1 - Math.exp(-dt * (z ? FLY_ACCEL : FLY_DAMP)));
    vel.s += (x * base * STRAFE_SPEED - vel.s) * (1 - Math.exp(-dt * (x ? FLY_ACCEL : FLY_DAMP)));
    if (!x && !z && Math.abs(vel.f) < FLY_STOP && Math.abs(vel.s) < FLY_STOP) {
      vel.f = 0; vel.s = 0; this._flyBase = 0;         // 정지 — 다음 누름이 새 기준 거리를 잰다
      return;
    }
    if (x || z) this.fly = null;                       // 사용자 입력이 비행보다 세다

    // 방향틀 — 시선(단위)과 그 수평 방향. 가드 1e-8: OrbitControls makeSafe 의 완전
    // 탑다운(polar 1e-6, sin≈1e-6)이 1e-6 가드에 걸리면 방향틀이 요 무관 월드축으로
    // 떨어져 프레임마다 퍼덕인다(적대 리뷰 D5-3) — 1e-8 나눗셈은 double 에서 안정.
    const gaze = this._panFwd.copy(t).sub(cam).multiplyScalar(1 / dist);
    let hx = gaze.x, hz = gaze.z;
    const hl = Math.hypot(hx, hz);
    if (hl < 1e-8) { hx = 0; hz = -1; } else { hx /= hl; hz /= hl; }

    // 전진을 지면 기준으로 나눈다 (D5a — 위 주석): 수평 몫은 리그 이동, 수직 몫만 거리.
    // 바닥(minDistance)·천장(maxDistance)에 막힌 수직 몫(carry)은 수평 이월 — 활공.
    const want = vel.f * dt;                           // 서명된 전진 요청량
    const vshare = want * Math.abs(gaze.y);            // 고도(거리·줌) 몫
    const s1 = clamp(dist - vshare, this.controls.minDistance, this.controls.maxDistance);
    const carry = vshare - (dist - s1);                // 막힌 고도 몫 → 수평 이월 (부호 = 진행 방향)
    // 닻(= 화면 중앙의 땅)은 리그와 함께 난다. 수평 이동은 섬 림을 "더 나가지만 않는다"
    // — 깎이면 카메라도 같은 양만큼 멈춘다. 섬을 잃는 비행은 없다(적대 리뷰 D5-2 —
    // 닻이 림 밖으로 나가면 grab팬·휠의 "현 초과분 보존" 래칫까지 같이 풀려 버린다).
    const tm = this._clampTargetMove(
      gaze.x * want + hx * carry + (-hz) * vel.s * dt,
      gaze.z * want + hz * carry + hx * vel.s * dt);
    t.x += tm.x; t.z += tm.z;

    // 카메라 재배치 — 시선 방향(피치·요)과 작업 평면(t.y)은 그대로, 거리만 s1 로.
    // 내려다보며 날면 그만큼 은은히 가까워진다(줌인). 직교 zoom 은 거리 유도 그대로다.
    cam.set(t.x - gaze.x * s1, t.y - gaze.y * s1, t.z - gaze.z * s1);
  }

  /* ═════════════════════ 루프 ═════════════════════ */

  start(onFrame) {
    // 후처리 패스마다 renderer.render 가 불려 info 가 초기화되므로, 프레임 단위 집계는
    // autoReset 을 끄고 직접 재는 수밖에 없다 (§5 드로우콜·삼각형 예산 실측용).
    const info = this.renderer.info;
    info.autoReset = false;
    const tick = () => {
      this._raf = requestAnimationFrame(tick);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const t = this.clock.elapsedTime;
      U.time.value = t;
      this._updateFly(dt * 1000);
      this._updateKeyPan(dt);
      // OrbitControls 감쇠는 update() 호출당 고정 비율이라 주사율마다 체감이 다르다 —
      // 매 프레임 dt 로 환산해 시정수를 ~90ms 로 고정한다 (드래그 고무줄 제거)
      this.controls.dampingFactor = 1 - Math.exp(-dt * 11);
      this.controls.update();
      this._syncOrthoZoom();            // 거리 → 직교 zoom (비행·휠·WASD·편집기 이동 전부 반영)
      this._syncMaterializePasses();
      if (onFrame) onFrame(dt, t);
      info.reset();
      this.composer.render(dt);
      this.stats.calls = info.render.calls;
      this.stats.triangles = info.render.triangles;
      this.stats.fps = dt > 0 ? 1 / dt : 0;
      this._autoQuality(dt * 1000);
    };
    tick();
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown);
    if (this._onKeyUp) window.removeEventListener('keyup', this._onKeyUp);
    if (this._onWinBlur) window.removeEventListener('blur', this._onWinBlur);
    if (this._onFanAPI) window.removeEventListener('fanapi:ready', this._onFanAPI);
    if (this.envRT) { this.envRT.dispose(); this.envRT = null; }
    if (this.composer) this.composer.dispose();
    this.renderer.dispose();
  }
}
