(() => {
  const HOLD_MS = 250;       // how long you hold before the speed-up starts
  const MOVE_LIMIT = 10;     // px of mouse movement that cancels a hold (dragging a seek bar)
  const SAFE_BOTTOM = 0.15;  // bottom 15% of a video is left alone, that's where controls live
  const MIN = 1.25, MAX = 4, STEP = 0.25, DEFAULT = 2;

  const Badge = globalThis.HoldFor2xBadge; // from badge.js, loaded first

  let holdSpeed = DEFAULT;
  let badgeStyle = Badge.DEFAULT_STYLE, badgeLabel = "";
  let timer = null, held = false, video = null, prevRate = 1;
  let startX = 0, startY = 0, enforcer = null, swallowClick = false;

  const clamp = (n) => Math.min(MAX, Math.max(MIN, Math.round(n * 100) / 100));
  const fmt = (n) => String(+n.toFixed(2));

  chrome.storage.local.get(["holdSpeed", "badgeStyle", "badgeLabel"], (r) => {
    if (r.holdSpeed) holdSpeed = clamp(r.holdSpeed);
    if (r.badgeStyle) badgeStyle = r.badgeStyle;
    if (r.badgeLabel != null) badgeLabel = r.badgeLabel;
  });
  chrome.storage.onChanged.addListener((c) => {
    if (c.holdSpeed) holdSpeed = clamp(c.holdSpeed.newValue);
    if (c.badgeStyle) badgeStyle = c.badgeStyle.newValue || Badge.DEFAULT_STYLE;
    if (c.badgeLabel) badgeLabel = c.badgeLabel.newValue || "";
  });

  /* ---------- on-screen badge (lives in a closed shadow root so site CSS can't touch it) ---------- */

  let host = null, badge = null, hideTimer = null, fontLoaded = false;

  // the badge number uses the bundled Fraunces; load it as bytes so page CSP can't block it
  function loadFont() {
    if (fontLoaded) return;
    fontLoaded = true;
    fetch(chrome.runtime.getURL("fonts/fraunces-latin-full-normal.woff2"))
      .then((r) => r.arrayBuffer())
      .then((buf) => new FontFace("HoldFor2x Fraunces", buf, { weight: "100 900" }).load())
      .then((face) => document.fonts.add(face))
      .catch(() => {}); // falls back to Georgia
  }

  function buildBadge() {
    host = document.createElement("div");
    host.style.cssText =
      "all:initial;position:fixed;top:24px;left:50%;transform:translateX(-50%);" +
      "z-index:2147483647;pointer-events:none;";
    badge = Badge.make(host.attachShadow({ mode: "closed" }));
    loadFont();
  }

  // note: optional text shown in the label slot instead of the user's label
  function showBadge(note, sticky) {
    if (!host) buildBadge();
    clearTimeout(hideTimer);
    badge.set({ speed: holdSpeed, style: badgeStyle, label: badgeLabel, note });
    const fs = document.fullscreenElement;
    const parent = fs && fs.tagName !== "VIDEO" ? fs : document.documentElement;
    const fresh = host.parentNode !== parent || !badge.el.classList.contains("in");
    if (host.parentNode !== parent) parent.appendChild(host);
    if (fresh) badge.enter();
    if (!sticky) hideTimer = setTimeout(hideBadge, 900);
  }

  function hideBadge() {
    if (!host) return;
    clearTimeout(hideTimer);
    badge.leave(() => host.remove());
  }

  /* ---------- finding the video ---------- */

  function findVideos(root, out) {
    root.querySelectorAll("video").forEach((v) => out.push(v));
    root.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) findVideos(el.shadowRoot, out);
    });
    return out;
  }

  // the video under the cursor, even when an overlay sits on top of it
  function videoAt(x, y) {
    let best = null, bestArea = 0;
    for (const v of findVideos(document, [])) {
      const r = v.getBoundingClientRect();
      if (r.width < 100 || r.height < 100) continue;
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
      if (y > r.bottom - r.height * SAFE_BOTTOM) continue;
      const area = r.width * r.height;
      if (area > bestArea) { best = v; bestArea = area; }
    }
    // fallback: a big playing video that covers most of the page
    if (!best && y < window.innerHeight * (1 - SAFE_BOTTOM)) {
      for (const v of findVideos(document, [])) {
        const r = v.getBoundingClientRect();
        const area = r.width * r.height;
        if (!v.paused && area > window.innerWidth * window.innerHeight * 0.4 && area > bestArea) {
          best = v; bestArea = area;
        }
      }
    }
    return best;
  }

  /* ---------- hold to speed up ---------- */

  function startHold() {
    timer = null;
    if (!video || video.paused) return;
    held = true;
    prevRate = video.playbackRate;
    video.playbackRate = holdSpeed;
    // players sometimes reset the speed on their own, so keep it pinned while held
    enforcer = setInterval(() => {
      if (video && video.playbackRate !== holdSpeed) video.playbackRate = holdSpeed;
    }, 150);
    showBadge(fmt(holdSpeed) + "x", true);
  }

  function release(skipSwallow) {
    if (timer) { clearTimeout(timer); timer = null; }
    if (held) {
      clearInterval(enforcer);
      if (video) video.playbackRate = prevRate;
      hideBadge();
      held = false;
      if (!skipSwallow) {
        swallowClick = true; // the release shouldn't count as a click (it would pause the video)
        setTimeout(() => { swallowClick = false; }, 300);
      }
    }
    video = null;
  }

  window.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest && e.target.closest("input,select,textarea,[role=slider]")) return;
    const v = videoAt(e.clientX, e.clientY);
    if (!v || v.paused) return;
    video = v;
    startX = e.clientX; startY = e.clientY;
    timer = setTimeout(startHold, HOLD_MS);
  }, true);

  window.addEventListener("mousemove", (e) => {
    if (timer && Math.hypot(e.clientX - startX, e.clientY - startY) > MOVE_LIMIT) {
      clearTimeout(timer); timer = null; video = null;
    }
  }, true);

  window.addEventListener("pointerup", (e) => {
    if (held) e.stopPropagation();
  }, true);

  window.addEventListener("mouseup", (e) => {
    const was = held;
    release();
    if (was) e.stopPropagation();
  }, true);

  window.addEventListener("click", (e) => {
    if (swallowClick) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  window.addEventListener("blur", () => { release(true); spaceDown = false; });

  /* ---------- hold the space bar, same as holding the mouse ---------- */

  let spaceDown = false;

  const isTyping = (t) => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

  // the biggest video currently on screen
  function mainVideo() {
    let best = null, bestArea = 0;
    for (const v of findVideos(document, [])) {
      const r = v.getBoundingClientRect();
      const w = Math.min(r.right, window.innerWidth) - Math.max(r.left, 0);
      const h = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      if (w < 100 || h < 100) continue;
      if (w * h > bestArea) { best = v; bestArea = w * h; }
    }
    return best;
  }

  window.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (isTyping(e.target)) return;
    if (spaceDown) { e.preventDefault(); e.stopImmediatePropagation(); return; } // key repeat while we own the press
    const v = mainVideo();
    if (!v) return; // no video here, so space scrolls the page as usual
    e.preventDefault();
    e.stopImmediatePropagation();
    spaceDown = true;
    video = v;
    timer = setTimeout(startHold, HOLD_MS);
  }, true);

  window.addEventListener("keyup", (e) => {
    if (e.code !== "Space" || !spaceDown) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const v = video;
    const wasHeld = held;
    release(true);
    spaceDown = false;
    // a quick tap still plays or pauses, like the space bar always did
    if (!wasHeld && v) {
      if (v.paused) v.play().catch(() => {});
      else v.pause();
    }
  }, true);

  /* ---------- keyboard: [ slower, ] faster ---------- */

  window.addEventListener("keydown", (e) => {
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key !== "]" && e.key !== "[") return;
    holdSpeed = clamp(holdSpeed + (e.key === "]" ? STEP : -STEP));
    chrome.storage.local.set({ holdSpeed });
    showBadge(fmt(holdSpeed) + "x", held);
  }, true);
})();
