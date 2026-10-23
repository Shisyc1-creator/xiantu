/* 第四十一批界面回归：真实界面可达性、视口适配和独立浏览器上下文。 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/EDY/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const out = path.join(root, '.screenshots', 'batch41', 'ui-regression');
const url = pathToFileURL(path.join(root, 'prototype', 'index.html')).href;
const results = [], errors = [], failedResources = [], scrollChecks = [];
fs.mkdirSync(out, { recursive: true });

function attachErrors(page, name) {
  page.on('pageerror', error => errors.push({ page: name, type: 'pageerror', message: error.message }));
  page.on('console', message => {
    if (message.type() === 'error') errors.push({ page: name, type: 'console', message: message.text() });
  });
  page.on('requestfailed', request => failedResources.push({ page: name, url: request.url(), reason: request.failure()?.errorText }));
  page.on('response', response => {
    if (response.status() >= 400) failedResources.push({ page: name, url: response.url(), status: response.status() });
  });
}

function pass(name) { results.push(name); console.log('PASS ' + name); }

async function pageFits(page, label, withNav = true) {
  const fit = await page.evaluate(() => {
    const d = document.documentElement, body = document.body;
    const nav = document.getElementById('primaryNav');
    const r = nav?.getBoundingClientRect();
    const navVisible = !!r && r.width > 0 && r.height > 0 && r.top >= -1 && r.bottom <= innerHeight + 1;
    const tabs = [...(nav?.querySelectorAll('button') || [])].map(button => {
      const b = button.getBoundingClientRect();
      const x = b.left + b.width / 2, y = b.top + b.height / 2;
      const hit = document.elementFromPoint(x, y);
      return { text: button.textContent.trim(), visible: b.width > 0 && b.height > 0 && b.left >= -1 && b.right <= innerWidth + 1 && b.top >= -1 && b.bottom <= innerHeight + 1 && !!hit && (hit === button || button.contains(hit)) };
    });
    return { width: innerWidth, scrollWidth: Math.max(d.scrollWidth, body.scrollWidth), navVisible, tabs };
  });
  assert(fit.scrollWidth <= fit.width + 1, label + ' 横向溢出：' + JSON.stringify(fit));
  if (withNav) {
    assert(fit.navVisible, label + ' 主导航不在视口内：' + JSON.stringify(fit));
    assert(fit.tabs.length === 5 && fit.tabs.every(tab => tab.visible), label + ' 主导航被遮挡或缺失：' + JSON.stringify(fit));
  }
  pass(label + ' 无横向溢出' + (withNav ? '，五项主导航可见且无遮挡' : ''));
}

async function readingReachable(page, label) {
  const scroll = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll('#scene, .sb-scroll, .stage')];
    const rows = candidates.filter(el => {
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && ['auto', 'scroll'].includes(s.overflowY) && el.scrollHeight > el.clientHeight + 2;
    }).map(el => {
      const before = el.scrollTop;
      el.scrollTop = el.scrollHeight;
      const moved = el.scrollTop > 0;
      const row = { selector: el.className || el.id, height: el.clientHeight, scrollHeight: el.scrollHeight, moved };
      el.scrollTop = before;
      return row;
    });
    if (document.documentElement.scrollHeight > innerHeight + 2) {
      const before = scrollY;
      scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
      rows.push({ selector: 'document', height: innerHeight, scrollHeight: document.documentElement.scrollHeight, moved: scrollY > 0 });
      scrollTo({ top: before, behavior: 'instant' });
    }
    return rows;
  });
  assert(scroll.every(row => row.moved), label + ' 阅读容器无法滚动：' + JSON.stringify(scroll));
  scrollChecks.push({ label, containers: scroll });

  const lastButton = await page.locator('#scene button').evaluateAll(buttons => {
    const visible = buttons.filter(button => {
      const r = button.getBoundingClientRect(), s = getComputedStyle(button);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    });
    const target = visible.at(-1);
    if (!target) return null;
    target.setAttribute('data-visual39-last', 'true');
    return target.textContent.trim();
  });
  if (lastButton) {
    const target = page.locator('[data-visual39-last="true"]');
    await target.scrollIntoViewIfNeeded();
    const reach = await target.evaluate(button => {
      const r = button.getBoundingClientRect(), nav = document.getElementById('primaryNav');
      const nr = nav?.getBoundingClientRect();
      const bottom = nr && nr.height && nr.top >= 0 ? Math.min(innerHeight, nr.top) : innerHeight;
      return { top: r.top, bottom: r.bottom, viewportBottom: bottom, width: r.width, text: button.textContent.trim() };
    });
    assert(reach.top >= -1 && reach.bottom <= reach.viewportBottom + 1, label + ' 末尾操作无法完整滚入可操作区域：' + JSON.stringify(reach));
    await target.evaluate(button => button.removeAttribute('data-visual39-last'));
  }
  pass(label + ' 阅读区域可滚动，末尾操作可达');
}

async function resetScroll(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('#scene, .sb-scroll, .stage')) el.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function fixture(page) {
  const ready = await page.evaluate(() => {
    newGame('沈行舟', '寒门散修', '男');
    chooseChild(0);XTOpening46.chooseTimeline(8,8);
    G.root = '四灵根'; G.coef = ROOTS['四灵根'].coef; G.cap = ROOTS['四灵根'].cap;
    if(window.XTOpening46?.pending())for(let openingStep46=0;openingStep46<4;openingStep46++)XTOpening46.dispatch(XTOpening46.token(),0);beginCultivation();
    G.mode = 'idle'; G.lastResult = null; G.stones = 3000; G.inventory = { herb: 36, ironOre: 12 };
    tryEvent = () => null; meetLive = () => null; render();
    advanceDays(14, { act: 'test', rate: 0, incomeMul: 0, eventRate: 0 });
    XTWorld36.get(XTShop38.operator()).alive = false;
    XTWorld36.sync(); render();
    advanceDays(30, { act: 'test', rate: 0, incomeMul: 0, eventRate: 0 });
    G.place = 'county';
    const d = XTSandbox.state(); d.roomAt = 'county'; d.room = 'shops';
    G.live.county = [{ id: 'E027', born: absMonth(), until: absMonth() + 1 }, { id: 'E026', born: absMonth(), until: absMonth() + 3 }];
    XTWorld36.sync();
    XTSandbox.view.actor = null; XTSandbox.view.detail = null;
    XTSandbox.go('scene');
    return G.shop38.ownerId === XTShop38.HEIR && G.local37.phase === 'shortage';
  });
  assert(ready, '百草铺接班与缺药受控场景未建立');
}

async function creator(browser, width, height, name) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage(); attachErrors(page, name);
  try {
    await page.goto(url);
    await page.locator('#coverBegin').click();
    await page.locator('#inName').fill('林知微');
    await page.locator('#sexOpts [data-s="女"]').click();
    const origin = page.locator('#originOpts .opt').nth(1);
    const selectedOrigin = await origin.getAttribute('data-o');
    await origin.click();
    assert(await origin.evaluate(button => button.classList.contains('sel')), name + ' 出身未选中');
    assert(await page.locator('#sexOpts [data-s="女"]').evaluate(button => button.classList.contains('sel')), name + ' 性别未选中');
    await origin.hover();
    const contrast = await origin.evaluate(button => {
      const rgb = value => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const lum = values => values.map(value => {
        const v = value / 255;
        return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
      }).reduce((total, value, index) => total + value * [.2126, .7152, .0722][index], 0);
      const text = getComputedStyle(button.querySelector('.t') || button).color;
      const background = getComputedStyle(button).backgroundColor;
      const [low, high] = [lum(rgb(text)), lum(rgb(background))].sort((a, b) => a - b);
      return { text, background, ratio: (high + .05) / (low + .05) };
    });
    assert(contrast.ratio >= 4.5, name + ' 选中出身悬停后文字难以辨认：' + JSON.stringify(contrast));
    pass(name + ' 选中出身悬停后文字对比度至少4.5:1');
    await pageFits(page, name, false);
    await page.locator('#creationSheet').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
    await page.locator('#btnStart').click();
    const state = await page.evaluate(() => ({ mode: G.mode, name: G.name, sex: G.sex, origin: G.origin, choices: document.querySelectorAll('#scene .choice').length }));
    assert(state.mode === 'child' && state.name === '林知微' && state.sex === '女' && state.origin === selectedOrigin && state.choices > 0, name + ' 未正确进入童年：' + JSON.stringify(state));
    await pageFits(page, name + '进入童年', false);
    pass(name + ' 道号、性别、出身选择与开始按钮正常进入童年');
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    await creator(browser, 1440, 1000, 'desktop-creation');
    await creator(browser, 390, 844, 'mobile-creation');
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage(); attachErrors(page, 'game');
    try {
      await page.goto(url);
      await fixture(page);
      const sizes = [[360, 800], [390, 844], [390, 667], [430, 932], [768, 1024], [1024, 768], [1440, 1000]];
      for (const [width, height] of sizes) {
        await page.setViewportSize({ width, height });
        await fixture(page);
        for (const [tab, label] of [['cult', '修行'], ['scene', '场景'], ['bag', '行囊'], ['home', '家园'], ['self', '人物']]) {
          await page.locator('[data-sb-nav="' + tab + '"]').click();
          assert(await page.evaluate(id => XTSandbox.view.tab === id, tab), label + ' 导航点击未生效');
          assert((await page.locator('#scene').innerText()).trim().length > 5, label + ' 页面为空');
          await pageFits(page, `${width}×${height} ${label}`);
          await readingReachable(page, `${width}×${height} ${label}`);
        }
        await page.locator('[data-sb-nav="scene"]').click();
        await page.locator('[data-sb="room"][data-arg="shops"]').click();
        assert(await page.evaluate(() => !XTSandbox.view.actor && !XTSandbox.view.detail), `${width}×${height} 房间截图前仍有选中人物`);
        await resetScroll(page);
        if (width <= 860) {
          const order = await page.evaluate(() => {
            const room = document.querySelector('.sb-place');
            const title = room?.querySelector('h3');
            const person = room?.querySelector('.sb-person');
            const medicine = room?.querySelector('.local37');
            const account = room?.querySelector('.shop38');
            const top = el => el ? el.getBoundingClientRect().top : null;
            return { title: top(title), person: top(person), medicine: top(medicine), account: top(account) };
          });
          assert(Object.values(order).every(value => value !== null) && order.title < order.medicine && order.title < order.account && order.person < order.medicine && order.person < order.account, `${width}×${height} 手机无选中时房间标题和人物未排在长告示前：` + JSON.stringify(order));
          pass(`${width}×${height} 无选中时房间标题和人物先于药讯与铺账`);
        }
        if (width === 390 && height === 844) await page.screenshot({ path: path.join(out, 'mobile-scene.png'), fullPage: true });
        const event = page.locator('[data-sb="chase"][data-arg="E026"]');
        assert(await event.count(), `${width}×${height} 缺少客栈闲话入口`);
        await event.click({ trial: true });
        await page.locator('[data-sb="actor"][data-arg="baicao_apprentice38"]').click();
        for (const [action, label] of [['s38:support', '赠资周转'], ['l37:supply', '供药'], ['l37:donate', '赠药'], ['l37:premium', '急价供药']]) {
          const control = page.locator('[data-sb="' + action + '"]');
          assert(await control.count(), `${width}×${height} 缺少${label}入口`);
          assert(await control.isEnabled(), `${width}×${height} ${label}在资源充足时被禁用`);
          await control.click({ trial: true });
        }
        pass(`${width}×${height} 客栈、赠资、供药、赠药与急价入口均可达`);
        await pageFits(page, `${width}×${height} 人物详情`);
        await resetScroll(page);
        if (width === 390 && height === 844) await page.screenshot({ path: path.join(out, 'mobile-person.png'), fullPage: true });
        if (width === 1440) await page.screenshot({ path: path.join(out, 'desktop-scene.png'), fullPage: true });
        if (width <= 768) {
          await page.locator('[data-sb="clearActor"]').click();
          assert(await page.evaluate(() => !XTSandbox.view.actor && !XTSandbox.view.detail), `${width}×${height} 返回房间未清除人物详情`);
          await page.locator('[data-sb="chase"][data-arg="E026"]').click({ trial: true });
          pass(`${width}×${height} 返回房间可恢复房间操作`);
        }
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await fixture(page);
      await page.locator('[data-sb-nav="self"]').click();
      await page.locator('[data-sb="sub"][data-arg="settings"]').click();
      await page.locator('[data-sb="settings"]').click();
      await page.locator('#prefFont').selectOption('large');
      await page.locator('#prefMotion').uncheck();
      await page.locator('#prefApply').click();
      await page.locator('#tClose').click();
      assert(await page.evaluate(() => document.body.classList.contains('ui-large') && readUIPrefs().font === 'large'), '大字设置未应用');
      for (const [tab, label] of [['cult', '修行'], ['scene', '场景'], ['bag', '行囊'], ['home', '家园'], ['self', '人物']]) {
        await page.locator('[data-sb-nav="' + tab + '"]').click();
        await pageFits(page, '390 大字 ' + label);
        await readingReachable(page, '390 大字 ' + label);
      }
      await resetScroll(page);
      await page.screenshot({ path: path.join(out, 'mobile-large.png'), fullPage: true });
      assert.deepStrictEqual(errors, [], '浏览器或控制台错误');
      assert.deepStrictEqual(failedResources, [], '资源加载错误');
      pass('独立 Edge 上下文无浏览器、控制台及资源错误');
    } finally { await context.close(); }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(out, 'visual-validation.json'), JSON.stringify({ checks: results.length, results, errors, failedResources, scrollChecks, scope: '独立 Edge 临时上下文；360/390/430/768/1024/1440宽及390×667短屏；五主页面、创角、阅读滚动、手机人物返回、保留操作入口与大字设置。受控游戏状态，玩法回归由原4套测试覆盖。' }, null, 2));
  }
  console.log('ALL ' + results.length + ' VISUAL CHECKS PASSED');
})().catch(error => { console.error(error); process.exitCode = 1; });
