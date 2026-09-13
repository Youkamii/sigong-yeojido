const normal=Object.freeze({treeTrials:180000,trees:18000,edgeTrees:36,groveTrees:180,estimatedScale:1});
const low=Object.freeze({treeTrials:18000,trees:1800,edgeTrees:4,groveTrees:24,estimatedScale:.25});

// 엔진의 공개 quality 값을 읽는다. 기록된 장면·문서화 구역에는 예산을 적용하지 않는다.
export function sceneBudget(quality){return quality==='low'?low:normal;}
