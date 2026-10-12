// Optional development tool. Requires Playwright; no package or network is needed by the extension.
const {chromium}=require(process.env.DREADWAKE_PLAYWRIGHT || 'playwright');
const fs=require('node:fs');const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.DREADWAKE_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();await page.goto(process.env.DREADWAKE_ASSET_ORIGIN||'http://127.0.0.1:4173/README.md');
 const groups={companion:['rat'],monster:['knight','wretch','keeper','wing','king'],gear:['rust','rags','fang','iron','reaper','mantle','thorn','cathedral','god','night'],skill:['edge','leech','execute','rage','ward','shelter','resolve','revenant','spark','echo','omen','eclipse']};
 const {EXOTICS}=await import(require('node:url').pathToFileURL(path.resolve(__dirname,'../exotics.js')));
 if(process.argv.includes('--companions')){delete groups.monster;delete groups.gear;delete groups.skill;groups.companion=['rat'];}else if(process.argv.includes('--monsters')){delete groups.companion;delete groups.gear;delete groups.skill;}else if(process.argv.includes('--exotics')){delete groups.companion;delete groups.monster;delete groups.skill;groups.gear=EXOTICS.map(e=>e.id);}else groups.gear.push(...EXOTICS.map(e=>e.id));
 const out=path.resolve(__dirname,'../assets/renders');fs.mkdirSync(out,{recursive:true});
 for(const [kind,ids]of Object.entries(groups))for(const id of ids){
  const data=await page.evaluate(async({kind,id})=>{const{assetRender}=await import('/assets/renderer.js');return assetRender(kind,id,kind==='monster'?576:256,kind==='monster'?384:256);},{kind,id});
  fs.writeFileSync(path.join(out,`${kind}-${id}.png`),Buffer.from(data.split(',')[1],'base64'));
  console.log(`Baked ${kind}: ${id}`);
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
