import puppeteer from 'puppeteer';
const URL = process.env.URL || 'http://localhost:3000/estoque';
const TIMEOUT = 20000;
const logs = [];
function push(t, ...a){const line = [new Date().toISOString(), `[${t}]`, ...a].join(' '); console.log(line); logs.push(line);}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--disable-gpu','--no-sandbox','--disable-dev-shm-usage'],
});
const page = await browser.newPage();

page.on('console', msg => push('console.'+msg.type(), ...msg.args().map(a => a._remoteObject?.value ?? '').filter(Boolean)));
page.on('pageerror', err => push('pageerror', err.message));
page.on('requestfailed', r => push('requestfailed', r.url(), r.failure()?.errorText));
page.on('error', err => push('error', err.message));

try{
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'diagnose-estoque.png', fullPage: false });
  push('info', 'Screenshot salvo em diagnose-estoque.png');
} catch(e){
  push('fatal', 'Falha ao abrir', e.message);
} finally {
  await browser.close();
}
