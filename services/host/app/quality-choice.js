export const QUALITY_KEY='fantology.quality.v1';
export const qualityNames=['low','medium','high'];

export function recommendQuality({hardwareConcurrency=0,deviceMemory=0,maxTouchPoints=0,userAgent='',width=0,height=0,dpr=1}={}){
  // 모바일·맥 UA의 아이패드는 낮음이며, 데스크톱의 터치 여부는 등급을 낮추지 않는다.
  // 2코어 이하 또는 4코어 이하·4GB 이하는 낮음, 8코어 이상·8GB 이상은 높음 후보이다.
  // 메모리·픽셀 정보가 없어도 높음이 가능하다. 화면 픽셀×DPR²이 8백만을 넘으면 보통이다.
  if(/Android|iPhone|iPad|Mobile/i.test(userAgent)||(/Macintosh/.test(userAgent)&&maxTouchPoints>1)||
    (hardwareConcurrency>0&&(hardwareConcurrency<=2||(hardwareConcurrency<=4&&deviceMemory>0&&deviceMemory<=4))))return 'low';
  const pixels=width*height*dpr*dpr;
  return hardwareConcurrency>=8&&(deviceMemory>=8||!deviceMemory)&&(!pixels||pixels<=8000000)?'high':'medium';
}

export function chooseQuality(profile,saved,query){
  const recommended=recommendQuality(profile);
  let preference=saved;
  if(typeof saved==='string')try{preference=JSON.parse(saved);}catch{preference=null;}
  const persist=!qualityNames.includes(query),validSaved=qualityNames.includes(preference?.name);
  const selected=!persist?query:validSaved?preference.name:recommended;
  return {recommended,selected,manual:!persist||(validSaved&&preference.manual===true),persist};
}
