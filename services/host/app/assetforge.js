// app/assetforge.js — 카탈로그 레시피를 실제 Three.js 장면으로 굽는다.
// 정적 파트는 재질 계열별 병합, 움직이는 파트만 개별 그룹으로 유지한다.
import * as THREE from 'three';
import { rngFor } from './util.js';
import {
  Assembly, ASSET_COLOR as C, FAMILY, FAMILY_ORDER, PLACE_BUILDERS,
  bakePart, mergeBucket, familyMaterial,
} from './landmarks.js';
import { normalizeAssetRecipes } from './assetcatalog.js';
import { buildFromBlueprint, VARIANT_BY_ID } from './assetblueprint.js';
import { patchGroupTime } from './timetravel.js';
import { patchGroupCataclysm } from './cataclysm.js';
import {
  BEVEL_S, BLACK, FOLIAGE, HOLO, MYSTIC, RIFT, STRUCT, SURFACE, WATER,
} from './artbible.js';

const DYNAMIC_ACTIONS = new Set([
  'moving', 'walking', 'running', 'driving', 'rolling', 'sailing', 'flying', 'gliding',
  'hovering', 'falling', 'rotating', 'patrolling', 'chasing', 'fleeing', 'attacking',
  'defending', 'working', 'roaring', 'transforming', 'spawning', 'vanishing', 'opening',
  'traversing', 'collapsing',
]);
const MAX_DYNAMIC_ASSETS = 24;

const EFFECT_COLOR = Object.freeze({
  fire: RIFT.HOT,
  smoke: STRUCT.IRON,
  sparks: RIFT.SHARD,
  steam: HOLO.MIST,
  frost_mist: MYSTIC.CRYSTAL_B,
  dust: SURFACE.ROAD_WORN,
  debris: STRUCT.STONE_DARK,
  water_spray: WATER.SPRAY,
  lightning: MYSTIC.BEAM,
  aura: MYSTIC.AURA_A,
  runes: RIFT.COLD,
  shadow: BLACK,
  spores: FOLIAGE.LEAF_HI,
  hologram_noise: HOLO.B,
  time_echo: HOLO.A,
  gravity_shards: MYSTIC.CRYSTAL_A,
});

const M4 = () => new THREE.Matrix4();
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const QE = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));

function sphere(b, r, x, y, z, fam, color, sx = 1, sy = 1, sz = 1, detail = 1) {
  return b.push(new THREE.IcosahedronGeometry(r, detail), fam, color,
    M4().compose(V3(x, y, z), new THREE.Quaternion(), V3(sx, sy, sz)), false);
}

function rotCylinder(b, r0, r1, h, seg, x, y, z, fam, color, rx = 0, ry = 0, rz = 0) {
  return b.push(new THREE.CylinderGeometry(r1, r0, h, seg, 1), fam, color,
    M4().compose(V3(x, y, z), QE(rx, ry, rz), V3(1, 1, 1)), false);
}

function torus(b, radius, tube, x, y, z, fam, color, rx = 0, ry = 0, rz = 0) {
  return b.push(new THREE.TorusGeometry(radius, tube, 8, 24), fam, color,
    M4().compose(V3(x, y, z), QE(rx, ry, rz), V3(1, 1, 1)), false);
}

function wing(b, side, y, z, fam, color, span = 5) {
  const s = side < 0 ? -1 : 1;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, s * span, 1.2, -1.0, s * span * 0.78, -0.25, 2.0,
    0, 0, 0, s * span * 0.78, -0.25, 2.0, s * span * 0.35, -0.55, 2.8,
  ], 3));
  geo.computeVertexNormals();
  return b.push(geo, fam, color, M4().compose(V3(0, y, z), QE(-0.12, 0, -s * 0.10), V3(1, 1, 1)), true);
}

function buildCastle(b, size) {
  PLACE_BUILDERS.castle(b, size);
}

function buildTrain(b, size) {
  const s = size;
  b.box(s * 6.5, s * 0.65, s * 1.65, 0, s * 0.85, 0, FAMILY.IRON, C.iron, 0, BEVEL_S);
  rotCylinder(b, s * 0.72, s * 0.72, s * 3.6, 16, s * 1.05, s * 1.75, 0,
    FAMILY.IRON, C.steel, 0, 0, Math.PI / 2);
  b.box(s * 1.9, s * 2.15, s * 1.55, -s * 1.65, s * 1.8, 0, FAMILY.IRON, C.iron, 0, BEVEL_S);
  b.box(s * 0.35, s * 1.55, s * 0.35, s * 2.1, s * 2.65, 0, FAMILY.IRON, C.iron, 0, BEVEL_S);
  b.cone(s * 0.38, s * 0.65, 12, s * 2.1, s * 3.75, 0, FAMILY.IRON, C.steel);
  for (const x of [-2.35, -0.75, 0.9, 2.35]) {
    for (const z of [-0.9, 0.9]) rotCylinder(b, s * 0.52, s * 0.52, s * 0.22, 12,
      x * s, s * 0.48, z * s, FAMILY.IRON, C.iron, Math.PI / 2, 0, 0);
  }
  for (const x of [-2.15, -1.45]) b.box(s * 0.5, s * 0.55, s * 0.08, x * s, s * 2.15, s * 0.82,
    FAMILY.CRYSTAL, C.crystalB, 0, BEVEL_S);
  b.height = s * 4.1; b.radius = s * 3.8;
}

function buildCar(b, size) {
  const s = size;
  b.box(s * 4.0, s * 0.75, s * 1.8, 0, s * 0.9, 0, FAMILY.IRON, C.steel, 0, BEVEL_S);
  b.box(s * 2.15, s * 0.9, s * 1.55, -s * 0.2, s * 1.65, 0, FAMILY.IRON, C.iron, 0, BEVEL_S);
  b.box(s * 0.9, s * 0.48, s * 0.08, s * 0.45, s * 1.75, s * 0.81, FAMILY.CRYSTAL, C.crystalB, 0, BEVEL_S);
  b.box(s * 0.7, s * 0.45, s * 0.08, -s * 0.85, s * 1.75, s * 0.81, FAMILY.CRYSTAL, C.crystalB, 0, BEVEL_S);
  for (const x of [-1.35, 1.35]) for (const z of [-0.98, 0.98]) {
    rotCylinder(b, s * 0.48, s * 0.48, s * 0.28, 12, x * s, s * 0.55, z * s,
      FAMILY.IRON, C.iron, Math.PI / 2, 0, 0);
  }
  b.height = s * 2.2; b.radius = s * 2.5;
}

function buildGoblin(b, size) {
  const s = size;
  sphere(b, s * 0.48, 0, s * 2.35, 0, FAMILY.FOLIAGE, C.canopyLow, 0.9, 0.85, 0.85);
  b.cone(s * 0.20, s * 0.48, 5, -s * 0.48, s * 2.42, 0, FAMILY.FOLIAGE, C.leafHi, 0, true);
  b.cone(s * 0.20, s * 0.48, 5, s * 0.48, s * 2.42, 0, FAMILY.FOLIAGE, C.leafHi, 0, true);
  b.cyl(s * 0.52, s * 0.38, s * 1.15, 8, 0, s * 1.42, 0, FAMILY.LEATHER, C.timber);
  for (const x of [-0.30, 0.30]) rotCylinder(b, s * 0.13, s * 0.18, s * 1.0, 7,
    x * s, s * 0.55, 0, FAMILY.FOLIAGE, C.canopyLow, 0, 0, x * 0.18);
  for (const x of [-0.68, 0.68]) rotCylinder(b, s * 0.10, s * 0.15, s * 1.0, 7,
    x * s, s * 1.45, 0, FAMILY.FOLIAGE, C.canopyLow, 0, 0, x * 0.55);
  rotCylinder(b, s * 0.06, s * 0.06, s * 2.2, 8, s * 0.9, s * 1.45, 0,
    FAMILY.IRON, C.steel, 0, 0, -0.35);
  b.height = s * 2.9; b.radius = s * 1.3;
}

function buildDragon(b, size) {
  const s = size;
  sphere(b, s * 1.0, 0, s * 1.8, 0, FAMILY.FOLIAGE, C.canopyLow, 1.65, 0.72, 0.68);
  sphere(b, s * 0.65, 0, s * 2.05, s * 1.55, FAMILY.FOLIAGE, C.canopyHi, 0.9, 0.8, 1.2);
  b.cone(s * 0.46, s * 1.3, 7, 0, s * 2.08, s * 2.55, FAMILY.FOLIAGE, C.canopyHi, Math.PI, true);
  for (let i = 0; i < 4; i++) b.cone(s * (0.42 - i * 0.05), s * 1.45, 7, 0,
    s * (1.75 - i * 0.10), -s * (1.6 + i * 0.8), FAMILY.FOLIAGE, C.canopyLow, 0, true);
  wing(b, -1, s * 2.25, -s * 0.25, FAMILY.LEATHER, C.roof, s * 4.8);
  wing(b, 1, s * 2.25, -s * 0.25, FAMILY.LEATHER, C.roof, s * 4.8);
  for (const x of [-0.75, 0.75]) for (const z of [-0.55, 0.65]) rotCylinder(b,
    s * 0.15, s * 0.24, s * 1.45, 7, x * s, s * 0.82, z * s,
    FAMILY.FOLIAGE, C.canopyLow, 0.22, 0, x * 0.15);
  for (const x of [-0.22, 0.22]) b.cone(s * 0.12, s * 0.75, 6, x * s, s * 2.72,
    s * 1.62, FAMILY.IRON, C.iron, 0, true);
  b.height = s * 3.1; b.radius = s * 5.1;
}

function buildCave(b, size) {
  const s = size;
  for (let i = 0; i < 11; i++) {
    const a = Math.PI * (0.05 + i / 10 * 0.90);
    const x = Math.cos(a) * s * 2.8;
    const y = Math.sin(a) * s * 2.45;
    b.chunk(s * (0.72 + (i % 3) * 0.12), x, y, 0, FAMILY.STONE, i % 2 ? C.body : C.bodyMid,
      i * 0.17, i * 0.31, i * 0.11, 1.25, 0.9, 1.45);
  }
  b.box(s * 3.2, s * 2.35, s * 0.45, 0, s * 1.15, s * 0.55,
    FAMILY.STONE, C.base, 0, BEVEL_S);
  for (let i = 0; i < 5; i++) b.cone(s * 0.18, s * (0.55 + i * 0.12), 6,
    (i - 2) * s * 0.5, s * 2.05, s * 0.28, FAMILY.ROCK_WET, C.steel, Math.PI, true);
  b.height = s * 3.5; b.radius = s * 3.5;
}

function buildPortal(b, size) {
  const s = size;
  torus(b, s * 2.05, s * 0.34, 0, s * 2.45, 0, FAMILY.CRYSTAL, C.crystalA);
  torus(b, s * 1.62, s * 0.10, 0, s * 2.45, s * 0.05, FAMILY.GOLD, C.gold);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    b.chunk(s * 0.24, Math.cos(a) * s * 2.65, s * 2.45 + Math.sin(a) * s * 2.65, 0,
      FAMILY.CRYSTAL, i % 2 ? C.crystalA : C.crystalB, a, a * 0.7, a * 0.3, 0.8, 1.4, 0.8);
  }
  b.box(s * 4.8, s * 0.45, s * 2.3, 0, s * 0.2, 0, FAMILY.STONE, C.base, 0, BEVEL_S);
  b.height = s * 5.2; b.radius = s * 3.0;
}

function buildTerrain(b, size, recipe) {
  const id = recipe.archetype;
  const count = id === 'plain' ? 5 : id === 'archipelago' ? 12 : 9;
  for (let i = 0; i < count; i++) {
    const a = i / count * Math.PI * 2;
    const mountain = id === 'mountain';
    const valley = id === 'valley';
    const desert = id === 'desert';
    const r = size * (mountain ? 0.9 + (i % 3) * 0.4 : 0.55 + (i % 3) * 0.22);
    const ring = valley ? size * 2.2 : id === 'continent' ? size * 1.0 : size * 1.55;
    const x = Math.cos(a) * ring * (id === 'peninsula' ? 1.65 : 1);
    const z = Math.sin(a) * ring * (id === 'island' ? 0.8 : 1);
    const h = mountain ? r * (1.2 + (i % 2)) : id === 'plain' ? r * 0.25 : r * 0.58;
    b.chunk(r, x, h, z, desert ? FAMILY.TIMBER : (i % 3 === 0 ? FAMILY.ROCK_WET : FAMILY.STONE),
      desert ? C.timberLt : (i % 2 ? C.body : C.bodyMid), a * 0.2, a, a * 0.1,
      id === 'peninsula' ? 1.8 : 1.35, h / Math.max(r, 0.01), id === 'archipelago' ? 0.8 : 1.15);
  }
  b.height = size * (id === 'mountain' ? 4.2 : 2.6); b.radius = size * (id === 'continent' ? 4.2 : 3.0);
}

function buildAtmosphere(b, size, recipe) {
  const id = recipe.archetype;
  if (id === 'celestial_body') {
    sphere(b, size * 1.5, 0, size * 2.1, 0, FAMILY.CRYSTAL, C.crystalB, 1, 1, 1, 2);
    torus(b, size * 2.1, size * 0.10, 0, size * 2.1, 0, FAMILY.GOLD, C.gold, Math.PI / 2.5);
  } else if (id === 'aurora') {
    for (let i = 0; i < 7; i++) b.box(size * 0.18, size * (2.2 + (i % 3)), size * 0.12,
      (i - 3) * size * 0.65, size * 2.0, Math.sin(i) * size * 0.6,
      FAMILY.CRYSTAL, i % 2 ? C.crystalA : C.crystalB, i * 0.16, BEVEL_S);
  } else if (['sea', 'river', 'waterfall'].includes(id)) {
    const n = id === 'river' ? 7 : 4;
    for (let i = 0; i < n; i++) b.box(id === 'river' ? size * 2.4 : size * 4.8,
      id === 'waterfall' ? size * 2.4 : size * 0.16,
      id === 'river' ? size * 0.8 : size * 2.8,
      id === 'river' ? (i - 3) * size * 1.8 : 0,
      id === 'waterfall' ? size * (1.2 + i * 1.1) : size * 0.12,
      id === 'river' ? Math.sin(i * 0.9) * size : 0,
      FAMILY.CRYSTAL, i % 2 ? C.crystalA : C.crystalB, id === 'river' ? Math.sin(i) * 0.25 : 0, BEVEL_S);
  } else {
    for (let i = 0; i < 9; i++) sphere(b, size * (0.62 + (i % 3) * 0.20),
      (i - 4) * size * 0.68, size * (1.4 + (i % 2) * 0.32), ((i % 3) - 1) * size * 0.48,
      FAMILY.CRYSTAL, id === 'storm' ? C.steel : (i % 2 ? C.crystalA : C.crystalB), 1.3, 0.62, 0.9, 1);
  }
  b.height = size * (id === 'aurora' ? 5.2 : 3.8); b.radius = size * 4.0;
}

function buildEcology(b, size, recipe) {
  const id = recipe.archetype;
  if (id === 'giant_tree') {
    b.cyl(size * 0.65, size * 0.35, size * 5.8, 10, 0, size * 2.9, 0, FAMILY.TIMBER, C.trunk);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      sphere(b, size * 1.35, Math.cos(a) * size * 1.2, size * (5.1 + (i % 2) * 0.7),
        Math.sin(a) * size * 1.2, FAMILY.FOLIAGE, i % 2 ? C.canopyLow : C.canopyHi, 1.2, 1.0, 1.2);
    }
    b.height = size * 7; b.radius = size * 3.2; return;
  }
  if (['farm', 'flower_field', 'grassland', 'garden'].includes(id)) {
    for (let i = 0; i < 18; i++) {
      const x = (i % 6 - 2.5) * size * 0.72;
      const z = (Math.floor(i / 6) - 1) * size * 0.9;
      b.cyl(size * 0.05, size * 0.02, size * (id === 'grassland' ? 0.45 : 0.75), 5,
        x, size * 0.34, z, FAMILY.FOLIAGE, i % 2 ? C.canopyHi : C.leafHi, 0, true);
    }
    if (id === 'garden') for (const x of [-2.2, 2.2]) b.box(size * 0.28, size * 0.6, size * 4.0,
      x * size, size * 0.3, 0, FAMILY.FOLIAGE, C.canopyLow, 0, BEVEL_S);
    b.height = size; b.radius = size * 3.1; return;
  }
  const mushroom = id === 'mushroom_grove';
  const coral = id === 'coral_reef';
  const swamp = id === 'swamp';
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const h = size * (swamp ? 1.0 : 1.7 + (i % 3) * 0.55);
    b.cyl(size * (mushroom ? 0.20 : 0.14), size * 0.08, h, 7,
      Math.cos(a) * size * 1.4, h / 2, Math.sin(a) * size * 1.4,
      coral ? FAMILY.CRYSTAL : FAMILY.TIMBER, coral ? C.crystalA : C.trunk, a, true);
    if (mushroom) sphere(b, size * 0.62, Math.cos(a) * size * 1.4, h, Math.sin(a) * size * 1.4,
      FAMILY.FOLIAGE, i % 2 ? C.roof : C.canopyHi, 1.0, 0.35, 1.0);
    else if (!swamp) sphere(b, size * 0.7, Math.cos(a) * size * 1.4, h, Math.sin(a) * size * 1.4,
      coral ? FAMILY.CRYSTAL : FAMILY.FOLIAGE, coral ? C.crystalB : (i % 2 ? C.canopyLow : C.canopyHi), 1, 1.2, 1);
  }
  b.height = size * 3.8; b.radius = size * 2.7;
}

function buildBuilding(b, size, recipe) {
  const id = recipe.archetype;
  if (id === 'wall') {
    b.box(size * 7.2, size * 2.8, size * 0.8, 0, size * 1.4, 0, FAMILY.STONE, C.body);
    for (let i = -5; i <= 5; i++) b.box(size * 0.45, size * 0.55, size * 1.0,
      i * size * 0.65, size * 3.05, 0, FAMILY.STONE, C.bodyMid, 0, BEVEL_S);
    b.height = size * 3.4; b.radius = size * 4.0; return;
  }
  if (id === 'watchtower') {
    b.cyl(size * 1.3, size * 1.05, size * 5.4, 12, 0, size * 2.7, 0, FAMILY.STONE, C.body);
    b.band(size * 1.42, size * 5.0); b.crenellation(size * 5.35, 12, size * 1.2);
    b.height = size * 6; b.radius = size * 1.8; return;
  }
  if (id === 'arena') {
    torus(b, size * 3.0, size * 0.65, 0, size * 0.75, 0, FAMILY.STONE, C.body, Math.PI / 2);
    torus(b, size * 2.1, size * 0.28, 0, size * 1.35, 0, FAMILY.STONE, C.bodyMid, Math.PI / 2);
    b.height = size * 1.8; b.radius = size * 3.8; return;
  }
  const sacred = ['temple', 'cathedral', 'monastery', 'shrine'].includes(id);
  const civic = ['palace', 'city_hall', 'manor', 'library', 'school', 'hospital', 'prison'].includes(id);
  const small = ['hut', 'house', 'inn'].includes(id);
  const wide = id === 'market' ? 1.5 : civic ? 1.25 : 1;
  b.box(size * 3.8 * wide, size * (small ? 2.2 : 2.9), size * 3.2, 0,
    size * (small ? 1.1 : 1.45), 0, FAMILY.STONE, C.body);
  b.gable(size * 4.3 * wide, size * (sacred ? 2.0 : 1.45), size * 3.7, 0,
    size * (sacred ? 4.0 : small ? 2.75 : 3.6), 0, FAMILY.TIMBER, C.roof);
  if (sacred) {
    b.cyl(size * 0.55, size * 0.38, size * 3.0, 10, 0, size * 4.6, 0, FAMILY.STONE, C.bodyMid);
    b.cone(size * 0.52, size * 1.5, 10, 0, size * 6.75, 0, FAMILY.GOLD, C.gold);
  }
  if (id === 'market') for (const x of [-2.3, 0, 2.3]) b.gable(size * 1.8, size * 0.7, size * 1.6,
    x * size, size * 2.4, size * 2.1, FAMILY.LEATHER, x ? C.roof : C.banner);
  b.ledge(size * 4.15 * wide, size * 3.5, size * 0.25);
  b.opening(size * 0.8, size * 1.35, 0, size * 0.85, size * 1.65, 0, C.mortar);
  b.height = size * (sacred ? 7.5 : 4.5); b.radius = size * 2.8 * wide;
}

function buildInterior(b, size, recipe) {
  const id = recipe.archetype;
  b.box(size * 5.2, size * 0.25, size * 4.2, 0, size * 0.12, 0, FAMILY.STONE, C.base, 0, BEVEL_S);
  b.box(size * 0.25, size * 2.8, size * 4.2, -size * 2.48, size * 1.4, 0, FAMILY.STONE, C.body, 0, BEVEL_S);
  b.box(size * 5.2, size * 2.8, size * 0.25, 0, size * 1.4, -size * 1.98, FAMILY.STONE, C.body, 0, BEVEL_S);
  if (['archive', 'laboratory', 'workshop'].includes(id)) {
    for (const x of [-1.5, 0, 1.5]) b.box(size * 0.75, size * 2.0, size * 0.45,
      x * size, size * 1.1, -size * 1.55, id === 'laboratory' ? FAMILY.CRYSTAL : FAMILY.TIMBER,
      id === 'laboratory' ? C.crystalA : C.timber, 0, BEVEL_S);
  } else if (id === 'prison_cell') {
    for (let i = -3; i <= 3; i++) b.cyl(size * 0.06, size * 0.06, size * 2.6, 6,
      i * size * 0.45, size * 1.35, size * 1.45, FAMILY.IRON, C.iron);
  } else if (id === 'engine_room') {
    for (const x of [-1.2, 1.2]) torus(b, size * 0.75, size * 0.16, x * size, size * 1.35,
      -size * 1.5, FAMILY.IRON, C.steel, 0, 0, Math.PI / 2);
  } else if (id === 'ritual_room') {
    for (let i = 0; i < 3; i++) torus(b, size * (0.7 + i * 0.45), size * 0.06,
      0, size * 0.3, 0, FAMILY.CRYSTAL, i % 2 ? C.crystalA : C.gold, Math.PI / 2);
  } else {
    const throne = id === 'throne_room';
    b.box(size * (throne ? 1.4 : 2.2), size * 0.18, size * 1.1, 0,
      size * 1.0, 0, FAMILY.TIMBER, C.timber, 0, BEVEL_S);
    if (throne) b.box(size * 1.3, size * 2.0, size * 0.3, 0, size * 1.55,
      -size * 0.45, FAMILY.GOLD, C.gold, 0, BEVEL_S);
    for (const x of [-0.8, 0.8]) b.cyl(size * 0.12, size * 0.12, size * 0.9, 7,
      x * size, size * 0.52, 0, FAMILY.TIMBER, C.timber);
  }
  b.height = size * 3; b.radius = size * 3;
}

function buildInfrastructure(b, size, recipe) {
  const id = recipe.archetype;
  if (['road', 'railway', 'canal'].includes(id)) {
    b.box(size * 8.0, size * 0.22, size * (id === 'canal' ? 2.5 : 1.8), 0, size * 0.12, 0,
      id === 'canal' ? FAMILY.CRYSTAL : FAMILY.STONE, id === 'canal' ? C.crystalB : C.body, 0, BEVEL_S);
    if (id === 'railway') for (const z of [-0.62, 0.62]) b.box(size * 8.2, size * 0.16, size * 0.12,
      0, size * 0.30, z * size, FAMILY.IRON, C.steel, 0, BEVEL_S);
    b.height = size * 0.6; b.radius = size * 4.5; return;
  }
  if (['tunnel', 'mine'].includes(id)) { buildCave(b, size); return; }
  if (id === 'station') { buildBuilding(b, size, { archetype: 'city_hall' }); return; }
  if (['factory', 'power_plant'].includes(id)) {
    b.box(size * 5.5, size * 2.4, size * 3.8, 0, size * 1.2, 0, FAMILY.IRON, C.iron);
    for (const x of [-1.7, 1.7]) b.cyl(size * 0.55, size * 0.38, size * (id === 'power_plant' ? 5.2 : 3.8),
      12, x * size, size * 2.6, 0, FAMILY.IRON, C.steel);
    b.height = size * 5.4; b.radius = size * 3.4; return;
  }
  if (id === 'harbor') {
    for (const x of [-2.5, 0, 2.5]) b.box(size * 1.6, size * 0.22, size * 5.8,
      x * size, size * 0.2, 0, FAMILY.TIMBER, C.timber, 0, BEVEL_S);
    for (const x of [-2.5, 2.5]) rotCylinder(b, size * 0.10, size * 0.10, size * 4,
      7, x * size, size * 2.0, -size * 2.0, FAMILY.IRON, C.iron, 0, 0, x * 0.08);
    b.height = size * 4; b.radius = size * 4; return;
  }
  b.box(size * 7.0, size * 0.42, size * 2.0, 0, size * 1.65, 0, FAMILY.STONE, C.body, 0, BEVEL_S);
  for (const x of [-2.4, 0, 2.4]) b.cyl(size * 0.5, size * 0.42, size * (id === 'aqueduct' ? 3.0 : 1.7),
    10, x * size, size * (id === 'aqueduct' ? 1.45 : 0.8), 0, FAMILY.STONE, C.bodyMid);
  for (const z of [-0.72, 0.72]) b.box(size * 7.1, size * 0.16, size * 0.18, 0,
    size * 1.98, z * size, FAMILY.IRON, C.iron, 0, BEVEL_S);
  b.height = size * (id === 'aqueduct' ? 3.4 : 2.1); b.radius = size * 4;
}

function buildVehicle(b, size, recipe) {
  const id = recipe.archetype;
  if (['wagon', 'carriage', 'motorcycle', 'bicycle'].includes(id)) {
    const wheels = ['motorcycle', 'bicycle'].includes(id) ? [-1.1, 1.1] : [-1.4, 1.4];
    b.box(size * (id === 'carriage' ? 3.2 : 2.5), size * 0.6, size * (id === 'bicycle' ? 0.35 : 1.5),
      0, size * 1.05, 0, id === 'motorcycle' ? FAMILY.IRON : FAMILY.TIMBER,
      id === 'motorcycle' ? C.steel : C.timber, 0, BEVEL_S);
    for (const x of wheels) for (const z of (id === 'bicycle' || id === 'motorcycle' ? [0] : [-0.82, 0.82]))
      rotCylinder(b, size * 0.62, size * 0.62, size * 0.18, 12, x * size, size * 0.58, z * size,
        FAMILY.IRON, C.iron, Math.PI / 2);
    if (id === 'carriage') b.gable(size * 2.5, size, size * 1.5, 0, size * 2.1, 0, FAMILY.LEATHER, C.roof);
    b.height = size * 2.8; b.radius = size * 2.4; return;
  }
  if (['ship', 'boat'].includes(id)) {
    b.box(size * (id === 'ship' ? 6.5 : 4.0), size * 0.8, size * 2.0, 0, size * 0.7, 0,
      FAMILY.TIMBER, C.timber, 0, BEVEL_S);
    const mast = id === 'ship' ? 3.8 : 2.4;
    b.cyl(size * 0.12, size * 0.10, size * mast, 8, 0, size * (0.9 + mast / 2), 0,
      FAMILY.TIMBER, C.trunk);
    b.box(size * 0.10, size * 2.1, size * 2.6, 0, size * 2.6, 0, FAMILY.LEATHER, C.banner, 0, BEVEL_S);
    b.height = size * 4.8; b.radius = size * 3.8; return;
  }
  if (id === 'airship') {
    sphere(b, size * 1.5, 0, size * 3.2, 0, FAMILY.LEATHER, C.timberLt, 2.6, 1.0, 1.0, 2);
    b.box(size * 3.0, size * 0.8, size * 1.2, 0, size * 1.2, 0, FAMILY.TIMBER, C.timber, 0, BEVEL_S);
    b.height = size * 4.8; b.radius = size * 4.2; return;
  }
  if (['aircraft', 'spacecraft'].includes(id)) {
    sphere(b, size * 0.8, 0, size * 1.2, 0, FAMILY.IRON, C.steel, 2.8, 0.65, 0.75, 1);
    b.box(size * 1.4, size * 0.16, size * 7.0, 0, size * 1.2, 0, FAMILY.IRON, C.iron, 0, BEVEL_S);
    b.cone(size * 0.7, size * 2.2, 8, 0, size * 1.2, size * 2.7, FAMILY.IRON, C.steel, Math.PI / 2, true);
    b.height = size * 2.2; b.radius = size * 4.0; return;
  }
  buildCar(b, size);
}

function buildHumanoid(b, size, recipe) {
  const id = recipe.archetype;
  const stature = id === 'giant' ? 1.85 : id === 'troll' ? 1.45 : id === 'dwarf' ? 0.72 : 1;
  const s = size * stature;
  const skinFam = id === 'automaton' ? FAMILY.IRON : id === 'undead' ? FAMILY.STONE : FAMILY.LEATHER;
  const skin = id === 'automaton' ? C.steel : id === 'undead' ? C.mortar : C.timberLt;
  sphere(b, s * 0.38, 0, s * 2.45, 0, skinFam, skin, 1, 1, 1);
  if (id === 'elf') for (const x of [-0.42, 0.42]) b.cone(s * 0.12, s * 0.42, 5,
    x * s, s * 2.5, 0, skinFam, skin, 0, true);
  if (['orc', 'troll'].includes(id)) for (const x of [-0.18, 0.18]) b.cone(s * 0.08, s * 0.30, 5,
    x * s, s * 2.25, s * 0.36, FAMILY.IRON, C.steel, Math.PI, true);
  b.cyl(s * 0.48, s * 0.32, s * 1.25, 8, 0, s * 1.5, 0, id === 'automaton' ? FAMILY.IRON : FAMILY.LEATHER,
    id === 'automaton' ? C.iron : C.roof);
  for (const x of [-0.26, 0.26]) rotCylinder(b, s * 0.12, s * 0.16, s * 1.15, 7,
    x * s, s * 0.58, 0, skinFam, skin, 0, 0, x * 0.14);
  for (const x of [-0.62, 0.62]) rotCylinder(b, s * 0.10, s * 0.14, s * 1.2, 7,
    x * s, s * 1.55, 0, skinFam, skin, 0, 0, x * 0.42);
  b.height = s * 2.9; b.radius = s * 1.0;
}

function buildCreature(b, size, recipe) {
  const id = recipe.archetype;
  if (['serpent', 'kraken', 'leviathan'].includes(id)) {
    const segments = id === 'kraken' ? 10 : 7;
    for (let i = 0; i < segments; i++) {
      const a = id === 'kraken' ? i / segments * Math.PI * 2 : i * 0.45;
      sphere(b, size * (0.62 - Math.min(i, 6) * 0.05),
        id === 'kraken' ? Math.cos(a) * size * (0.8 + i * 0.16) : (i - 3) * size * 0.7,
        size * (0.55 + Math.sin(a) * 0.4), id === 'kraken' ? Math.sin(a) * size * (0.8 + i * 0.16) : Math.sin(i) * size * 0.5,
        FAMILY.FOLIAGE, i % 2 ? C.canopyLow : C.canopyHi, 1.2, 0.8, 1.2);
    }
    b.height = size * 2; b.radius = size * 4; return;
  }
  if (id === 'spider') {
    sphere(b, size * 0.9, 0, size * 0.8, 0, FAMILY.LEATHER, C.iron, 1.2, 0.8, 1.4);
    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? -1 : 1; const z = (i % 4 - 1.5) * size * 0.5;
      rotCylinder(b, size * 0.08, size * 0.12, size * 2.2, 6, side * size * 1.0,
        size * 0.65, z, FAMILY.IRON, C.iron, 0, 0, side * 1.05);
    }
    b.height = size * 1.8; b.radius = size * 2.5; return;
  }
  if (id === 'slime' || id === 'insect_swarm') {
    const count = id === 'slime' ? 4 : 18;
    for (let i = 0; i < count; i++) sphere(b, size * (id === 'slime' ? 0.58 : 0.13),
      Math.cos(i * 2.1) * size * (0.4 + i / count * 1.8), size * (0.4 + (i % 4) * 0.28),
      Math.sin(i * 2.1) * size * (0.4 + i / count * 1.8), id === 'slime' ? FAMILY.CRYSTAL : FAMILY.FOLIAGE,
      id === 'slime' ? C.crystalA : C.iron, 1, id === 'slime' ? 0.7 : 1, 1, 0);
    b.height = size * 1.8; b.radius = size * 2.6; return;
  }
  const winged = ['wyvern', 'griffin', 'phoenix', 'pegasus'].includes(id);
  const stone = id === 'golem';
  const s = size * (id === 'bear' || id === 'chimera' ? 1.25 : 1);
  sphere(b, s * 0.8, 0, s * 1.25, 0, stone ? FAMILY.STONE : FAMILY.FOLIAGE,
    stone ? C.body : C.canopyLow, 1.4, 0.75, 0.75);
  sphere(b, s * 0.48, 0, s * 1.45, s * 1.15, stone ? FAMILY.STONE : FAMILY.FOLIAGE,
    stone ? C.bodyMid : C.canopyHi, 0.9, 0.9, 1.0);
  for (const x of [-0.52, 0.52]) for (const z of [-0.55, 0.55]) rotCylinder(b,
    s * 0.12, s * 0.17, s * 1.0, 7, x * s, s * 0.55, z * s,
    stone ? FAMILY.STONE : FAMILY.FOLIAGE, stone ? C.body : C.canopyLow, 0, 0, x * 0.12);
  b.cone(s * 0.32, s * 1.2, 7, 0, s * 1.28, -s * 1.3, stone ? FAMILY.STONE : FAMILY.FOLIAGE,
    stone ? C.bodyMid : C.canopyLow, 0, true);
  if (winged) { wing(b, -1, s * 1.7, 0, FAMILY.LEATHER, C.roof, s * 2.6); wing(b, 1, s * 1.7, 0, FAMILY.LEATHER, C.roof, s * 2.6); }
  if (id === 'unicorn') b.cone(s * 0.10, s * 0.85, 7, 0, s * 2.0, s * 1.35, FAMILY.GOLD, C.gold, 0, true);
  b.height = s * (winged ? 2.8 : 2.0); b.radius = s * (winged ? 3.2 : 2.2);
}

function buildProp(b, size, recipe) {
  const id = recipe.archetype;
  const s = size;
  if (['sword', 'spear', 'axe', 'bow', 'staff', 'wand'].includes(id)) {
    const long = ['spear', 'staff'].includes(id) ? 4.5 : id === 'wand' ? 1.8 : 3.2;
    b.box(s * (id === 'bow' ? 0.16 : 0.36), s * long, s * 0.16, 0, s * long / 2,
      0, id === 'staff' || id === 'bow' ? FAMILY.TIMBER : FAMILY.IRON,
      id === 'staff' || id === 'bow' ? C.timber : C.steel, 0, BEVEL_S);
    if (id === 'axe') b.box(s * 1.4, s * 0.75, s * 0.22, s * 0.45, s * (long - 0.4), 0,
      FAMILY.IRON, C.steel, 0, BEVEL_S);
    else if (id === 'sword') b.box(s * 1.6, s * 0.25, s * 0.24, 0, s * 0.5, 0, FAMILY.GOLD, C.gold, 0, BEVEL_S);
    else if (['staff', 'wand'].includes(id)) sphere(b, s * 0.28, 0, s * long, 0, FAMILY.CRYSTAL, C.crystalA);
    else if (id === 'bow') torus(b, s * 1.3, s * 0.08, 0, s * 1.8, 0, FAMILY.TIMBER, C.timber, 0, Math.PI / 2);
    b.height = s * (long + 0.4); b.radius = s * 1.2; return;
  }
  if (['shield', 'armor', 'helmet', 'crown', 'ring', 'amulet'].includes(id)) {
    if (id === 'ring') torus(b, s * 0.9, s * 0.18, 0, s * 1.1, 0, FAMILY.GOLD, C.gold);
    else if (id === 'crown') for (let i = 0; i < 7; i++) b.cone(s * 0.18, s * 0.85, 5,
      (i - 3) * s * 0.32, s * 1.2, 0, FAMILY.GOLD, C.gold);
    else if (id === 'amulet') { torus(b, s * 0.75, s * 0.08, 0, s * 1.4, 0, FAMILY.GOLD, C.gold); sphere(b, s * 0.35, 0, s * 0.65, 0, FAMILY.CRYSTAL, C.crystalA); }
    else if (id === 'helmet') sphere(b, s, 0, s * 1.1, 0, FAMILY.IRON, C.steel, 1, 0.75, 1);
    else if (id === 'armor') { b.box(s * 1.6, s * 2.2, s * 0.65, 0, s * 1.3, 0, FAMILY.IRON, C.steel); sphere(b, s * 0.75, 0, s * 2.75, 0, FAMILY.IRON, C.iron); }
    else b.cyl(s * 1.25, s * 1.0, s * 0.35, 12, 0, s * 1.25, 0, FAMILY.IRON, C.steel, 0, true);
    b.height = s * 3.5; b.radius = s * 1.5; return;
  }
  if (['book', 'scroll', 'map', 'key'].includes(id)) {
    if (id === 'key') { torus(b, s * 0.55, s * 0.12, 0, s * 2.3, 0, FAMILY.GOLD, C.gold); b.box(s * 0.22, s * 2.3, s * 0.18, 0, s * 1.0, 0, FAMILY.GOLD, C.gold, 0, BEVEL_S); }
    else if (id === 'scroll') { for (const x of [-1, 1]) b.cyl(s * 0.14, s * 0.14, s * 2.3, 8, x * s, s * 0.25, 0, FAMILY.TIMBER, C.timber, Math.PI / 2); b.box(s * 2.1, s * 0.12, s * 1.5, 0, s * 0.25, 0, FAMILY.LEATHER, C.timberLt, 0, BEVEL_S); }
    else b.box(s * 2.5, s * 0.28, s * 1.8, 0, s * 0.35, 0, FAMILY.LEATHER, C.roof, 0, BEVEL_S);
    b.height = s * 2.9; b.radius = s * 1.6; return;
  }
  if (['chest', 'bottle', 'lantern', 'torch'].includes(id)) {
    if (id === 'chest') { b.box(s * 2.4, s * 1.4, s * 1.5, 0, s * 0.7, 0, FAMILY.TIMBER, C.timber); b.band(s * 0.9, s * 1.4, FAMILY.IRON, C.iron); }
    else if (id === 'bottle') { b.cyl(s * 0.55, s * 0.36, s * 1.6, 12, 0, s * 0.8, 0, FAMILY.CRYSTAL, C.crystalB); b.cyl(s * 0.2, s * 0.2, s * 0.8, 10, 0, s * 1.9, 0, FAMILY.CRYSTAL, C.crystalA); }
    else { b.cyl(s * 0.12, s * 0.12, s * 2.5, 7, 0, s * 1.25, 0, FAMILY.TIMBER, C.timber); sphere(b, s * 0.42, 0, s * 2.65, 0, FAMILY.CRYSTAL, C.gold); }
    b.height = s * 3.2; b.radius = s * 1.5; return;
  }
  if (['table', 'chair', 'bed'].includes(id)) {
    b.box(s * (id === 'bed' ? 3.8 : 2.5), s * 0.25, s * (id === 'chair' ? 1.4 : 2.0),
      0, s * 1.1, 0, FAMILY.TIMBER, C.timber, 0, BEVEL_S);
    for (const x of [-0.9, 0.9]) for (const z of [-0.6, 0.6]) b.cyl(s * 0.10, s * 0.10, s,
      x * s, s * 0.55, z * s, FAMILY.TIMBER, C.timber);
    if (id !== 'table') b.box(s * (id === 'bed' ? 3.8 : 2.3), s * 1.6, s * 0.25,
      0, s * 1.8, -s * 0.8, FAMILY.TIMBER, C.timber, 0, BEVEL_S);
    b.height = s * 2.7; b.radius = s * 2.4; return;
  }
  if (['banner', 'statue', 'altar'].includes(id)) {
    b.box(s * 2.8, s * 0.45, s * 2.1, 0, s * 0.22, 0, FAMILY.STONE, C.base, 0, BEVEL_S);
    if (id === 'banner') { b.cyl(s * 0.10, s * 0.10, s * 4.2, 8, 0, s * 2.3, 0, FAMILY.TIMBER, C.trunk); b.box(s * 2.2, s * 1.4, s * 0.10, s * 1.1, s * 3.6, 0, FAMILY.LEATHER, C.banner, 0, BEVEL_S); }
    else if (id === 'statue') buildHumanoid(b, s * 0.8, { archetype: 'human' });
    else b.box(s * 2.2, s * 1.1, s * 1.4, 0, s * 0.9, 0, FAMILY.STONE, C.body);
    b.height = s * 4.8; b.radius = s * 2.0; return;
  }
  if (id === 'machine' || id === 'instrument') {
    b.box(s * 2.8, s * 1.8, s * 1.8, 0, s * 0.9, 0, FAMILY.IRON, C.iron);
    for (const x of [-0.85, 0.85]) torus(b, s * 0.58, s * 0.14, x * s, s * 1.2,
      s * 0.95, FAMILY.GOLD, C.gold, 0, 0, Math.PI / 2);
    if (id === 'instrument') for (let i = -2; i <= 2; i++) b.box(s * 0.12, s * (1.2 + (i + 2) * 0.25), s * 0.12,
      i * s * 0.32, s * 2.2, 0, FAMILY.TIMBER, C.timber, 0, BEVEL_S);
    b.height = s * 3.8; b.radius = s * 2.0; return;
  }
  b.box(s * 2.4, s * 1.4, s * 1.5, 0, s * 0.7, 0, FAMILY.TIMBER, C.timber);
  b.height = s * 1.8; b.radius = s * 1.6;
}

function buildMagic(b, size, recipe) {
  const id = recipe.archetype;
  if (['rift', 'spell', 'curse', 'blessing'].includes(id)) {
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2;
      b.chunk(size * 0.20, Math.cos(a) * size * (1.0 + i * 0.14), size * (0.5 + (i % 3) * 0.55),
        Math.sin(a) * size * (1.0 + i * 0.14), FAMILY.CRYSTAL,
        id === 'curse' ? C.roof : (i % 2 ? C.crystalA : C.gold), a, a * 0.6, a * 0.3, 0.7, 1.8, 0.7);
    }
    b.height = size * 2.8; b.radius = size * 2.8; return;
  }
  if (['magic_circle', 'force_field'].includes(id)) {
    for (let i = 0; i < 4; i++) torus(b, size * (0.7 + i * 0.45), size * 0.07,
      0, id === 'force_field' ? size * 1.8 : size * 0.18, 0, FAMILY.CRYSTAL,
      i % 2 ? C.crystalA : C.gold, id === 'force_field' ? 0 : Math.PI / 2, i * 0.3, 0);
    b.height = size * (id === 'force_field' ? 3.8 : 0.8); b.radius = size * 2.4; return;
  }
  if (id === 'hologram') { buildEpistemic(b, size, { archetype: 'overlapping_version' }); return; }
  buildPortal(b, size);
}

function buildEvent(b, size, recipe) {
  const id = recipe.archetype;
  if (['flood', 'avalanche', 'migration', 'parade'].includes(id)) {
    for (let i = 0; i < 10; i++) b.chunk(size * (0.25 + (i % 3) * 0.10),
      (i - 4.5) * size * 0.6, size * (0.25 + (i % 2) * 0.35), Math.sin(i) * size,
      id === 'flood' ? FAMILY.CRYSTAL : id === 'avalanche' ? FAMILY.STONE : FAMILY.LEATHER,
      id === 'flood' ? C.crystalB : id === 'avalanche' ? C.snow : C.banner,
      i * 0.2, i * 0.3, i * 0.1, 1.3, 0.8, 1.0);
  } else if (['battle', 'siege', 'festival', 'funeral', 'ritual'].includes(id)) {
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      b.cyl(size * 0.08, size * 0.08, size * 2.2, 6, Math.cos(a) * size * 1.7,
        size * 1.1, Math.sin(a) * size * 1.7, FAMILY.TIMBER, C.trunk);
      b.box(size * 0.8, size * 0.55, size * 0.08, Math.cos(a) * size * 1.7,
        size * 1.8, Math.sin(a) * size * 1.7, FAMILY.LEATHER,
        id === 'funeral' ? C.iron : id === 'festival' ? C.gold : C.banner, a, BEVEL_S);
    }
  } else {
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2;
      b.chunk(size * (0.25 + (i % 3) * 0.12), Math.cos(a) * size * (0.8 + i * 0.12),
        size * (0.35 + (i % 2) * 0.55), Math.sin(a) * size * (0.8 + i * 0.12),
        FAMILY.CRYSTAL, id === 'fire' ? C.roof : (i % 2 ? C.crystalA : C.gold),
        a, a * 0.4, a * 0.7, 0.8, 1.6, 0.8);
    }
  }
  b.height = size * 2.5; b.radius = size * 3.2;
}

function buildEpistemic(b, size, recipe) {
  const id = recipe.archetype;
  const count = recipe.form === 'fragmented' ? 6 : id === 'rumor' ? 2 : 4;
  for (let i = 0; i < count; i++) torus(b, size * (0.8 + i * 0.4), size * 0.07,
    id === 'overlapping_version' ? (i - count / 2) * size * 0.18 : 0,
    size * (1.5 + i * 0.18), 0, FAMILY.CRYSTAL,
    id === 'erased_site' ? C.steel : (i % 2 ? C.crystalA : C.crystalB),
    i * 0.3, i * 0.5, i * 0.2);
  sphere(b, size * (id === 'hidden_site' ? 0.25 : 0.42), 0, size * 1.8, 0,
    id === 'disputed_site' ? FAMILY.GOLD : FAMILY.CRYSTAL,
    id === 'disputed_site' ? C.gold : C.crystalA, 1, 1, 1);
  b.height = size * 3.2; b.radius = size * (1.5 + count * 0.35);
}

const GENERATORS = Object.freeze({
  castle: buildCastle, train: buildTrain, car: buildCar, goblin: buildGoblin,
  dragon: buildDragon, cave: buildCave, portal: buildPortal,
  terrain: buildTerrain, atmosphere: buildAtmosphere, ecology: buildEcology,
  building: buildBuilding, interior: buildInterior, infrastructure: buildInfrastructure,
  vehicle: buildVehicle, humanoid: buildHumanoid, creature: buildCreature,
  prop: buildProp, magic: buildMagic, event: buildEvent, epistemic: buildEpistemic,
});

const CORE_EFFECTS = Object.freeze({
  fire: ['fire', 'smoke'], explosion: ['sparks', 'debris', 'smoke'], flood: ['water_spray'],
  earthquake: ['dust', 'debris'], avalanche: ['frost_mist', 'debris'], battle: ['smoke', 'sparks'],
  siege: ['smoke', 'debris'], ritual: ['runes', 'aura'], funeral: ['smoke'], festival: ['sparks'],
  waterfall: ['water_spray'], storm: ['lightning'], aurora: ['aura'],
  rift: ['gravity_shards'], spell: ['runes'], curse: ['shadow'], blessing: ['aura'],
  hologram: ['hologram_noise'], time_gate: ['time_echo'], overlapping_version: ['time_echo'],
});

function formScale(form) {
  const shape = ({
    base: [1, 1, 1], vast: [1.42, 1.12, 1.42], layered: [1.16, 1.04, 1.28], hollow: [1.12, 0.78, 1.12], shattered: [1.28, 0.82, 1.18],
    calm: [1.08, 0.72, 1.18], flowing: [1.38, 0.72, 0.82], towering: [0.92, 1.52, 0.92], violent: [1.30, 1.22, 1.18], supernatural: [0.94, 1.34, 0.94],
    patch: [0.72, 0.78, 0.72], grove: [1.12, 1.02, 1.12], ancient: [1.14, 1.28, 1.14], colossal: [1.48, 1.42, 1.48], corrupted: [1.20, 0.92, 1.12],
    compact: [0.78, 0.84, 0.78], walled: [1.24, 0.96, 1.24], elevated: [1.02, 1.38, 1.02], sprawling: [1.42, 0.92, 1.34], monumental: [1.18, 1.48, 1.18],
    bare: [0.90, 0.88, 0.90], furnished: [1.04, 1.00, 1.04], ceremonial: [1.14, 1.18, 1.14], occupied: [1.08, 1.02, 1.12], ruined: [1.18, 0.82, 1.14],
    narrow: [0.72, 1.02, 1.22], reinforced: [1.12, 1.12, 1.12], buried: [1.10, 0.82, 1.10],
    civilian: [0.94, 0.96, 0.94], armored: [1.12, 1.08, 1.12], cargo: [1.34, 1.00, 1.16], royal: [1.12, 1.16, 1.12], arcane: [0.96, 1.22, 0.96],
    warrior: [1.10, 1.08, 1.10], mystic: [0.92, 1.16, 0.92],
    juvenile: [0.68, 0.72, 0.68], adult: [1, 1, 1], spectral: [0.94, 1.12, 0.94],
    plain: [0.92, 0.92, 0.92], ornate: [1.08, 1.10, 1.08], damaged: [1.12, 0.84, 1.04], enchanted: [0.96, 1.18, 0.96],
    dormant: [0.82, 0.76, 0.82], active: [1.04, 1.12, 1.04], unstable: [1.18, 1.24, 1.08], grand: [1.42, 1.36, 1.42], forbidden: [0.92, 1.30, 0.92],
    local: [0.78, 0.78, 0.78], spreading: [1.38, 0.86, 1.32], peak: [1.16, 1.42, 1.16], aftermath: [1.30, 0.72, 1.22],
    faint: [0.76, 0.92, 0.76], revealed: [1.04, 1.12, 1.04], disputed: [1.12, 1.06, 1.18], fragmented: [1.24, 0.90, 1.20], overwritten: [1.16, 1.18, 1.16],
    tiny: [0.28, 0.28, 0.28], small: [0.62, 0.62, 0.62], world: [1.65, 1.52, 1.65],
  })[form];
  return shape ? V3(shape[0], shape[1], shape[2]) : V3(1, 1, 1);
}

function scaleClassFactor(scaleClass) {
  return ({ tiny: 0.28, small: 0.62, human: 1, large: 1.55, giant: 2.4, colossal: 4.2, world: 7.5 })[scaleClass] || 1;
}

function cultureScale(culture) {
  if (['steppe', 'nomadic', 'maritime', 'river'].includes(culture)) return V3(1.24, 0.86, 1.12);
  if (['mountain', 'subterranean', 'militaristic'].includes(culture)) return V3(1.05, 1.26, 1.05);
  if (['celestial', 'infernal', 'fey'].includes(culture)) return V3(0.92, 1.34, 0.92);
  if (['imperial', 'mercantile'].includes(culture)) return V3(1.18, 1.12, 1.18);
  return V3(1, 1, 1);
}

function materialFamily(material, fallback) {
  if (['black_iron', 'bright_steel', 'bronze'].includes(material)) return FAMILY.IRON;
  if (material === 'gold') return FAMILY.GOLD;
  if (['raw_wood', 'dark_timber', 'paper'].includes(material)) return FAMILY.TIMBER;
  if (['leather', 'cloth', 'organic', 'bone'].includes(material)) return FAMILY.LEATHER;
  if (material === 'foliage') return FAMILY.FOLIAGE;
  if (['glass', 'crystal', 'ice', 'hologram'].includes(material)) return FAMILY.CRYSTAL;
  if (material === 'water') return FAMILY.ROCK_WET;
  if (['weathered_stone', 'polished_stone', 'ceramic'].includes(material)) return FAMILY.STONE;
  return fallback;
}

function styleColor(style) {
  if (['cyberpunk', 'solarpunk', 'space_opera', 'surreal'].includes(style)) return new THREE.Color(MYSTIC.CRYSTAL_A);
  if (['gothic_horror', 'post_apocalyptic', 'dieselpunk'].includes(style)) return new THREE.Color(STRUCT.IRON);
  if (['mythic_korean', 'mythic_chinese', 'mythic_japanese'].includes(style)) return new THREE.Color(STRUCT.ROOF);
  if (['desert_fantasy', 'ancient', 'classical'].includes(style)) return new THREE.Color(SURFACE.STRATA_TOP);
  if (['biopunk', 'prehistoric'].includes(style)) return new THREE.Color(FOLIAGE.CANOPY_HI);
  return null;
}

function transformParts(builder, recipe, rng, opts = {}) {
  // 조형도가 부품마다 재질을 정해 놓았고 작가가 재질을 따로 지정하지 않았다면 그대로 둔다.
  // (예전 생성기에는 부품별 재질 의도가 없어서 계열 기본값으로 통일해도 손해가 없었다.)
  const keepFamilies = !!opts.keepFamilies;
  const states = new Set(recipe.states);
  const tint = styleColor(recipe.style);
  const ruin = states.has('cracked') || states.has('damaged') || states.has('half_ruined')
    || states.has('collapsed') || states.has('shattering');
  const black = new THREE.Color(BLACK);
  const ice = new THREE.Color(MYSTIC.CRYSTAL_B);
  const moss = new THREE.Color(FOLIAGE.CANOPY_LOW);
  const rust = new THREE.Color(STRUCT.TIMBER);
  const gold = new THREE.Color(STRUCT.GOLD);
  const water = new THREE.Color(WATER.SHALLOW);
  const danger = new THREE.Color(RIFT.GLOW);
  const uncanny = new THREE.Color(MYSTIC.LOW);
  for (let i = builder.parts.length - 1; i >= 0; i--) {
    const part = builder.parts[i];
    if (ruin && i > 1 && ((i * 7 + recipe.seed.length) % 9) < (states.has('collapsed') ? 4 : 2)) {
      if (states.has('shattering') && i % 3 === 0) { builder.parts.splice(i, 1); part.geo.dispose(); continue; }
      const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scale = new THREE.Vector3();
      part.matrix.decompose(pos, quat, scale);
      pos.y -= builder.height * (0.16 + rng() * 0.24);
      pos.x += (rng() - 0.5) * builder.radius * 0.28;
      pos.z += (rng() - 0.5) * builder.radius * 0.28;
      quat.multiply(QE((rng() - 0.5) * 0.65, (rng() - 0.5) * 0.5, (rng() - 0.5) * 0.65));
      part.matrix.compose(pos, quat, scale);
    }
    if (!keepFamilies) part.fam = materialFamily(recipe.material, part.fam);
    if (tint && part.color) part.color = part.color.clone().lerp(tint, 0.18);
    if ((states.has('charred') || states.has('burning') || states.has('smoldering')) && part.color) part.color = part.color.clone().lerp(black, 0.48);
    if (states.has('frozen') && part.color) part.color = part.color.clone().lerp(ice, 0.58);
    if ((states.has('mossy') || states.has('overgrown')) && part.color) part.color = part.color.clone().lerp(moss, 0.42);
    if ((states.has('rusted') || states.has('corroded')) && part.color) part.color = part.color.clone().lerp(rust, 0.40);
    if ((states.has('wet') || states.has('flooded') || states.has('sunk')) && part.color) part.color = part.color.clone().lerp(water, 0.36);
    if ((states.has('bloodied') || states.has('besieged') || states.has('battle') || states.has('berserk')) && part.color) part.color = part.color.clone().lerp(danger, 0.36);
    if ((states.has('infected') || states.has('cursed') || states.has('haunted') || states.has('possessed') || states.has('unstable')) && part.color) part.color = part.color.clone().lerp(uncanny, 0.38);
    if ((states.has('gilded') || states.has('blessed') || states.has('repaired')) && part.color) part.color = part.color.clone().lerp(gold, 0.42);
    if ((states.has('abandoned') || states.has('looted') || states.has('eroded')) && part.color) part.color = part.color.clone().lerp(black, 0.22);
    if (states.has('crystallized') || states.has('holographic') || states.has('transparent')
      || states.has('illusory') || states.has('erasing')) {
      part.fam = FAMILY.CRYSTAL;
      if (part.color) part.color = part.color.clone().lerp(ice, 0.52);
    }
    if (states.has('petrified')) part.fam = FAMILY.STONE;
  }

  // 구조·사회·초자연 상태도 이름표에 머물지 않고 공용 부품으로 드러난다.
  if (states.has('under_construction') || states.has('rebuilding') || states.has('repaired')) {
    for (const x of [-0.62, 0.62]) rotCylinder(builder, builder.radius * 0.055, builder.radius * 0.055,
      builder.height * 0.9, 6, x * builder.radius, builder.height * 0.42, builder.radius * 0.42,
      FAMILY.TIMBER, C.timber, 0, 0, x * 0.42);
  }
  if (states.has('sealed') || states.has('blocked') || states.has('quarantined')) {
    for (const z of [-0.20, 0.20]) builder.box(builder.radius * 1.4, builder.height * 0.08,
      builder.radius * 0.09, 0, builder.height * (0.34 + z), builder.radius * 0.68,
      states.has('sealed') ? FAMILY.CRYSTAL : FAMILY.IRON,
      states.has('sealed') ? C.crystalA : C.iron, z * 2.6, BEVEL_S);
  }
  if (['occupied', 'festival', 'funeral', 'pilgrimage', 'evacuating', 'inhabited'].some((name) => states.has(name))) {
    const banner = states.has('funeral') ? C.iron : states.has('festival') ? C.gold : C.banner;
    builder.cyl(builder.radius * 0.025, builder.radius * 0.025, builder.height * 0.72, 6,
      builder.radius * 0.72, builder.height * 0.38, 0, FAMILY.TIMBER, C.trunk);
    builder.box(builder.radius * 0.62, builder.height * 0.18, builder.radius * 0.035,
      builder.radius, builder.height * 0.62, 0, FAMILY.LEATHER, banner, 0, BEVEL_S);
  }
  if (states.has('duplicated') || states.has('version_overlap')) {
    const originals = builder.parts.slice(0, Math.min(6, builder.parts.length));
    for (const part of originals) {
      const matrix = new THREE.Matrix4().makeTranslation(builder.radius * 0.22, builder.height * 0.06, -builder.radius * 0.16)
        .multiply(part.matrix);
      builder.push(part.geo.clone(), FAMILY.CRYSTAL, C.crystalA, matrix, part.flat);
    }
  }
  if (states.has('looped') || states.has('folded_space')) {
    torus(builder, builder.radius * 0.72, builder.radius * 0.045, 0, builder.height * 0.56, 0,
      FAMILY.CRYSTAL, C.crystalB, states.has('folded_space') ? 0.72 : 0, 0.28, 0);
  }
  if (states.has('extended') && builder.parts.length) {
    const part = builder.parts[0];
    const matrix = new THREE.Matrix4().makeTranslation(builder.radius * 0.85, 0, 0).multiply(part.matrix);
    builder.push(part.geo.clone(), part.fam, part.color ? part.color.clone() : C.body, matrix, part.flat);
    builder.radius *= 1.35;
  }
}

function stateRotation(recipe) {
  let q = new THREE.Quaternion();
  if (recipe.states.includes('overturned')) q = QE(0, 0, Math.PI * 0.52);
  else if (recipe.states.includes('derailed')) q = QE(0.16, 0.34, 0.22);
  else if (recipe.states.includes('gravity_inverted')) q = QE(0, 0, Math.PI);
  if (recipe.action === 'sleeping') q.multiply(QE(0, 0, Math.PI * 0.48));
  else if (recipe.action === 'resting') q.multiply(QE(0, 0, 0.14));
  return q;
}

function addPartToBuckets(part, worldM, buckets, stats, timeSlot = null) {
  const matrix = new THREE.Matrix4().multiplyMatrices(worldM, part.matrix || M4());
  const baked = bakePart({ geo: part.geo, matrix, color: part.color, flat: part.flat, timeSlot });
  const fam = part.fam || FAMILY.STONE;
  if (!buckets.has(fam)) buckets.set(fam, []);
  buckets.get(fam).push(baked);
  stats.parts++;
  stats.triangles += baked.getAttribute('position').count / 3;
}

function localGroup(builder, stats, timeSlot = null) {
  const group = new THREE.Group();
  const buckets = new Map();
  for (const part of builder.parts) addPartToBuckets(part, M4(), buckets, stats, timeSlot);
  for (const fam of FAMILY_ORDER) {
    const list = buckets.get(fam);
    if (!list || !list.length) continue;
    const mesh = new THREE.Mesh(mergeBucket(list), familyMaterial(fam));
    mesh.name = 'fan-asset-dynamic-' + fam;
    group.add(mesh);
    stats.meshes++;
  }
  return group;
}

function dynamicController(group, recipe, base, seed) {
  const rng = rngFor('asset-motion', recipe.id, seed);
  const phase = rng() * Math.PI * 2;
  const origin = base.clone();
  const originRotation = group.quaternion.clone();
  const originScale = group.scale.clone();
  const speed = 0.35 + rng() * 0.35;
  return {
    update(t) {
      group.position.copy(origin);
      group.quaternion.copy(originRotation);
      group.scale.copy(originScale);
      const wave = Math.sin(t * speed + phase);
      if (['flying', 'gliding', 'hovering'].includes(recipe.action)) {
        group.position.y += 5 + wave * 1.2;
        group.rotateZ(wave * 0.05);
      } else if (['moving', 'driving', 'rolling', 'sailing', 'patrolling', 'chasing', 'fleeing', 'traversing'].includes(recipe.action)) {
        group.position.x += wave * 2.4;
      } else if (recipe.action === 'falling') {
        group.position.y += 2.5 + Math.abs(wave) * 5;
        group.rotateZ(t * 0.35);
      } else if (recipe.action === 'rotating') {
        group.rotateY(t * speed);
      } else if (recipe.action === 'collapsing') {
        group.position.y -= (wave + 1) * 0.35;
        group.rotateZ(wave * 0.08);
      } else if (['walking', 'running', 'attacking', 'defending', 'working', 'roaring'].includes(recipe.action)) {
        group.position.y += Math.abs(wave) * 0.18;
        group.rotateZ(wave * 0.035);
      } else if (['transforming', 'spawning', 'vanishing', 'opening'].includes(recipe.action)) {
        const k = 0.82 + (wave + 1) * 0.09;
        group.scale.copy(originScale).multiplyScalar(k);
      }
    },
  };
}

function particleField(items) {
  if (!items.length) return null;
  const count = items.length * 7;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const particles = [];
  let cursor = 0;
  for (const item of items) {
    const color = new THREE.Color(EFFECT_COLOR[item.effect] || HOLO.B);
    const rng = rngFor('asset-effect', item.id, item.effect);
    for (let i = 0; i < 7; i++) {
      const p = {
        base: item.position.clone(),
        source: item.source || null,
        sourceLift: item.sourceLift || 0,
        time: item.time || null,
        anchor: item.anchor || '',
        dx: (rng() - 0.5) * item.radius,
        dz: (rng() - 0.5) * item.radius,
        phase: rng(), speed: 0.25 + rng() * 0.55,
        height: item.height * (0.45 + rng() * 0.8),
        orbit: ['aura', 'runes', 'time_echo', 'gravity_shards'].includes(item.effect),
      };
      particles.push(p);
      positions[cursor * 3] = p.base.x + p.dx;
      positions[cursor * 3 + 1] = p.base.y;
      positions[cursor * 3 + 2] = p.base.z + p.dz;
      colors[cursor * 3] = color.r; colors[cursor * 3 + 1] = color.g; colors[cursor * 3 + 2] = color.b;
      cursor++;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.9, vertexColors: true, transparent: true, opacity: 0.82,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.name = 'fan-asset-effects';
  points.frustumCulled = false;
  return {
    points,
    update(t) {
      const pos = geo.getAttribute('position');
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.time && p.anchor && p.time.presenceOf(p.anchor) < 0.02) {
          pos.setXYZ(i, 0, -9999, 0);
          continue;
        }
        const bx = p.source ? p.source.position.x : p.base.x;
        const by = p.source ? p.source.position.y + p.sourceLift : p.base.y;
        const bz = p.source ? p.source.position.z : p.base.z;
        const f = (t * p.speed + p.phase) % 1;
        if (p.orbit) {
          const a = f * Math.PI * 2;
          pos.setXYZ(i, bx + Math.cos(a) * Math.max(0.5, Math.abs(p.dx)),
            by + p.height * 0.5 + Math.sin(a * 2) * p.height * 0.2,
            bz + Math.sin(a) * Math.max(0.5, Math.abs(p.dz)));
        } else {
          pos.setXYZ(i, bx + p.dx * (1 - f), by + f * p.height,
            bz + p.dz * (1 - f));
        }
      }
      pos.needsUpdate = true;
    },
  };
}

/**
 * worldstyle.assets를 월드 위에 세운다. 반환 animated는 World.update에 합쳐야 한다.
 */
export function buildAssetField({ world, catalog, recipes: rawRecipes, seed }) {
  const group = new THREE.Group();
  group.name = 'fan-assets';
  const picks = [];
  const animated = [];
  const clearances = [];
  const buckets = new Map();
  const effects = [];
  const normalized = normalizeAssetRecipes(rawRecipes, catalog);
  const dropped = normalized.dropped.slice();
  const stats = {
    catalog: catalog.stats,
    requested: Array.isArray(rawRecipes) ? rawRecipes.length : 0,
    built: 0, static: 0, dynamic: 0, parts: 0, meshes: 0, triangles: 0,
    effects: 0, dropped,
  };
  const groundById = new Map([...(world.ground || []), ...(world.sky || [])].map((p) => [p.id, p]));
  const pickMat = new THREE.MeshBasicMaterial({ visible: false });

  for (const recipe of normalized.recipes) {
    const place = groundById.get(recipe.anchor);
    const floatingAnchor = world.anchorOf(recipe.anchor);
    if (!place && !floatingAnchor) {
      dropped.push({ id: recipe.id, field: 'anchor', value: recipe.anchor, reason: 'unknown' });
      continue;
    }
    const base = floatingAnchor && place && place.type === 'otherworld'
      ? floatingAnchor.clone()
      : V3(place ? place.x : floatingAnchor.x, 0, place ? place.z : floatingAnchor.z);
    if (!(floatingAnchor && place && place.type === 'otherworld')) base.y = world.surfaceAt(base.x, base.z);
    base.add(V3(recipe.offset[0], recipe.offset[1], recipe.offset[2]));

    const rng = rngFor('asset', recipe.seed, recipe.archetype, recipe.form, String(seed));
    const timeSlot = world.time ? (world.time.slotFor(recipe.anchor) || 0) : null;
    const builder = new Assembly(rng, 'A');
    // blueprint 가 있으면 그게 정본이다 — 예전 if-chain 생성기는 blueprint 없는 core 의 폴백으로만 남는다.
    const core = catalog.cores.get(recipe.archetype);
    const built = core && core.blueprint && buildFromBlueprint(builder, 1.35, core.blueprint, {
      category: recipe.category,
      form: recipe.form,
      variant: VARIANT_BY_ID.get(recipe.variant),
      seed: recipe.archetype + '|' + recipe.form + '|' + recipe.variant,
    });
    if (!built) {
      const generator = GENERATORS[recipe.generator] || GENERATORS[recipe.family] || buildProp;
      generator(builder, 1.35, recipe);
    }
    transformParts(builder, recipe, rng, { keepFamilies: !!built && !recipe.materialExplicit });
    if (recipe.states.includes('buried')) base.y -= builder.height * 0.32;
    if (recipe.states.includes('sunk')) base.y -= builder.height * 0.48;
    const shapeScale = formScale(recipe.form)
      .multiply(cultureScale(recipe.culture))
      .multiplyScalar(recipe.scale * scaleClassFactor(recipe.scaleClass));
    const rot = stateRotation(recipe);
    const wantsDynamic = DYNAMIC_ACTIONS.has(recipe.action);
    const isDynamic = wantsDynamic && stats.dynamic < MAX_DYNAMIC_ASSETS;
    let movingGroup = null;
    if (wantsDynamic && !isDynamic) {
      dropped.push({ id: recipe.id, field: 'action', value: recipe.action, reason: 'motion-budget' });
    }

    if (isDynamic) {
      const item = localGroup(builder, stats, timeSlot);
      item.position.copy(base);
      item.quaternion.copy(rot);
      item.scale.copy(shapeScale);
      item.name = 'fan-asset-' + recipe.id;
      item.userData.fanAssetId = recipe.id;
      group.add(item);
      movingGroup = item;
      stats.dynamic++;
    } else {
      const worldM = M4().compose(base, rot, shapeScale);
      for (const part of builder.parts) addPartToBuckets(part, worldM, buckets, stats, timeSlot);
      stats.static++;
    }

    const radius = Math.max(0.5, builder.radius * Math.max(shapeScale.x, shapeScale.z));
    const height = Math.max(0.8, builder.height * shapeScale.y);
    const proxy = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.62, radius * 0.78, height, 8, 1), pickMat);
    proxy.position.set(base.x, base.y + height / 2, base.z);
    proxy.visible = false;
    proxy.userData.fanNodeId = recipe.anchor;
    proxy.userData.fanAssetId = recipe.id;
    proxy.name = 'fan-asset-pick-' + recipe.id;
    group.add(proxy);
    picks.push(proxy);
    if (movingGroup) {
      const motion = dynamicController(movingGroup, recipe, base, String(seed));
      animated.push({
        update(t) {
          motion.update(t);
          proxy.position.set(movingGroup.position.x, movingGroup.position.y + height / 2, movingGroup.position.z);
        },
      });
    }
    clearances.push({ x: base.x, z: base.z, r: radius });
    for (const effect of (CORE_EFFECTS[recipe.archetype] || [])) {
      if (!recipe.effects.includes(effect)) recipe.effects.push(effect);
    }
    for (const effect of recipe.effects) effects.push({
      id: recipe.id, effect, position: base.clone().add(V3(0, height * 0.35, 0)),
      source: movingGroup, sourceLift: height * 0.35, time: world.time, anchor: recipe.anchor,
      radius, height,
    });
    stats.effects += recipe.effects.length;
    stats.built++;
  }

  for (const fam of FAMILY_ORDER) {
    const list = buckets.get(fam);
    if (!list || !list.length) continue;
    const mesh = new THREE.Mesh(mergeBucket(list), familyMaterial(fam));
    mesh.name = 'fan-assets-' + fam;
    group.add(mesh);
    stats.meshes++;
  }
  const particles = particleField(effects);
  if (particles) {
    group.add(particles.points);
    animated.push(particles);
    stats.meshes++;
  }
  patchGroupTime(group, world.time, 'asset');
  patchGroupCataclysm(group, world.cata, 'asset', { vanish: true, tint: false });
  return { group, picks, animated, clearances, stats, recipes: normalized.recipes };
}

export const ASSET_GENERATORS = Object.freeze(Object.keys(GENERATORS));
