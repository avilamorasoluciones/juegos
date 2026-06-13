/********************
 * UTILIDADES GLOBALES
 ********************/
const Utils = (() => {
  const $ = (id) => document.getElementById(id);

  function safeJSONParse(value, fallback = null) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function shuffleArray(arr) {
    const clone = [...arr];
    for (let i = clone.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  }

  function pickRandom(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setPlayingMode(isPlaying) {
    document.body.classList.toggle("playing", Boolean(isPlaying));
  }

  function escapeHTML(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return {
    $,
    safeJSONParse,
    shuffleArray,
    pickRandom,
    scrollTop,
    setPlayingMode,
    escapeHTML
  };
})();
window.Utils = Utils;

/********************
 * SONIDO GLOBAL 🎧
 ********************/
let audioCtx;

function emitSound(frequency, duration, waveType = "sine", volume = 0.5) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Silencioso a propósito
  }
}
window.emitSound = emitSound;

/********************
 * PWA MANIFEST
 ********************/
const PWA = (() => {
  function init() {
    const pwaNode = document.getElementById("pwa-manifest");
    if (!pwaNode) return;

    const manifestData = {
      name: "Juegos Avila Mora",
      short_name: "Juegos",
      start_url: "./index.html",
      display: "standalone",
      background_color: "#070A12",
      theme_color: "#7c3aed",
      icons: [
        {
          src: "https://cdn.jsdelivr.net/npm/emoji-datasource-google/img/google/256/1f9e0.png",
          sizes: "256x256",
          type: "image/png"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(manifestData)], {
      type: "application/manifest+json"
    });

    const manifestURL = URL.createObjectURL(blob);
    pwaNode.setAttribute("href", manifestURL);
  }

  return { init };
})();
window.PWA = PWA;

/********************
 * NAVEGACIÓN MÓVIL ☰
 ********************/
const Nav = (() => {
  let btn = null;
  let panel = null;

  function getFirstItem() {
    return panel?.querySelector(".nav-item");
  }

  function isDesktop() {
    return window.matchMedia("(min-width: 860px)").matches;
  }

  function isOpen() {
    return btn?.getAttribute("aria-expanded") === "true";
  }

  function open() {
    if (!btn || !panel) return;
    panel.hidden = false;
    panel.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    setTimeout(() => getFirstItem()?.focus(), 0);
  }

  function close(focusButton = false) {
    if (!btn || !panel) return;
    panel.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    if (focusButton) {
      setTimeout(() => btn.focus(), 0);
    }
  }

  function toggle() {
    if (!btn || !panel) return;
    isOpen() ? close(true) : open();
  }

  function bindEvents() {
    if (!btn || !panel) return;

    btn.addEventListener("click", toggle);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) close(true);
    });

    document.addEventListener("click", (e) => {
      if (isDesktop() || panel.hidden) return;
      if (!panel.contains(e.target) && !btn.contains(e.target)) {
        close(false);
      }
    });

    panel.querySelectorAll("a, button").forEach((item) => {
      item.addEventListener("click", () => {
        if (!isDesktop()) close(false);
      });
    });

    window.addEventListener("resize", () => {
      if (isDesktop()) {
        panel.hidden = false;
        panel.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      } else if (!isOpen()) {
        panel.hidden = true;
      }
    });
  }

  function init() {
    btn = document.getElementById("navToggle");
    panel = document.getElementById("siteNav");

    if (!btn || !panel) return;

    // FUERZA EL CIERRE SIEMPRE AL INICIAR
    panel.hidden = true;
    panel.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");

    bindEvents();
  }

  return { init, open, close, toggle };
})();
window.Nav = Nav;

/********************
 * HERRAMIENTAS 🎲🃏
 ********************/
const Tools = (() => {
  const $ = (id) => document.getElementById(id);

  const CARD_SUITS = ["♠", "♥", "♦", "♣"];
  const CARD_VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  function getModal(type) {
    return $(`${type}-modal`);
  }

  function openModal(type) {
    const modal = getModal(type);
    if (!modal) return;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    window.emitSound(400, 0.05, "triangle");
  }

  function closeModal(type) {
    const modal = getModal(type);
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    window.emitSound(300, 0.05, "triangle");
  }

  function closeAllModals() {
    ["dice", "cards"].forEach((type) => {
      const modal = getModal(type);
      if (modal) modal.classList.remove("active");
    });
    document.body.style.overflow = "";
  }

  function rollDice() {
    const resultEl = $("dice-result");
    if (!resultEl || resultEl.classList.contains("dice-rolling")) return;

    resultEl.classList.add("dice-rolling");

    let ticks = 0;
    const tickInt = setInterval(() => {
      resultEl.textContent = DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)];
      window.emitSound(800 + Math.random() * 400, 0.02, "square", 0.3);
      ticks++;

      if (ticks > 8) {
        clearInterval(tickInt);
        resultEl.classList.remove("dice-rolling");

        const finalFace = DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)];
        resultEl.textContent = finalFace;

        window.emitSound(1000, 0.1, "triangle");
        setTimeout(() => window.emitSound(1200, 0.15, "triangle"), 100);
      }
    }, 50);
  }

  function drawCard() {
    const resultEl = $("card-result");
    if (!resultEl || resultEl.classList.contains("card-flipping")) return;

    resultEl.classList.add("card-flipping");
    window.emitSound(400, 0.1, "sawtooth");

    setTimeout(() => {
      const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
      const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];

      resultEl.textContent = `${value}${suit}`;
      resultEl.className = "card-result-box";
      resultEl.classList.add(suit === "♥" || suit === "♦" ? "red" : "black");

      window.emitSound(800, 0.15, "triangle");
    }, 250);

    setTimeout(() => {
      resultEl.classList.remove("card-flipping");
    }, 500);
  }

  function bindModalEvents() {
    ["dice", "cards"].forEach((type) => {
      const modal = getModal(type);
      if (!modal) return;

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeModal(type);
        }
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllModals();
      }
    });
  }

  function init() {
    bindModalEvents();
  }

  return {
    init,
    openModal,
    closeModal,
    closeAllModals,
    rollDice,
    drawCard
  };
})();
window.Tools = Tools;

/********************
 * TEMA (CLARO/OSCURO) 🌓
 ********************/
const Theme = (() => {
  const THEME_KEY = "avila_mora_theme_v2";

  function updateMetaTheme() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const isLight = document.body.classList.contains("light-theme");
    meta.setAttribute("content", isLight ? "#f8fafc" : "#070A12");
  }

  function updateIcon(mode) {
    const btn = document.getElementById("themeToggleBtn");
    if (btn) btn.textContent = mode === "light" ? "☀️" : "🌓";
  }

  function apply(mode) {
    const isLight = mode === "light";
    document.body.classList.toggle("light-theme", isLight);
    updateIcon(isLight ? "light" : "dark");
    updateMetaTheme();
  }

  function init() {
    const saved = localStorage.getItem(THEME_KEY);
    apply(saved === "light" ? "light" : "dark");
  }

  function toggle() {
    const willBeLight = !document.body.classList.contains("light-theme");
    const mode = willBeLight ? "light" : "dark";
    apply(mode);
    localStorage.setItem(THEME_KEY, mode);
    window.emitSound(willBeLight ? 800 : 400, 0.05, "triangle");
  }

  return { init, toggle, apply };
})();
window.Theme = Theme;

/********************
 * APP GLOBAL
 ********************/
const App = (() => {
  function initExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      if (!link.hasAttribute("rel")) {
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  function init() {
    PWA.init();
    Theme.init();
    Nav.init();
    Tools.init();
    initExternalLinks();
  }

  return { init };
})();
window.App = App;

/********************
 * INICIALIZACIÓN
 ********************/
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});