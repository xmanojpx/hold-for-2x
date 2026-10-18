// The on-video badge, shared by the content script (real badge) and the popup (live preview).
// Built with DOM APIs only (no innerHTML) so Trusted Types pages like YouTube accept it.
// Motion follows ui-animation: transform/opacity only, enter ~260ms on cubic-bezier(.22,1,.36,1),
// exit fast (120ms), loops only while the badge is visible, reduced motion falls back to a fade.

(() => {
  const STYLES = [
    { id: "classic", name: "Classic" },
    { id: "streak", name: "Streak" },
    { id: "shimmer", name: "Shimmer" },
    { id: "pulse", name: "Pulse" },
    { id: "ticker", name: "Ticker" },
    { id: "card", name: "Card" },
  ];
  const DEFAULT_STYLE = "classic";
  const LABELS = ["", "⚡", "skipping", "zoom"];
  const MAX_LABEL = 16;

  const css = `
:host { all: initial; }
.b {
  --ink: #F3EEE6; --accent: #D0A57A; --bg: rgba(22, 20, 18, .84);
  --enter: cubic-bezier(.22, 1, .36, 1);
  position: relative; isolation: isolate; overflow: hidden;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 15px 8px 12px; border-radius: 999px;
  background: var(--bg); color: var(--ink);
  -webkit-backdrop-filter: blur(10px) saturate(1.3); backdrop-filter: blur(10px) saturate(1.3);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, .09), 0 10px 28px -10px rgba(0, 0, 0, .6);
  font: 600 14px/1 "Work Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  white-space: nowrap; pointer-events: none; opacity: 0;
}
.bg { position: absolute; inset: 0; z-index: -1; overflow: hidden; border-radius: inherit; }
.icon { width: 15px; height: 15px; flex: none; fill: var(--accent); overflow: visible; }
.num {
  display: inline-flex; align-items: baseline;
  font: 500 21px/1 "HoldFor2x Fraunces", "Fraunces", "Iowan Old Style", Georgia, serif;
  font-variation-settings: "opsz" 36, "SOFT" 100; letter-spacing: -.01em;
  font-variant-numeric: lining-nums;
}
.num .x { margin-left: 1px; font-size: .72em; opacity: .8; }
.lbl { display: none; padding-left: 9px; margin-left: 1px; border-left: 1px solid rgba(255, 255, 255, .22); font-weight: 500; opacity: .85; }
.b.has-lbl .lbl { display: inline; }

/* enter: rise from below */
.b.in { animation: rise .26s var(--enter) both; }
.b.out { animation: leave .12s ease-out both; }
@keyframes rise { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes leave { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(6px); } }

/* streak: speed lines flowing past behind the text */
.s-streak .bg::before {
  content: ""; position: absolute; top: 0; bottom: 0; left: -40px; right: 0;
  background: repeating-linear-gradient(100deg, transparent 0 16px, rgba(208, 165, 122, .22) 16px 18px, transparent 18px 26px, rgba(255, 255, 255, .08) 26px 27px);
  animation: streak .45s linear infinite;
}
.s-streak .bg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, var(--bg), transparent 30%, transparent 70%, var(--bg)); }
@keyframes streak { from { transform: translateX(40px); } to { transform: translateX(0); } }

/* shimmer: bronze pill with a light sweep */
.s-shimmer { --bg: linear-gradient(135deg, #8A5A2E, #B27A45); --accent: #FBF1E4; background: var(--bg); }
.s-shimmer .bg::before {
  content: ""; position: absolute; top: 0; bottom: 0; width: 60%; left: 0;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, .38), transparent);
  transform: translateX(-120%); animation: sweep 1.6s .25s cubic-bezier(.45, 0, .2, 1) infinite;
}
@keyframes sweep { to { transform: translateX(260%); } }

/* pulse: the two arrows light up in turn, like a fast-forward key; pops in */
.s-pulse.in { animation: pop .34s cubic-bezier(.34, 1.56, .64, 1) both; }
@keyframes pop { from { opacity: 0; transform: translateY(12px) scale(.86); } to { opacity: 1; transform: none; } }
.s-pulse .c1, .s-pulse .c2 { animation: chevron .6s ease-in-out infinite; }
.s-pulse .c2 { animation-delay: .15s; }
@keyframes chevron { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }

/* ticker: the number rolls up from 1x to your speed */
.reel { display: inline-block; height: 1em; overflow: hidden; vertical-align: bottom; }
.track > span { display: block; height: 1em; line-height: 1; }
.track > span:first-child { display: none; }
.s-ticker .track > span:first-child { display: block; }
.s-ticker .reel .track { display: block; animation: roll .42s .08s cubic-bezier(.22, 1, .36, 1) both; }
@keyframes roll { from { transform: translateY(0); } to { transform: translateY(-1em); } }

/* card: a paper card dealt up from below */
.s-card {
  --bg: #FBF8F4; --ink: #1A1A1A; --accent: #9A6436; border-radius: 10px;
  -webkit-backdrop-filter: none; backdrop-filter: none;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .06), 0 3px 3px -1.5px rgba(0, 0, 0, .1), 0 12px 24px -8px rgba(0, 0, 0, .45);
}
.s-card .lbl { border-left-color: rgba(26, 26, 26, .18); }
.s-card.in { animation: deal .32s cubic-bezier(.22, 1, .36, 1) both; }
@keyframes deal { from { opacity: 0; transform: translateY(18px) rotate(-4deg) scale(.95); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .b.in, .s-pulse.in, .s-card.in { animation: fade .12s ease-out both; }
  .s-ticker .reel .track { animation: none; transform: translateY(-1em); }
  .bg::before, .c1, .c2 { animation-play-state: paused !important; }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
}`;

  const fmt = (n) => String(+(+n).toFixed(2));
  const cleanLabel = (s) => String(s || "").replace(/\s+/g, " ").trim().slice(0, MAX_LABEL);

  // Builds one badge inside `root` (a shadow root or any element). Returns a small controller.
  function make(root, doc = document) {
    const ns = "http://www.w3.org/2000/svg";
    const style = doc.createElement("style");
    style.textContent = css;

    const pill = doc.createElement("div");
    pill.className = "b";
    pill.setAttribute("role", "status");

    const bg = doc.createElement("div");
    bg.className = "bg";

    const svg = doc.createElementNS(ns, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");
    for (const [cls, d] of [["c1", "M1 2.5v11l7-5.5z"], ["c2", "M8 2.5v11l7-5.5z"]]) {
      const p = doc.createElementNS(ns, "path");
      p.setAttribute("class", cls);
      p.setAttribute("d", d);
      svg.appendChild(p);
    }

    const num = doc.createElement("span");
    num.className = "num";
    const reel = doc.createElement("span");
    reel.className = "reel";
    const track = doc.createElement("span");
    track.className = "track";
    const from = doc.createElement("span");
    from.textContent = "1";
    const to = doc.createElement("span");
    track.append(from, to);
    reel.appendChild(track);
    const x = doc.createElement("span");
    x.className = "x";
    x.textContent = "x";
    num.append(reel, x);

    const lbl = doc.createElement("span");
    lbl.className = "lbl";

    pill.append(bg, svg, num, lbl);
    root.append(style, pill);

    let leaveTimer = null;

    return {
      el: pill,
      // speed: number, style: id, label: the user's text, note: optional text shown instead of the label
      set({ speed, style: s, label, note }) {
        if (speed != null) to.textContent = fmt(speed);
        if (s != null) {
          const keep = ["in", "out"].filter((c) => pill.classList.contains(c));
          pill.className = "b s-" + (STYLES.some((o) => o.id === s) ? s : DEFAULT_STYLE);
          pill.classList.add(...keep);
        }
        const text = note != null ? note : cleanLabel(label);
        lbl.textContent = text;
        pill.classList.toggle("has-lbl", !!text);
      },
      // replay the entrance (restarts keyframes on purpose: entry is a predetermined sequence)
      enter() {
        clearTimeout(leaveTimer);
        pill.classList.remove("in", "out");
        track.style.animation = "none";
        void pill.offsetWidth;
        track.style.animation = "";
        pill.classList.add("in");
      },
      leave(done) {
        pill.classList.remove("in");
        pill.classList.add("out");
        clearTimeout(leaveTimer);
        leaveTimer = setTimeout(() => done && done(), 130);
      },
    };
  }

  globalThis.HoldFor2xBadge = { STYLES, DEFAULT_STYLE, LABELS, MAX_LABEL, cleanLabel, make };
})();
