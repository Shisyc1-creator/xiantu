// Use the project's Playwright by default; external runtimes may be supplied explicitly.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ||
  (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
    ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright')
    : 'playwright'));

function launchBrowser() {
  const options = { headless: true };
  if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) {
    options.executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  } else if (process.env.PLAYWRIGHT_CHANNEL) {
    options.channel = process.env.PLAYWRIGHT_CHANNEL;
  }
  return chromium.launch(options);
}

function gameUrl() {
  // HTTP is useful in managed browsers that explicitly allow HTTP but disallow file URLs.
  return process.env.XIANTU_TEST_URL ||
    pathToFileURL(path.resolve(__dirname, '../prototype/index.html')).href;
}

module.exports = { launchBrowser, gameUrl };
