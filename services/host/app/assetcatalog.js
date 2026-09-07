// app/assetcatalog.js — core × form × 변종을 펼치고 장면 레시피를 검증한다.
// 정본 어휘는 asset-catalog.json. 이 모듈은 Three.js에 의존하지 않는다.
//
// **archetypes 배열은 더 이상 만들지 않는다.** core 1천여 개 × form 8 × 변종 5 는 5만 항목이라
// 통째로 물질화하면 부팅에 수십 MB 를 먹는다. 대신 개수와 지연 접근자(archetypeAt)만 준다 —
// 도감은 화면에 필요한 만큼만 꺼내 쓴다.

const MAX_STATES = 8;
const MAX_EFFECTS = 6;
const MAX_SCENE_ASSETS = 160;

function pair(value) {
  const bits = String(value || '').split('|');
  return { id: bits[0] || '', label: bits[1] || bits[0] || '' };
}

function vocabulary(rows) {
  return (Array.isArray(rows) ? rows : []).map((row) => {
    if (typeof row === 'string') return pair(row);
    return row && typeof row === 'object' ? { ...row } : { id: '', label: '' };
  }).filter((row) => row.id);
}

function unique(values) {
  return [...new Set(values)];
}

function finite(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bounded(value, lo, hi, fallback) {
  return Math.max(lo, Math.min(hi, finite(value, fallback)));
}

function compatible(def, capabilities) {
  const needs = Array.isArray(def && def.requiresAny) ? def.requiresAny : [];
  return needs.length === 0 || needs.some((name) => capabilities.has(name));
}

/** 원본 JSON을 빠르게 조회할 수 있는 불변에 가까운 런타임 카탈로그로 펼친다. */
export function compileAssetCatalog(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const familyDefs = source.families && typeof source.families === 'object' ? source.families : {};
  const overrides = source.coreOverrides && typeof source.coreOverrides === 'object' ? source.coreOverrides : {};
  const blueprintDefs = source.blueprints && typeof source.blueprints === 'object' ? source.blueprints : {};
  const categories = new Map();
  const cores = new Map();
  const coreOrder = [];

  for (const [categoryId, src] of Object.entries(source.categories || {})) {
    if (!src || typeof src !== 'object') continue;
    const forms = vocabulary(src.forms);
    const family = String(src.family || categoryId);
    const familyDef = familyDefs[family] || {};
    const category = {
      id: categoryId,
      label: String(src.label || categoryId),
      family,
      forms,
      formById: new Map(forms.map((form) => [form.id, form])),
    };
    categories.set(categoryId, category);

    for (const row of vocabulary(src.cores)) {
      if (cores.has(row.id)) continue;
      const override = overrides[row.id] || {};
      const capabilities = unique([
        categoryId, family,
        ...(Array.isArray(familyDef.capabilities) ? familyDef.capabilities : []),
        ...(Array.isArray(override.capabilities) ? override.capabilities : []),
      ]);
      const core = {
        id: row.id,
        label: row.label,
        category: categoryId,
        family,
        generator: String(override.generator || familyDef.generator || family),
        capabilities,
        forms,
        // blueprint 가 있으면 그게 이 core 의 생김새다. 없으면 예전 if-chain 생성기로 떨어진다.
        blueprint: blueprintDefs[row.id] || null,
      };
      cores.set(core.id, core);
      coreOrder.push(core);
    }
  }

  const modifiers = source.modifiers && typeof source.modifiers === 'object' ? source.modifiers : {};
  const states = vocabulary(modifiers.states);
  const actions = vocabulary(modifiers.actions);
  const effects = vocabulary(modifiers.effects);
  const styles = vocabulary(modifiers.styles);
  const materials = vocabulary(modifiers.materials);
  const cultures = vocabulary(modifiers.cultures);
  const scales = vocabulary(modifiers.scales);
  const byId = (rows) => new Map(rows.map((row) => [row.id, row]));
  const baseForms = coreOrder.reduce((sum, core) => sum + core.forms.length, 0);
  const combinationEstimate = baseForms * Math.max(1, states.length + 1)
    * Math.max(1, actions.length) * Math.max(1, effects.length + 1)
    * Math.max(1, styles.length) * Math.max(1, materials.length)
    * Math.max(1, cultures.length) * Math.max(1, scales.length);

  const variants = vocabulary(source.variants && source.variants.length ? source.variants : DEFAULT_VARIANTS);
  const variantById = byId(variants);

  // 지연 색인 — (core, form, 변종) 을 정수 하나로 접는다. 5만 항목을 배열로 들지 않기 위해서다.
  const perCore = [];
  let total = 0;
  for (const core of coreOrder) {
    const span = core.forms.length * variants.length;
    perCore.push({ core, start: total, span });
    total += span;
  }
  /** i 번째 기본형을 그 자리에서 만든다. 범위를 벗어나면 null. */
  function archetypeAt(index) {
    const i = Math.floor(index);
    if (!(i >= 0 && i < total)) return null;
    // core 개수가 천 단위라 선형 탐색은 도감 스크롤마다 낭비다 — 이분 탐색으로 찾는다.
    let lo = 0, hi = perCore.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (perCore[mid].start <= i) lo = mid; else hi = mid - 1;
    }
    const slot = perCore[lo];
    const rest = i - slot.start;
    const form = slot.core.forms[Math.floor(rest / variants.length)];
    const variant = variants[rest % variants.length];
    return makeArchetype(slot.core, form, variant);
  }

  return {
    version: Number(source.version) || 1,
    categories, cores, coreOrder,
    variants, variantById,
    archetypeCount: total,
    archetypeAt,
    blueprintCount: Object.keys(blueprintDefs).length,
    states, actions, effects, styles, materials, cultures, scales,
    stateById: byId(states), actionById: byId(actions), effectById: byId(effects),
    styleById: byId(styles), materialById: byId(materials), cultureById: byId(cultures), scaleById: byId(scales),
    stats: {
      categories: categories.size,
      cores: cores.size,
      forms: coreOrder.length ? coreOrder[0].forms.length : 0,
      variants: variants.length,
      archetypes: total,
      blueprints: Object.keys(blueprintDefs).length,
      states: states.length,
      actions: actions.length,
      effects: effects.length,
      styles: styles.length,
      materials: materials.length,
      cultures: cultures.length,
      combinationEstimate: combinationEstimate * Math.max(1, variants.length),
    },
  };
}

/** 카탈로그에 variants 가 없던 시절 파일도 그대로 뜬다 — 기본 5종을 여기서 채운다. */
const DEFAULT_VARIANTS = Object.freeze([
  'native|토착', 'stonecut|석조', 'ironwrought|철제', 'verdant|수목', 'arcanite|결정',
]);

/** (core, form, 변종) 하나를 도감·레시피가 쓰는 평평한 객체로 만든다. */
export function makeArchetype(core, form, variant) {
  const v = variant && variant.id && variant.id !== 'native' ? variant : null;
  return {
    id: core.id + '--' + form.id + (v ? '--' + v.id : ''),
    coreId: core.id,
    coreLabel: core.label,
    label: (v ? v.label + ' ' : '') + form.label + ' ' + core.label,
    form: form.id,
    formLabel: form.label,
    variant: v ? v.id : 'native',
    variantLabel: v ? v.label : '토착',
    category: core.category,
    family: core.family,
    generator: core.generator,
    capabilities: core.capabilities,
    hasBlueprint: !!core.blueprint,
  };
}

/**
 * AI/작가 레시피를 카탈로그 어휘로 정규화한다.
 * 맞지 않는 값은 dropped에 이유를 남기고 나머지로 계속 그린다.
 */
export function normalizeAssetRecipe(raw, catalog, index = 0) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const dropped = [];
  // 기본형 id 는 `core--form` 또는 `core--form--변종` 이다. split(_, 2) 를 쓰면 변종이 잘려
  // 도감에서 고른 결정 변종이 조용히 토착으로 돌아간다 — 조각을 전부 받아서 나눈다.
  let coreId = typeof src.archetype === 'string' ? src.archetype.trim() : '';
  let formFromId = '';
  let variantFromId = '';
  if (coreId.includes('--')) {
    const bits = coreId.split('--');
    coreId = bits[0];
    formFromId = bits[1] || '';
    variantFromId = bits[2] || '';
  }
  const core = catalog && catalog.cores ? catalog.cores.get(coreId) : null;
  if (!core) return { recipe: null, dropped: [{ field: 'archetype', value: coreId, reason: 'unknown' }] };

  const category = catalog.categories.get(core.category);
  const requestedForm = typeof src.form === 'string' ? src.form : formFromId;
  const form = category.formById.has(requestedForm) ? requestedForm : category.forms[0].id;
  if (requestedForm && requestedForm !== form) dropped.push({ field: 'form', value: requestedForm, reason: 'unknown' });

  const capabilities = new Set(core.capabilities);
  const states = [];
  for (const stateId of unique(Array.isArray(src.states) ? src.states : []).slice(0, MAX_STATES)) {
    const def = catalog.stateById.get(stateId);
    if (!def) dropped.push({ field: 'states', value: stateId, reason: 'unknown' });
    else if (!compatible(def, capabilities)) dropped.push({ field: 'states', value: stateId, reason: 'incompatible' });
    else states.push(stateId);
  }
  const impliedState = ({
    shattered: 'shattering', violent: 'unstable', supernatural: 'cursed', corrupted: 'infected',
    ruined: 'half_ruined', buried: 'buried', arcane: 'crystallized', spectral: 'holographic',
    damaged: 'damaged', enchanted: 'crystallized', unstable: 'unstable', forbidden: 'cursed',
    aftermath: 'damaged', fragmented: 'shattering', overwritten: 'version_overlap',
  })[form];
  if (impliedState && !states.includes(impliedState)) states.push(impliedState);

  const wantedAction = typeof src.action === 'string' ? src.action : 'idle';
  const actionDef = catalog.actionById.get(wantedAction);
  let action = 'idle';
  if (!actionDef) dropped.push({ field: 'action', value: wantedAction, reason: 'unknown' });
  else if (!compatible(actionDef, capabilities)) dropped.push({ field: 'action', value: wantedAction, reason: 'incompatible' });
  else action = wantedAction;

  const effects = [];
  for (const effectId of unique(Array.isArray(src.effects) ? src.effects : []).slice(0, MAX_EFFECTS)) {
    if (!catalog.effectById.has(effectId)) dropped.push({ field: 'effects', value: effectId, reason: 'unknown' });
    else effects.push(effectId);
  }
  if (states.includes('burning') && !effects.includes('fire')) effects.push('fire');
  if ((states.includes('burning') || states.includes('smoldering')) && !effects.includes('smoke')) effects.push('smoke');
  if (states.includes('frozen') && !effects.includes('frost_mist')) effects.push('frost_mist');

  const token = (field, map, fallback) => {
    const wanted = typeof src[field] === 'string' ? src[field] : '';
    if (!wanted) return fallback;
    if (map.has(wanted)) return wanted;
    dropped.push({ field, value: wanted, reason: 'unknown' });
    return fallback;
  };
  const offset = Array.isArray(src.offset) ? [0, 1, 2].map((i) => bounded(src.offset[i], -500, 500, 0)) : [0, 0, 0];
  const anchor = typeof src.anchor === 'string' ? src.anchor.trim() : '';
  if (!anchor) dropped.push({ field: 'anchor', value: anchor, reason: 'missing' });

  return {
    recipe: {
      id: typeof src.id === 'string' && src.id.trim() ? src.id.trim() : 'asset_' + String(index + 1),
      archetype: core.id,
      label: typeof src.label === 'string' && src.label.trim() ? src.label.trim() : core.label,
      form,
      category: core.category,
      family: core.family,
      generator: core.generator,
      capabilities: core.capabilities,
      anchor,
      offset,
      scale: bounded(src.scale, 0.1, 12, 1),
      scaleClass: token('scaleClass', catalog.scaleById, 'human'),
      style: token('style', catalog.styleById, 'medieval'),
      material: token('material', catalog.materialById, defaultMaterial(core.family)),
      // 재질을 **작가가 직접 골랐는지**를 남긴다. 안 고르면 계열 기본값이 채워지는데,
      // 그 기본값으로 조형도의 부품별 재질(지붕은 나무, 문고리는 철…)을 덮어써 버리면
      // 한 물건이 통째로 한 재질이 된다. assetforge 가 이 값으로 덮어쓸지 말지 가른다.
      materialExplicit: typeof src.material === 'string' && catalog.materialById.has(src.material),
      culture: token('culture', catalog.cultureById, ''),
      states,
      action,
      effects,
      variant: (() => {
        const wanted = typeof src.variant === 'string' && src.variant ? src.variant : variantFromId;
        if (!wanted) return 'native';
        if (catalog.variantById && catalog.variantById.has(wanted)) return wanted;
        dropped.push({ field: 'variant', value: wanted, reason: 'unknown' });
        return 'native';
      })(),
      seed: typeof src.seed === 'string' && src.seed ? src.seed : (typeof src.id === 'string' ? src.id : core.id + '_' + index),
    },
    dropped,
  };
}

function defaultMaterial(family) {
  if (family === 'vehicle' || family === 'infrastructure') return 'black_iron';
  if (family === 'humanoid' || family === 'creature') return 'organic';
  if (family === 'ecology') return 'foliage';
  if (family === 'magic' || family === 'epistemic') return 'crystal';
  if (family === 'atmosphere') return 'water';
  if (family === 'prop' || family === 'interior') return 'raw_wood';
  return 'weathered_stone';
}

export function normalizeAssetRecipes(rows, catalog) {
  const recipes = [];
  const dropped = [];
  const source = Array.isArray(rows) ? rows : [];
  for (const [index, raw] of source.slice(0, MAX_SCENE_ASSETS).entries()) {
    const out = normalizeAssetRecipe(raw, catalog, index);
    if (out.recipe) recipes.push(out.recipe);
    for (const item of out.dropped) dropped.push({ index, id: out.recipe ? out.recipe.id : null, ...item });
  }
  for (let index = MAX_SCENE_ASSETS; index < source.length; index++) {
    dropped.push({ index, id: null, field: 'scene', value: null, reason: 'asset-budget' });
  }
  return { recipes, dropped };
}
