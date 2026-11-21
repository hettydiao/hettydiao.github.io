const PROVINCES={yunnan:['kunming','dali','lijiang','banna'],guangxi:['guilin','yangshuo','beihai'],sichuan:['chengdu','leshan','emei']};
const STAY_COUNTS={"kunming": 5, "dali": 6, "banna": 5, "guilin": 5, "yangshuo": 5, "beihai": 5, "chengdu": 5, "leshan": 5, "emei": 5, "lijiang": 7};
const CITY_IDS=Object.values(PROVINCES).flat();
const EVENTS=new Set(['visit','generate','plan_select','hotel_change','activity_add','activity_delete','activity_replace','activity_reorder','activity_move','day_swap','price_adjust','export','satisfied']);
const EDITS=new Set(['hotel_change','activity_add','activity_delete','activity_replace','activity_reorder','activity_move','day_swap','price_adjust']);
const BUCKETS=['150-300','301-500','501-800','801-1200','1201-2000','2001+'];
const AGE_BANDS=['under40','40-49','50-59','60-69','70-79','80+'];
const PARTY_BANDS=['1','2','3-4','5-8','9-12'];
function oneOf(v,values){return typeof v==='string'&&values.includes(v)}
function safeList(v,allowed,max=12){return Array.isArray(v)&&v.length<=max&&v.every(x=>oneOf(x,allowed))}
function actId(v,city){return v==='none'||v==='custom'||new RegExp('^'+city+'-[0-5]$').test(v)}
function metricCounters(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>!['type','choices','change','effort'].includes(k))||!EVENTS.has(p.type))return null;
 let rows=[['event:'+p.type,1]];
 if(p.type==='generate'){
  let c=p.choices;
  if(!c||!oneOf(c.province,Object.keys(PROVINCES))||!safeList(c.cities,PROVINCES[c.province],4)||!c.cities.length||new Set(c.cities).size!==c.cities.length||!oneOf(c.start,['late','normal','early'])||!oneOf(c.pace,['light','balanced','full'])||!oneOf(c.walk,['low','medium','high'])||!oneOf(c.transport,['rail','car','charter'])||!safeList(c.themes,['nature','culture','food','resort'],4)||!c.themes.length||!oneOf(c.budget,BUCKETS)||!oneOf(c.party,PARTY_BANDS)||!safeList(c.ages,AGE_BANDS)||typeof c.nap!=='boolean'||!Number.isInteger(c.month)||c.month<1||c.month>12||(c.lodging!==undefined&&!oneOf(c.lodging,['hotel','homestay','any']))||Object.keys(c).some(k=>!['province','cities','start','pace','walk','transport','themes','budget','party','ages','nap','month','lodging'].includes(k)))return null;
  rows.push(['province:'+c.province,1],['budget:'+c.budget,1],['party:'+c.party,1],['month:'+c.month,1],['nap:'+(c.nap?'yes':'no'),1]);
  if(c.lodging)rows.push(['pref:lodging:'+c.lodging,1]);
  for(let key of ['start','pace','walk','transport'])rows.push(['pref:'+key+':'+c[key],1]);
  for(let k of c.cities)rows.push(['city:'+k,1]);for(let k of new Set(c.themes))rows.push(['theme:'+k,1]);for(let age of c.ages)rows.push(['age:'+age,1]);
 }else if(p.type==='plan_select'){
  let c=p.change;if(!c||!Number.isInteger(c.from)||!Number.isInteger(c.to)||c.from<0||c.from>2||c.to<0||c.to>2||Object.keys(c).some(k=>!['from','to'].includes(k)))return null;
  rows.push(['plan:'+c.to,1],['change:plan:'+c.from+':'+c.to,1]);
 }else if(EDITS.has(p.type)){
  let c=p.change;if(!c||!CITY_IDS.includes(c.city)||Object.keys(c).some(k=>!['city','from','to'].includes(k)))return null;
  if(p.type==='hotel_change'){
   if(!Number.isInteger(c.from)||!Number.isInteger(c.to)||c.from<0||c.from>=STAY_COUNTS[c.city]||c.to<0||c.to>=STAY_COUNTS[c.city])return null;
   rows.push(['change:hotel:'+c.city+':'+c.from+':'+c.to,1]);
  }else if(['activity_add','activity_delete','activity_replace'].includes(p.type)){
   if(typeof c.from!=='string'||typeof c.to!=='string'||!actId(c.from,c.city)||!actId(c.to,c.city))return null;
   rows.push(['change:'+p.type+':'+c.city+':'+c.from+':'+c.to,1]);
  }
  rows.push(['edit-city:'+c.city,1]);
 }else if(p.type==='satisfied'){
  let e=p.effort;if(!e||!Number.isInteger(e.generations)||e.generations<1||e.generations>100||!Number.isInteger(e.edits)||e.edits<0||e.edits>500||Object.keys(e).some(k=>!['generations','edits'].includes(k)))return null;
  rows.push(['effort:generations:sum',e.generations],['effort:edits:sum',e.edits],['satisfied-generations:'+(e.generations>=5?'5+':e.generations),1],['satisfied-edits:'+(e.edits===0?'0':e.edits<=2?'1-2':e.edits<=5?'3-5':e.edits<=10?'6-10':'11+'),1]);
 }
 // Discard absent branches and reject extra free text before any database operation.
 if(p.type!=='generate'&&p.choices!==undefined)return null;
 if(!EDITS.has(p.type)&&p.type!=='plan_select'&&p.change!==undefined)return null;
 if(p.type!=='satisfied'&&p.effort!==undefined)return null;
 return rows;
}

const WayfreeMetrics=(()=>{
 const key='wayfree-pages-counts-v1';
 const local=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
 const endpoint=()=>{let b=window.WAYFREE_STATS_BASE||'';if(!b)return '';let u=new URL(b);if(u.protocol!=='https:')throw Error('Statistics endpoint requires HTTPS');return u.href.replace(/\/?$/,'/')};
 return {async record(payload){let rows=metricCounters(payload);if(!rows)return false;let c=local();for(let [k,n] of rows)c[k]=(Number(c[k])||0)+n;try{localStorage.setItem(key,JSON.stringify(c))}catch{return false}
 try{let base=endpoint();if(base)fetch(new URL('metrics',base),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{})}catch{}return true},
 async read(){let base='';try{base=endpoint();if(base){let r=await fetch(new URL('stats',base),{cache:'no-store',signal:AbortSignal.timeout(4000)});if(!r.ok)throw Error();let data=await r.json();if(!Array.isArray(data.counters))throw Error();return {...data,scope:'remote'}}}catch{}return {counters:Object.entries(local()).map(([key,n])=>({key,n})),scope:'local',remoteFailed:!!base}}};
})();
