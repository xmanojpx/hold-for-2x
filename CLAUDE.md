# Hold for 2x

Chrome extension (Manifest V3). Press and hold on any video, or hold the space bar, to play it at 2x. Let go and it returns to normal speed. Works on any site with an HTML `<video>`, including OTT players that have no speed control. Planned public launch on GitHub at `github.com/xmanojpx/hold-for-2x`.

This file is the handoff from the Claude chat where the project was started. Read it fully before changing anything.

## How to work with the owner

- Plain, conversational language. No jargon-heavy explanations.
- Keep it minimal. The tool exists for one thing, a temporary 2x. Do not add features that normal OTT players already have.
- Ask before adding any new UI element or feature. The owner has said this explicitly.
- Do not claim something works unless it was run. The original chat had no browser or network; since then the popup has been render-checked in real Chromium headless (see "Not verified" for what still needs a hand test).

## Current state (v2.6.0)

Working and in the repo folder:

- Hold the left mouse button on a playing video for about 250 ms. Speed goes to the hold speed. Release returns it to the previous rate.
- Hold the space bar for the same effect. A quick tap still plays and pauses.
- Hold speed is configurable from the toolbar popup (stepper, or type a value). Range 1.25x to 4x, default 2x. Saved in `chrome.storage.local` under `holdSpeed`.
- `[` and `]` change the hold speed in 0.25x steps on any page.
- A small badge shows the speed while holding and briefly when the speed changes.
- Popup follows the system light/dark theme.
- Per-site off switch in the popup, shown only when the tab has a real video. "Off" is per tab until reload (in-memory in the content script); "Remember for this site" stores the host in `chrome.storage.local.disabledSites`. The host is the address-bar site, read from `location.ancestorOrigins` so embedded player frames use the parent site. No extra permission: the popup messages the tab and only frames with a video reply.
- Space bar is relayed into child iframes that report having a video (postMessage tagged `hold-for-2x`), so embedded players work without clicking into them first.

## File map

```
manifest.json        MV3, permission: storage, content script on <all_urls>, all_frames, document_start
src/content.js       all page behavior (hold detection, space handling, badge, key shortcuts)
src/popup.html       toolbar popup markup
src/popup.css        popup styles (light/dark via prefers-color-scheme)
src/popup.js         stepper, typed input, clamping, hint message
icons/               icon16/48/128.png (slate rounded square, two white forward triangles)
fonts/               Geist + Geist Mono WOFF2 and their OFL licenses
scripts/package.sh   builds the release zip into dist/
safari/              Xcode wrapper for Safari (macOS), made with safari-web-extension-converter.
                     References the root extension files, does not copy them. See safari/README.md.
.preview/            design-pass previews (gitignored): theme-a/b/c.css, harness, screenshots
README.md, LICENSE (MIT), .gitignore
```

No build step. Load unpacked at `chrome://extensions` with Developer mode on.

Safari: open `safari/Hold for 2x/Hold for 2x.xcodeproj` and run. The extension target bundles only `manifest.json`, `src`, `icons`, `fonts`, `LICENSE` from the repo root. If you regenerate the project, redo the post-converter edits listed in `safari/README.md`. Keep `MARKETING_VERSION` in sync with the manifest version. `popup.js` has a `fit()` fallback for Safari before 26.2 (no `field-sizing`); it is a no-op where `field-sizing` is supported.

## Behavior details that were deliberate

Do not "simplify" these without understanding why they exist.

- **Listeners are on `window` in the capture phase** so they run before the site's own handlers. All frames are covered (`all_frames: true`) because many players live in iframes.
- **Finding the video:** `videoAt(x, y)` checks bounding rects of all videos (including inside shadow roots) instead of using the click target, because overlays sit on top of the `<video>` on most OTT sites. A fallback picks a large playing video if none is under the cursor.
- **Safe bottom zone:** the bottom 15% of the video is ignored so the seek bar and controls keep working.
- **Movement cancels a hold** (over 10 px before the timer fires) so dragging a seek bar does not trigger 2x.
- **Speed is re-applied every 150 ms while held**, because players reset `playbackRate` on their own.
- **After a mouse hold, the next click is swallowed for 300 ms** so releasing does not pause the video. `pointerup` and `mouseup` propagation is also stopped when a hold was active.
- **Space bar:** keydown and keyup for plain Space are intercepted (capture, `stopImmediatePropagation`) only when a video of at least 100x100 visible px exists and the target is not an input, textarea, select, or editable element. A tap (released before the hold timer) toggles play/pause directly on the video element. Space with Shift, Ctrl, Alt, or Cmd is ignored. With no video on the page, space is left alone so the page scrolls.
- **The badge lives in a closed shadow root**, built with DOM APIs (not `innerHTML`) so Trusted Types pages like YouTube do not block it. It is appended to the fullscreen element when there is one.
- **Cap is 4x** because browser audio tends to break up beyond that. Minimum is 1.25x.
- **Reduced motion is respected** (badge fade and button transitions turn off).

## Design decisions (v2.6.0 popup)

- Style: Swiss. Paper and ink: hairline borders, squared controls, one signal red, nothing decorative. Chosen by the owner from three rendered options (Cinema, Swiss, Signal); `theme-b.css` in `.preview/` is the adopted file. Earlier: Frost UI (v2.4.0), warm paper (v2.3.0).
- Fonts: Geist (speed number, body text) + Geist Mono (all small labels, keys, scale numbers; mono uppercase with wide tracking). Bundled WOFF2 in `fonts/` (OFL). Font roles are CSS variables: `--font`, `--meta`.
- Light: page `#F4F4F2`, card `#FFFFFF`, hairline `#E4E4E0`, ink `#111111`, muted `#52525B`, signal red `#D92D20`.
- Dark (own scheme): page `#0B0B0B`, card `#121212`, hairline `#2A2A2A`, ink `#F5F5F5`, muted `#A1A1AA`, signal red `#F2555A`.
- Ruler reads as a measuring tape: flat 2px track, thin red fill, rectangular knob that widens on drag, ticks below with labeled major stops.
- Stepper buttons are 46px squares with a 1.5px ink border; hover inverts (ink on white, white on ink in dark). Switch and checkbox are squared with a hand-drawn check.
- Speed number settles 4px on change; reduced motion turns it off. `field-sizing: content` keeps the red "x" right after the number.
- Toolbar icon unchanged since v2.4.0: slate `#3E4C66` rounded square with two white triangles.

## Versioning

- Semantic versioning, tags `vX.Y.Z`, notes in `CHANGELOG.md`. Bump `manifest.json` version with every release.
- `main` holds released versions only. New work goes on `feature/*` branches and merges after the owner approves.
- v3 (customizable on-video badge) is in progress on `feature/v3-badge` (also on origin).
- Releases: `scripts/package.sh` builds `dist/hold-for-2x-vX.Y.Z.zip` (extension files only). Attach it to the GitHub Release for the tag.

## Not verified

The v2.6.0 popup was rendered and checked in real Chromium from the actual unpacked extension (dark, system setting) and light via the `.preview/` harness with the same CSS. Still to check by hand in a live browser:

1. Mouse hold and space hold on YouTube, Plex, and at least one of Netflix, Prime Video, Hotstar. The owner reported the earlier mouse-hold version working on the sites they tried and failing on Plex before a fix, but the Plex fix was never re-confirmed.
2. Space tap on each site. Netflix is the most likely to misbehave because the extension pauses and plays the `<video>` element directly rather than going through the site's player.
3. Popup interactions by hand: stepper, typed speed, ruler drag, and the per-site switch on a real video tab.

Tooling notes: branded Chrome (v155) ignores `--load-extension`. For headless checks, load the unpacked extension in Playwright's Chromium (`%LOCALAPPDATA%\ms-playwright\chromium-*\chrome-win64\chrome.exe`), add `--no-sandbox`, and expect the process to hang after rendering — kill it and use the written PNG.

## Open decision: optional extras

Mockups were shown for four extras. The owner has not said which to build. Do not build any until they choose.

| Extra | Note |
| --- | --- |
| On/off switch in the popup | Overlaps with the per-site switch. Chrome already has an on/off on the extensions page. Recommended to skip. |
| Preset chips (1.5x, 2x, 3x) | Optional. The stepper and typed input already cover this. |
| Per-site switch | Built in v2.5.0 (owner asked for it). No extra permission needed. |
| Rebindable shortcut keys | Heaviest and cluttered for little use. Recommended to skip. |

## Next steps, in order

1. Get the owner's answer on the extras, then finalize the product.
2. Test on real sites (see "Not verified") and fix anything found.
3. GitHub is live: `xmanojpx/hold-for-2x` (public), `origin` set, each version gets a release with the `dist/` zip attached.
4. Only after the product is final: make the launch video with the two tools the owner named.
   - **Hyperframes** (`github.com/heygen-com/hyperframes`): turns HTML plus seekable animation into a deterministic MP4. Needs Node 22+ and FFmpeg. For Claude Code: `claude plugin marketplace add heygen-com/hyperframes` then `claude plugin install hyperframes@hyperframes`, then use `/hyperframes`. The `/product-launch-video` workflow is the closest fit. Manual route: `npx hyperframes init`, `preview`, `render`.
   - **/brag** (`github.com/latent-spaces/brag`): an agent skill built on Hyperframes that plans the story, music, motion, and share copy. For Claude Code: `/plugin marketplace add latent-spaces/brag`, `/plugin install brag@brag`, then ask "let's /brag". Output lands in `brag-output/` with a `brag.mp4`. Voiceover is off unless `--voice` is passed.
   - Suggested story for the video: someone skipping through a slow part of a show on a laptop, holding the mouse, the badge showing 2x, releasing back to normal. Short (20 to 30 seconds), no feature tour, ends on the install line.
5. A landing page for the launch was floated but the owner has not asked for one. Do not build it unless they confirm.

## Rules for this repo

- Keep the extension free of network requests and analytics. The README promises it collects nothing and only stores the chosen speed locally.
- Keep permissions minimal. Currently only `storage`. Adding any permission needs the owner's approval and a README update.
- Keep the README honest. Do not list sites as "supported" unless they were actually tested.
