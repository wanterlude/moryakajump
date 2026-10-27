// Минимальное DOM-окружение, достаточное, чтобы бандл игры загрузился в Node.
// Рисование не нужно: симулятор отключает цикл отрисовки и двигает update() сам.
// Всё, чего нет в заглушке, возвращает пустую функцию — так проще переживать
// экзотические вызовы canvas/DOM, которых сотни.
const fs = require("fs");
const vm = require("vm");

function makeGradient() {
  return { addColorStop() {} };
}

function makeCtx(canvas) {
  const target = {
    canvas,
    save() {}, restore() {}, beginPath() {}, closePath() {},
    moveTo() {}, lineTo() {}, arc() {}, arcTo() {}, ellipse() {}, rect() {}, roundRect() {},
    quadraticCurveTo() {}, bezierCurveTo() {}, conicCurveTo() {},
    fill() {}, stroke() {}, clip() {},
    fillRect() {}, strokeRect() {}, clearRect() {},
    translate() {}, rotate() {}, scale() {}, transform() {}, setTransform() {}, resetTransform() {},
    drawImage() {}, putImageData() {},
    createLinearGradient: makeGradient,
    createRadialGradient: makeGradient,
    createConicGradient: makeGradient,
    createPattern: makeGradient,
    measureText(text) { return { width: String(text == null ? "" : text).length * 6 }; },
    getImageData(x, y, w, h) {
      const width = Math.max(1, w | 0);
      const height = Math.max(1, h | 0);
      return { data: new Uint8ClampedArray(width * height * 4), width, height };
    },
    createImageData(w, h) {
      const width = Math.max(1, w | 0);
      const height = Math.max(1, h | 0);
      return { data: new Uint8ClampedArray(width * height * 4), width, height };
    },
    setLineDash() {}, getLineDash() { return []; },
    fillText() {}, strokeText() {}, isPointInPath() { return false; },
    globalAlpha: 1, globalCompositeOperation: "source-over",
    fillStyle: "#000", strokeStyle: "#000",
    lineWidth: 1, lineCap: "butt", lineJoin: "miter", miterLimit: 10,
    font: "10px sans-serif", textAlign: "start", textBaseline: "alphabetic",
    shadowBlur: 0, shadowColor: "#000", shadowOffsetX: 0, shadowOffsetY: 0,
    filter: "none", imageSmoothingEnabled: true, imageSmoothingQuality: "low",
    direction: "ltr", letterSpacing: "0px",
  };
  return new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop];
      return function noop() {};
    },
    set(t, prop, value) {
      t[prop] = value;
      return true;
    },
  });
}

function makeElement(tagName, id) {
  const el = {
    tagName: String(tagName || "div").toUpperCase(),
    nodeName: String(tagName || "div").toUpperCase(),
    nodeType: 1,
    id: id || "",
    className: "",
    style: {},
    dataset: {},
    classList: {
      add() {}, remove() {}, toggle() {}, contains() { return false; },
      replace() {}, forEach() {},
    },
    children: [],
    childNodes: [],
    parentNode: null,
    parentElement: null,
    innerHTML: "",
    textContent: "",
    innerText: "",
    value: "",
    checked: false,
    disabled: false,
    hidden: false,
    width: 1600,
    height: 2400,
    naturalWidth: 0,
    naturalHeight: 0,
    offsetWidth: 600,
    offsetHeight: 900,
    clientWidth: 600,
    clientHeight: 900,
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 900,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; },
    appendChild(child) { this.children.push(child); return child; },
    append(...items) { for (const item of items) this.appendChild(item); },
    insertBefore(child) { this.children.unshift(child); return child; },
    removeChild(child) {
      const i = this.children.indexOf(child);
      if (i >= 0) this.children.splice(i, 1);
      return child;
    },
    replaceChild(child) { return child; },
    remove() {},
    setAttribute() {},
    getAttribute() { return null; },
    removeAttribute() {},
    hasAttribute() { return false; },
    toggleAttribute() { return true; },
    contains() { return false; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementsByTagName() { return []; },
    getElementsByClassName() { return []; },
    closest() { return null; },
    matches() { return false; },
    focus() {},
    blur() {},
    click() {},
    scrollIntoView() {},
    scrollTo() {},
    setPointerCapture() {},
    releasePointerCapture() {},
    hasPointerCapture() { return false; },
    getBoundingClientRect() {
      return { x: 0, y: 0, left: 0, top: 0, right: 600, bottom: 900, width: 600, height: 900 };
    },
    getBoundingClientRectEmpty() {
      return { x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    },
    toDataURL() { return "data:image/png;base64,"; },
    requestFullscreen() { return Promise.resolve(); },
    animate() { return { cancel() {}, finished: Promise.resolve() }; },
    attachShadow() { return makeElement("div"); },
    cloneNode() { return makeElement(tagName, id); },
  };
  const ctx = makeCtx(el);
  el.getContext = () => ctx;
  el.getContext2d = () => ctx;
  return el;
}

function createSandbox() {
  const start = Date.now();
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, makeElement(id === "game" ? "canvas" : "div", id));
    return elements.get(id);
  };

  const storage = new Map();
  const localStorage = {
    getItem: (k) => (storage.has(String(k)) ? storage.get(String(k)) : null),
    setItem: (k, v) => { storage.set(String(k), String(v)); },
    removeItem: (k) => { storage.delete(String(k)); },
    clear: () => storage.clear(),
    key: (i) => [...storage.keys()][i] ?? null,
    get length() { return storage.size; },
  };

  const audioNode = () => ({
    connect() {}, disconnect() {}, start() {}, stop() {},
    frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
    gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
    type: "", onended: null,
  });
  class AudioContextShim {
    constructor() {
      this.currentTime = 0;
      this.state = "running";
      this.sampleRate = 44100;
      this.destination = audioNode();
    }
    createOscillator() { return audioNode(); }
    createGain() { return audioNode(); }
    createBiquadFilter() { return audioNode(); }
    createDynamicsCompressor() { return audioNode(); }
    createBuffer() { return { getChannelData: () => new Float32Array(128) }; }
    createBufferSource() { return audioNode(); }
    resume() { return Promise.resolve(); }
    suspend() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  }

  class ImageShim {
    constructor() { this.width = 0; this.height = 0; this.complete = false; this.onload = null; this.onerror = null; }
    addEventListener(type, fn) { if (type === "load") this.onload = fn; }
    removeEventListener() {}
    set src(value) { this._src = value; }
    get src() { return this._src || ""; }
  }

  const document = {
    getElementById: (id) => element(String(id)),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => makeElement(tag),
    createElementNS: (_ns, tag) => makeElement(tag),
    createTextNode: (text) => ({ nodeType: 3, textContent: String(text), parentNode: null }),
    createDocumentFragment: () => makeElement("fragment"),
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; },
    hasFocus() { return true; },
    exitFullscreen() { return Promise.resolve(); },
    get body() { return element("body"); },
    get head() { return element("head"); },
    get documentElement() { return element("html"); },
    fonts: { ready: Promise.resolve(), add() {}, delete() {}, load: () => Promise.resolve([]), check: () => true },
    styleSheets: [],
    hidden: false,
    visibilityState: "visible",
    fullscreenElement: null,
    fullscreenEnabled: true,
    cookie: "",
    title: "Моряка Jump",
  };

  const navigator = {
    userAgent: "node-sim",
    language: "ru-RU",
    languages: ["ru-RU"],
    maxTouchPoints: 0,
    vibrate: () => true,
    platform: "Win32",
    onLine: true,
  };

  const sandbox = {
    console,
    document,
    navigator,
    localStorage,
    sessionStorage: localStorage,
    AudioContext: AudioContextShim,
    webkitAudioContext: AudioContextShim,
    Image: ImageShim,
    performance: { now: () => Date.now() - start, timeOrigin: start },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    queueMicrotask: (fn) => { try { fn(); } catch {} },
    devicePixelRatio: 1,
    innerWidth: 800,
    innerHeight: 1000,
    outerWidth: 800,
    outerHeight: 1000,
    scrollX: 0,
    scrollY: 0,
    getComputedStyle: () => ({ getPropertyValue: () => "", getPropertyPriority: () => "" }),
    matchMedia: () => ({
      matches: false, media: "", addEventListener() {}, removeEventListener() {},
      addListener() {}, removeListener() {}, onchange: null,
    }),
    location: { href: "file:///sim.html", protocol: "file:", host: "", pathname: "/sim.html", search: "", hash: "" },
    history: { replaceState() {}, pushState() {}, back() {}, forward() {} },
    screen: { width: 1920, height: 1080, orientation: { angle: 0, type: "landscape-primary" } },
    focus() {},
    blur() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; },
    getSelection: () => ({ removeAllRanges() {}, addRange() {}, toString: () => "" }),
    fetch: () => Promise.reject(new Error("network disabled in sim")),
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    structuredClone,
    atob: (s) => Buffer.from(String(s), "base64").toString("binary"),
    btoa: (s) => Buffer.from(String(s), "binary").toString("base64"),
    alert: () => {},
    confirm: () => false,
    prompt: () => null,
    open: () => null,
  };

  vm.createContext(sandbox);
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.top = sandbox;
  sandbox.parent = sandbox;

  // document.defaultView / ownerDocument ссылаются на окно.
  Object.defineProperty(sandbox.document, "defaultView", { get: () => sandbox, configurable: true });

  return sandbox;
}

function extractScripts(html) {
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!blocks.length) throw new Error("no <script> blocks found in sim.html");
  return blocks;
}

function loadSim(simPath) {
  const html = fs.readFileSync(simPath, "utf8");
  const blocks = extractScripts(html);
  const sandbox = createSandbox();
  blocks.forEach((code, i) => {
    vm.runInContext(code, sandbox, { filename: simPath + "#script" + (i + 1), timeout: 180000 });
  });
  if (typeof sandbox.__simInit !== "function") {
    throw new Error("__simInit not found: sim.html was built without the sim hook?");
  }
  return sandbox;
}

module.exports = { loadSim, createSandbox, extractScripts };
