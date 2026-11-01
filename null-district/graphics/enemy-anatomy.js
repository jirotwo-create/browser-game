import * as T from '../vendor/three.module.js';
import {organic,polygonPrism} from './anatomy.js';
import {mesh,plate,loft} from './models.js';
// Authored bevelled rectangles, not circular rings: flat crown, temple walls,
// cheek ledges and a square mandible remain visible in silhouette.
export function angularShell(sections){
 const rings=sections.map(([y,w,front,back,bevel=.24])=>[[-w*(1-bevel),y,front],[w*(1-bevel),y,front],[w,y,front*(1-bevel)],[w,y,-back*(1-bevel)],[w*(1-bevel),y,-back],[-w*(1-bevel),y,-back],[-w,y,-back*(1-bevel)],[-w,y,front*(1-bevel)]]),p=[],uv=[],col=[];
 const min=sections[0][0],span=sections.at(-1)[0]-min;
 const tri=(a,b,c)=>{for(const v of[a,b,c]){p.push(...v);uv.push(v[0]*2+.5,(v[1]-min)/span);col.push(1,1,1);}};
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<8;j++){const k=(j+1)%8;tri(rings[i][j],rings[i][k],rings[i+1][k]);tri(rings[i][j],rings[i+1][k],rings[i+1][j]);}
 for(const [end,flip]of[[0,true],[rings.length-1,false]])for(let i=1;i<7;i++){const r=rings[end];tri(r[0],r[flip?i+1:i],r[flip?i:i+1]);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;
}
function portrait(){
 const v=[[-.13,1.91,.09],[.13,1.91,.09],[-.145,1.81,.105],[.145,1.81,.105],[-.13,1.72,.095],[.13,1.72,.095],[-.088,1.655,.105],[.088,1.655,.105],[0,1.65,.14],[0,1.89,.125],[0,1.80,.15],[0,1.755,.203],[-.034,1.75,.155],[.034,1.75,.155],[0,1.715,.147],[0,1.67,.135],[-.081,1.775,.143],[.081,1.775,.143]],faces=[[0,9,2],[9,10,2],[9,1,10],[1,3,10],[2,10,16],[3,17,10],[10,11,12],[10,13,11],[10,12,16],[10,17,13],[16,12,4],[17,5,13],[12,11,14],[11,13,14],[4,12,14],[13,5,14],[4,14,6],[14,15,6],[14,5,7],[14,7,15],[6,15,8],[15,7,8],[2,16,4],[3,5,17]],p=[],uv=[],col=[];
 for(const f of faces)for(const i of[f[0],f[2],f[1]]){const a=v[i];p.push(...a);uv.push((a[0]+.16)/.32,(a[1]-1.65)/.27);col.push(1,1,1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;
}
function cheekSides(){
 const front=[[1.91,.13,.09],[1.81,.145,.105],[1.72,.13,.095],[1.655,.088,.105],[1.65,0,.14]],back=[[1.91,.13,.04],[1.81,.145,.035],[1.72,.135,.035],[1.655,.09,.035],[1.65,0,.06]],p=[],uv=[],col=[];
 for(const side of[-1,1])for(let i=0;i<front.length-1;i++){
  const v=([y,x,z])=>[x*side,y,z],a=v(front[i]),b=v(back[i]),c=v(back[i+1]),d=v(front[i+1]);
  for(const t of side>0?[[a,c,b],[a,d,c]]:[[a,b,c],[a,c,d]])for(const point of t){p.push(...point);uv.push(point[2]*3+.3,(point[1]-1.65)/.27);col.push(1,1,1);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;
}
function finger(parent,m,a,b,r=.014){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),o=mesh(parent,loft([[0,r*2,r*1.8],[.7,r*1.9,r*1.7],[1,r*1.5,r*1.5]]),m,...a);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());o.scale.y=d.length();}
function hand(parent,m,skin){
 mesh(parent,angularShell([[-.37,.048,.05,.027],[-.315,.054,.055,.035],[-.275,.039,.04,.03]]),m.glove,0,0,.016);
 for(let i=0;i<4;i++){const x=(i-1.5)*.024;finger(parent,skin,[x,-.35,.046],[x,-.39,.057]);finger(parent,skin,[x,-.39,.057],[x,-.414,.025],.012);}
 finger(parent,skin,[.039,-.3,.025],[.065,-.34,.065],.017);finger(parent,skin,[.065,-.34,.065],[.028,-.36,.074],.015);
}
export const BODY_PROFILES={sable:[1,1,1],razor:[.88,.86,1.03],netrunner:[.94,.90,1.02],riot:[1.15,1.15,.99],knight:[1.12,1.16,1.02],arbalist:[.96,.94,1.03],warlock:[.90,.87,1.06]};
export function makeEnemyHuman(m,type='sable',variant=0){
 const g=new T.Group(),torso=new T.Group(),head=new T.Group(),legs=[],knees=[],arms=[];g.add(torso,head);head.position.y=-.035;
 const skin=type==='warlock'?m.skinPale:[m.skin,m.skinDeep,m.skinPale][variant%3],face=type==='warlock'?m.facePale:[m.face,m.faceDeep,m.facePale][variant%3],cloth=variant%2?m.dark:m.coat,armCloth=type==='razor'?skin:cloth;
 mesh(torso,angularShell([[.86,.175,.115,.105],[.97,.18,.125,.11],[1.08,.155,.11,.10],[1.20,.215,.16,.12],[1.36,.265,.17,.13],[1.47,.255,.12,.11],[1.56,.105,.075,.075]]),cloth);
 mesh(torso,angularShell([[.84,.19,.12,.12],[.94,.195,.13,.12],[1.0,.17,.12,.11]]),m.black);
 for(const s of[-1,1]){
  mesh(torso,polygonPrism([[s*.04,1.15],[s*.25,1.44],[s*.12,1.52],[s*.075,1.30]],.025,.008),m.dark,0,0,.16);
  const pouch=mesh(torso,loft([[-.09,.105,.075],[.07,.115,.08]]),m.glove,s*.14,.94,.12);plate(pouch,m.metal,.075,.021,.015,0,.04,.047);
  mesh(torso,polygonPrism([[s*.03,.95],[s*.19,.98],[s*.23,.59],[s*.07,.62]],.025,.01),cloth,0,0,-.11);
  mesh(torso,polygonPrism([[s*.06,1.45],[s*.25,1.43],[s*.28,1.36],[s*.11,1.40]],.013,.004),m.metal,0,0,.175);
 }
 plate(torso,m.metal,.07,.045,.025,0,.96,.15);
 mesh(g,angularShell([[1.47,.09,.075,.08],[1.60,.095,.07,.075],[1.69,.075,.07,.065]]),skin);
 const skull=mesh(head,angularShell([[1.65,.085,.08,.065],[1.70,.13,.085,.095],[1.80,.145,.08,.12],[1.92,.13,.075,.115],[2.005,.115,.06,.095]]),skin);skull.name='angular-human-skull';skull.userData.independentPose=true;
 mesh(head,portrait(),face);mesh(head,cheekSides(),skin);
 for(const s of[-1,1]){
  mesh(head,polygonPrism([[0,-.035],[s*.027,-.018],[s*.029,.024],[0,.04]],.024,.005),skin,s*.14,1.795,.005);
  mesh(head,polygonPrism([[-.044,-.014],[.043,-.010],[.038,.014],[-.04,.019]],.012,.004),m.black,s*.058,1.823,.124);
  plate(head,m.eye,.050,.008,.008,s*.058,1.823,.142);plate(head,m.black,.011,.011,.006,s*.058,1.823,.148);
  mesh(head,polygonPrism([[-.05,0],[.05,-.006],[.045,.021],[-.041,.031]],.018,.009),skin,s*.06,1.84,.13);
  mesh(head,polygonPrism([[0,0],[s*.068,.023],[s*.056,-.02],[s*.017,-.034]],.018,.005),skin,s*.056,1.777,.11);
 }
 plate(head,m.black,.065,.006,.008,0,1.706,.147);
 const hair=mesh(head,angularShell([[1.91,.133,.076,.118],[2.02,.12,.065,.10],[2.055,.065,.025,.08]]),m.hair);hair.name='cut-angular-hair';
 if(variant%3===2)mesh(head,polygonPrism([[-.11,0],[.12,.025],[.062,.10],[-.08,.065]],.045,.008),m.hair,0,1.985,.045);
 if(variant%3===1)for(const s of[-1,1])mesh(head,loft([[0,.033,.06],[.17,.043,.07]]),m.hair,s*.125,1.77,-.06);
 for(const s of[-1,1]){
  const leg=new T.Group();leg.position.set(s*.118,.91,0);g.add(leg);legs.push(leg);
  mesh(leg,angularShell([[-.43,.071,.075,.075],[-.28,.095,.11,.095],[-.11,.105,.12,.10],[0,.095,.10,.085]]),cloth);
  const knee=new T.Group();knee.position.set(0,-.43,0);leg.add(knee);knees.push(knee);
  mesh(knee,angularShell([[-.34,.047,.065,.05],[-.23,.068,.085,.06],[-.10,.073,.085,.07],[0,.067,.085,.07]]),cloth);
  mesh(knee,polygonPrism([[-.064,.02],[.06,.02],[.07,-.075],[0,-.12],[-.07,-.075]],.038,.015),m.metal,0,-.01,.077);
  mesh(knee,angularShell([[-.48,.075,.18,.075],[-.42,.083,.20,.085],[-.34,.070,.15,.075],[-.25,.052,.07,.06]]),m.black);
  plate(knee,m.metal,.14,.045,.035,0,-.38,.173);
  for(let k=0;k<3;k++)plate(knee,m.bone,.085,.012,.015,0,-.29-k*.026,.11+k*.02);
  const arm=new T.Group();arm.position.set(s*.285,1.455,0);arm.rotation.z=s*.075;g.add(arm);arms.push(arm);
  mesh(arm,angularShell([[-.30,.054,.065,.055],[-.19,.081,.095,.075],[-.06,.101,.10,.08],[0,.086,.075,.07]]),armCloth);
  const fore=new T.Group();fore.position.y=-.30;fore.rotation.x=-.5;arm.add(fore);arm.userData.forearm=fore;
  mesh(fore,angularShell([[-.285,.034,.04,.035],[-.22,.056,.065,.05],[-.10,.065,.075,.06],[0,.051,.06,.05]]),armCloth);
  mesh(fore,angularShell([[-.29,.039,.044,.037],[-.25,.044,.05,.043]]),m.glove);hand(fore,m,skin);
 }
 const [width,depth,height]=BODY_PROFILES[type];g.scale.set(width,height,depth);
 g.userData.asset={redesignedHuman:true,heroicProportions:true,headTopology:'beveled skull / wedge nose / square mandible',bodyProfile:type,features:['broad shoulders and tapered waist','flat crown and temple planes','projecting cheekbones and square jaw','deep brow and narrow eyes','large articulated hands','heavy polygonal boots','angular tailored clothing']};
 return{g,torso,head,legs,knees,arms};
}
