import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const origin = process.env.PREVIEW_ORIGIN ?? "http://127.0.0.1:3100";
const outputDir = path.resolve("reports/screenshots");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openPort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 9333;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForJson(url, timeout = 10_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class Cdp {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(url);
  }

  async connect() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }

      const handlers = this.listeners.get(message.method) ?? [];
      handlers.forEach((handler) => handler(message.params));
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  on(method, handler) {
    const handlers = this.listeners.get(method) ?? [];
    handlers.push(handler);
    this.listeners.set(method, handlers);
  }

  once(method) {
    return new Promise((resolve) => {
      const handler = (params) => {
        const handlers = this.listeners.get(method) ?? [];
        this.listeners.set(method, handlers.filter((item) => item !== handler));
        resolve(params);
      };
      this.on(method, handler);
    });
  }

  close() {
    this.socket.close();
  }
}

async function newPage(debugPort, url, viewport, reducedMotion = false) {
  const target = await fetch(
    `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`,
    { method: "PUT" },
  ).then((response) => response.json());
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.connect();
  const issues = [];

  cdp.on("Runtime.exceptionThrown", (event) => {
    issues.push(`exception: ${event.exceptionDetails?.text ?? "unknown"}`);
  });
  cdp.on("Log.entryAdded", (event) => {
    if (["error", "warning"].includes(event.entry?.level)) {
      issues.push(`${event.entry.level}: ${event.entry.text}`);
    }
  });
  cdp.on("Runtime.consoleAPICalled", (event) => {
    if (["error", "warning"].includes(event.type)) {
      issues.push(`console.${event.type}`);
    }
  });

  await Promise.all([
    cdp.send("Page.enable"),
    cdp.send("Runtime.enable"),
    cdp.send("Log.enable"),
    cdp.send("Network.enable"),
  ]);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 800,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [
      {
        name: "prefers-reduced-motion",
        value: reducedMotion ? "reduce" : "no-preference",
      },
    ],
  });
  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await loaded;
  await cdp.send("Runtime.evaluate", {
    expression: "document.fonts?.ready",
    awaitPromise: true,
  });
  await delay(350);
  return { cdp, issues, target };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return result.result?.value;
}

async function inspectPage(cdp) {
  return evaluate(
    cdp,
    `(() => {
      const root = document.documentElement;
      const body = document.body;
      const images = [...document.images];
      const links = [...document.querySelectorAll('a[href]')];
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim() ?? null,
        width: innerWidth,
        height: innerHeight,
        scrollWidth: Math.max(root.scrollWidth, body.scrollWidth),
        scrollHeight: Math.max(root.scrollHeight, body.scrollHeight),
        horizontalOverflow: Math.max(root.scrollWidth, body.scrollWidth) > innerWidth + 1,
        brokenImages: images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
        emptyLinks: links.filter((link) => !link.getAttribute('href') || link.getAttribute('href') === '#').map((link) => link.textContent?.trim()),
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
        description: document.querySelector('meta[name="description"]')?.content ?? null,
      };
    })()`,
  );
}

async function screenshot(cdp, filename, fullPage) {
  let params = { format: "png", fromSurface: true, captureBeyondViewport: fullPage };
  if (fullPage) {
    await evaluate(
      cdp,
      `new Promise(async (resolve) => {
        const images = [...document.images];
        images.forEach((image) => { image.loading = 'eager'; });
        const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        for (let y = 0; y < height; y += Math.max(500, innerHeight * 0.75)) {
          scrollTo(0, y);
          await new Promise((step) => setTimeout(step, 90));
        }
        await Promise.race([
          Promise.all(images.map((image) => image.complete
            ? Promise.resolve()
            : new Promise((done) => {
                image.addEventListener('load', done, { once: true });
                image.addEventListener('error', done, { once: true });
              }))),
          new Promise((done) => setTimeout(done, 5000))
        ]);
        scrollTo(0, 0);
        await new Promise((step) => setTimeout(step, 250));
        resolve(true);
      })`,
    );
    const metrics = await cdp.send("Page.getLayoutMetrics");
    const size = metrics.cssContentSize ?? metrics.contentSize;
    params = {
      ...params,
      clip: {
        x: 0,
        y: 0,
        width: Math.ceil(size.width),
        height: Math.ceil(size.height),
        scale: 1,
      },
    };
  }
  const result = await cdp.send("Page.captureScreenshot", params);
  await writeFile(path.join(outputDir, filename), Buffer.from(result.data, "base64"));
}

async function closePage(cdp) {
  try {
    await cdp.send("Page.close");
  } catch {
    // The target may close before acknowledging the command.
  }
  cdp.close();
}

async function run() {
  await mkdir(outputDir, { recursive: true });
  const debugPort = await openPort();
  const profile = await mkdtemp(path.join(os.tmpdir(), "heylanguages-chrome-"));
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--autoplay-policy=no-user-gesture-required",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  const summary = {
    origin,
    viewports: [],
    accessibility: [],
    interactions: {},
    routeChecks: {},
  };

  try {
    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
    const viewports = [
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1024, height: 900 },
      { width: 1440, height: 1000 },
    ];
    const pages = [
      { key: "home", path: "/" },
      { key: "heyyusuf", path: "/heyyusuf" },
    ];
    const axeSource = await readFile(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

    for (const page of pages) {
      for (const viewport of viewports) {
        const { cdp, issues } = await newPage(
          debugPort,
          `${origin}${page.path}`,
          viewport,
          viewport.width === 768,
        );
        const inspection = await inspectPage(cdp);
        summary.viewports.push({ page: page.key, ...viewport, ...inspection, issues });

        if (viewport.width === 390 || viewport.width === 1440) {
          await cdp.send("Runtime.evaluate", { expression: axeSource });
          const axeResults = await evaluate(
            cdp,
            `axe.run(document, { resultTypes: ['violations'] }).then((results) => ({
              violations: results.violations.map((violation) => ({
                id: violation.id,
                impact: violation.impact,
                description: violation.description,
                targets: violation.nodes.flatMap((node) => node.target)
              }))
            }))`,
          );
          summary.accessibility.push({
            page: page.key,
            width: viewport.width,
            ...axeResults,
          });
        }

        const name = `${page.key}-${viewport.width}`;
        if (viewport.width === 390 || viewport.width === 1440) {
          await screenshot(cdp, `${name}-full.png`, true);
        }
        if (viewport.width === 1440) {
          await screenshot(cdp, `${name}-hero.png`, false);
        }
        await closePage(cdp);
      }
    }

    {
      const { cdp, issues } = await newPage(
        debugPort,
        `${origin}/heyyusuf#try-arabic`,
        { width: 1024, height: 900 },
      );
      await evaluate(cdp, "document.querySelector('#try-arabic')?.scrollIntoView() ");
      await delay(250);
      await evaluate(cdp, "document.querySelector('[role=tab][id$=egyptian]')?.click()");
      await evaluate(cdp, "document.querySelector('.audio-play')?.click()");
      await delay(500);
      const playingText = await evaluate(cdp, "document.querySelector('.audio-status')?.textContent?.trim()");
      await screenshot(cdp, "heyyusuf-audio-sample-1024.png", false);
      await evaluate(cdp, "document.querySelector('[role=tab][id$=gulf]')?.click()");
      const switchedText = await evaluate(cdp, "document.querySelector('.audio-panel__variety')?.textContent?.trim()");
      const stoppedText = await evaluate(cdp, "document.querySelector('.audio-status')?.textContent?.trim()");
      await evaluate(cdp, "document.querySelector('.audio-play')?.click()");
      await delay(250);
      await evaluate(cdp, "document.querySelector('.product-final')?.scrollIntoView()");
      await delay(250);
      const leftSectionText = await evaluate(cdp, "document.querySelector('.audio-status')?.textContent?.trim()");
      summary.interactions.audio = {
        playingText,
        switchedText,
        stoppedText,
        leftSectionText,
        issues,
      };
      await closePage(cdp);
    }

    {
      const { cdp, issues } = await newPage(
        debugPort,
        `${origin}/heyyusuf#faq-title`,
        { width: 1024, height: 900 },
      );
      await evaluate(cdp, "document.querySelector('.faq-section')?.scrollIntoView() ");
      await delay(250);
      await evaluate(cdp, "document.querySelector('.faq-item summary')?.click()");
      const firstOpen = await evaluate(cdp, "document.querySelector('.faq-item')?.open");
      summary.interactions.faq = { firstOpen, issues };
      await closePage(cdp);
    }

    {
      const { cdp, issues } = await newPage(
        debugPort,
        `${origin}/`,
        { width: 390, height: 844 },
      );
      await evaluate(cdp, "document.querySelector('.mobile-menu__trigger')?.click()");
      await delay(200);
      const state = await evaluate(
        cdp,
        `({
          expanded: document.querySelector('.mobile-menu__trigger')?.getAttribute('aria-expanded'),
          dialogVisible: Boolean(document.querySelector('[role=dialog]')),
          focused: document.activeElement?.textContent?.trim()
        })`,
      );
      await screenshot(cdp, "home-mobile-menu-390.png", false);
      await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
      await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
      await delay(100);
      const closedState = await evaluate(
        cdp,
        `({
          expanded: document.querySelector('.mobile-menu__trigger')?.getAttribute('aria-expanded'),
          dialogVisible: Boolean(document.querySelector('[role=dialog]')),
          focusReturned: document.activeElement === document.querySelector('.mobile-menu__trigger')
        })`,
      );
      summary.interactions.mobileMenu = { ...state, closedState, issues };
      await closePage(cdp);
    }

    {
      const { cdp, issues } = await newPage(
        debugPort,
        `${origin}/heyyusuf`,
        { width: 390, height: 844 },
        true,
      );
      await evaluate(cdp, "document.documentElement.style.fontSize = '200%'");
      await delay(200);
      const inspection = await inspectPage(cdp);
      await screenshot(cdp, "heyyusuf-text-200-390.png", false);
      const reducedMotion = await evaluate(
        cdp,
        `({
          matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
          transitionDuration: getComputedStyle(document.querySelector('.button')).transitionDuration
        })`,
      );
      summary.interactions.textResize = { ...inspection, reducedMotion, issues };
      await closePage(cdp);
    }

    {
      const { cdp, issues } = await newPage(
        debugPort,
        `${origin}/heyyusuf/support`,
        { width: 1024, height: 900 },
      );
      await screenshot(cdp, "support-1024.png", false);
      const inspection = await inspectPage(cdp);
      summary.interactions.support = { ...inspection, issues };
      await closePage(cdp);
    }

    const routes = [
      "/",
      "/heyyusuf",
      "/heyyusuf/privacy",
      "/heyyusuf/terms",
      "/heyyusuf/support",
      "/heyyusuf/delete-account",
      "/robots.txt",
      "/sitemap.xml",
      "/opengraph-image",
      "/heyyusuf/opengraph-image",
    ];
    for (const route of routes) {
      const response = await fetch(`${origin}${route}`, { redirect: "manual" });
      summary.routeChecks[route] = {
        status: response.status,
        contentType: response.headers.get("content-type"),
      };
    }
    const turnstile = await fetch(`${origin}/turnstile`);
    summary.routeChecks["/turnstile (invalid)"] = {
      status: turnstile.status,
      cacheControl: turnstile.headers.get("cache-control"),
    };

    await writeFile(
      path.join(outputDir, "browser-qa.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
    );
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } finally {
    chrome.kill("SIGTERM");
    await delay(250);
    await rm(profile, { recursive: true, force: true });
  }
}

await run();
