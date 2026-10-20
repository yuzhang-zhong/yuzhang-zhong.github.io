/* Temporary validation-branch test. It does not publish the website. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const out = 'banban-qa-results';
fs.mkdirSync(out, { recursive: true });
const baseline = cp.execFileSync('git', ['show', '1b8a16e33b0c6ad0ab7a2db70b9b10f50f7a3066:assets/css/banban-pet.css'], { encoding: 'utf8' });
const results = { baseline: {}, scenarios: [], errors: [] };
const closeTo = (a,b,message) => assert(Math.abs(a-b)<0.2, `${message}: ${a} != ${b}`);
(async () => {
 const browser = await chromium.launch();
 async function measure(page) {
  return page.evaluate(() => {
   const root=document.querySelector('#banban-pet'), menu=root.querySelector('.banban-pet__options');
   const rect=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}};
   const style=getComputedStyle(menu), button=menu.querySelector('button'), sprite=root.querySelector('.banban-pet__sprite');
   return {root:rect(root),menu:rect(menu),button:rect(button),font:getComputedStyle(button).fontSize,padding:style.padding,nameFont:getComputedStyle(menu.querySelector('span')).fontSize,sprite:rect(sprite),spriteTransition:getComputedStyle(sprite).transitionDuration,rootTransition:getComputedStyle(root).transitionDuration,background:style.backgroundColor,color:style.color,viewport:{width:innerWidth,height:innerHeight},overflow:document.documentElement.scrollWidth>innerWidth};
  });
 }
 async function open(options={},old=false) {
  const context=await browser.newContext(options); const page=await context.newPage();
  page.on('pageerror',e=>results.errors.push(e.message));
  // Use the newly built files for absolute site URLs too; never exercise the live site.
  await page.route('**/*', async route => {
   const url=route.request().url();
   if(url.startsWith('http://127.0.0.1:8765/')) return route.continue();
   if(url.startsWith('https://yuzhang-zhong.github.io/')) {
    const response=await route.fetch({url:url.replace('https://yuzhang-zhong.github.io','http://127.0.0.1:8765')});
    return route.fulfill({response});
   }
   return route.abort();
  });
  if(old) await page.route('**/assets/css/banban-pet.css*',route=>route.fulfill({status:200,contentType:'text/css',body:baseline}));
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
  await page.locator('#banban-pet').waitFor({state:'visible'});
  return {context,page};
 }
 async function menu(page) { await page.locator('.banban-pet__cat').click({button:'right'}); await page.locator('.banban-pet__options').waitFor({state:'visible'}); }
 const old=await open({viewport:{width:1440,height:1000}},true); await menu(old.page); results.baseline=await measure(old.page); await old.page.screenshot({path:`${out}/desktop-before.png`}); await old.context.close();
 for (const theme of ['light','dark']) {
  for (const mobile of [false,true]) {
   const name=`${mobile?'mobile':'desktop'}-${theme}`;
   const {context,page}=await open({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,colorScheme:theme});
   // Exercise the site's existing theme preference before reloading.
   await page.evaluate(t=>localStorage.setItem('theme',t),theme); await page.reload({waitUntil:'networkidle'}); await page.locator('#banban-pet').waitFor({state:'visible'});
   const p0=await page.locator('#banban-pet').boundingBox(); await page.waitForTimeout(1900);const p1=await page.locator('#banban-pet').boundingBox();assert(p1.x<p0.x,'unfocused pet walks');
   await page.locator('.banban-pet__cat').click(); assert(await page.locator('#banban-pet').evaluate(el=>el.hasAttribute('data-happy')),'click reaction');
   if(mobile){await page.locator('.banban-pet__settings').tap();}else{await menu(page);}
   const m=await measure(page);closeTo(m.menu.width,118,'compact menu width');closeTo(m.button.height,mobile?32:26,'button height');assert.equal(m.font,'11px');assert.equal(m.padding,'4px');assert.equal(m.nameFont,'10px');closeTo(m.sprite.width,mobile?36:40,'cat size unchanged');assert.equal(m.spriteTransition,'0s');assert.equal(m.rootTransition,'0s');assert(!m.overflow,'page has no horizontal overflow');assert(m.menu.x>=0&&m.menu.y>=0&&m.menu.x+m.menu.width<=m.viewport.width&&m.menu.y+m.menu.height<=m.viewport.height,'menu stays inside viewport');
   const expectedTheme=await page.locator('html').getAttribute('data-theme');assert(theme==='dark'?expectedTheme==='dark':expectedTheme!=='dark','actual theme applied');
   await page.screenshot({path:`${out}/${name}.png`});
   await page.locator('.banban-pet__pause').click();await page.locator('h1').first().click();await page.mouse.move(0,0);const paused0=await page.locator('#banban-pet').boundingBox();await page.waitForTimeout(1100);assert.deepEqual(await page.locator('#banban-pet').boundingBox(),paused0,'pause stops walking');
   await page.locator('.banban-pet__cat').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'banban-pet__settings');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.className),'banban-pet__pause');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.className),'banban-pet__cat');
   await page.locator('.banban-pet__settings').click();await page.locator('.banban-pet__hide').click();assert(await page.locator('#banban-pet').isHidden());await page.reload({waitUntil:'networkidle'});assert(await page.locator('#banban-pet').isHidden());await page.getByRole('button',{name:'Show Banban',exact:true}).click();assert(await page.locator('#banban-pet').isVisible());
   // Drag to upper-left; the menu must open below and remain within the viewport.
   const b=await page.locator('.banban-pet__cat').boundingBox();await page.mouse.move(b.x+20,b.y+20);await page.mouse.down();await page.mouse.move(25,25,{steps:10});await page.mouse.up();await menu(page);const corner=await measure(page);assert(corner.menu.x>=0&&corner.menu.y>=0&&corner.menu.x+corner.menu.width<=corner.viewport.width&&corner.menu.y+corner.menu.height<=corner.viewport.height,'corner menu fits');
   results.scenarios.push({name,measurements:m,checks:['walk','click reaction','menu size','sprite transitions disabled','pause','keyboard and Escape','hide persistence','footer restore','drag and corner menu']});await context.close();
  }
 }
 const reduced=await open({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const r=reduced.page;const rb=await r.locator('#banban-pet').boundingBox();await r.waitForTimeout(1800);assert.deepEqual(await r.locator('#banban-pet').boundingBox(),rb,'reduced motion is static');await r.locator('.banban-pet__settings').click();assert(await r.locator('.banban-pet__pause').isDisabled());const rm=await measure(r);assert(rm.menu.x>=0&&rm.menu.x+rm.menu.width<=390);await r.screenshot({path:`${out}/mobile-reduced-motion.png`});results.scenarios.push({name:'reduced-motion',measurements:rm,checks:['no movement','pause disabled','menu fits']});await reduced.context.close();
 assert.deepEqual(results.errors,[],'no JavaScript page errors');
 fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(error=>{results.failure=error.stack;fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.error(error);process.exit(1)});
