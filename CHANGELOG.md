# Changelog

All notable changes to Hold for 2x. Versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Safari for macOS. An Xcode project in `safari/`, made with Apple's `safari-web-extension-converter`, wraps the same extension files as Chrome. Build and setup steps are in `safari/README.md`.

### Fixed
- The popup's speed number stays next to its "x" in Safari versions before 26.2, which don't support `field-sizing`.

## [2.7.0] - 2026-10-21

### Fixed
- Improved video detection for feed-style players (LinkedIn, etc.) — now finds videos as small as 64×64px (was 100×100px)
- Fixed space bar hold incorrectly targeting paused videos in same-origin iframes instead of the main playing video
- Mouse hold now only searches iframe content when the cursor is actually over that iframe

## [2.6.0] - 2026-10-19

### Changed
- New popup style, Swiss: paper and ink, hairline borders, squared controls, and one signal red. Same layout and controls as before, only the look changed.

## [2.5.0] - 2026-10-18

### Added
- Turn Hold for 2x off for the site you're on, from the popup. The switch only appears when the tab has a video. Off lasts until the tab reloads, or tick "Remember for this site" to keep it off. Useful on YouTube, which has its own hold-Space-for-2x.
- Space bar now works for players inside embedded frames even when the key press lands on the outer page.

### Fixed
- Clicking the mouse during a space-bar hold no longer ends the hold.

## [2.4.0] - 2026-10-18

### Changed
- New popup style, Frost UI: soft frosted glass over neutral light, with its own dark mode.
- Fonts are now Geist (text and the speed number) and Geist Mono (labels, scale, keys), bundled under the SIL Open Font License. Fraunces and Work Sans are removed.
- Slate toolbar icon to match.

### Added
- Downloadable zip on each GitHub Release.

## [2.3.0] - 2026-10-18

### Changed
- Redesigned the toolbar popup: warm paper palette with a single bronze accent, large serif speed readout, and a ruler you can click or drag (snaps to 0.25x).
- New toolbar icon to match.
- The popup confirms a change in its hint line ("Saved. Your next hold plays at 2.5x.").
- Larger tap targets (44px) and text sizes on a fixed type scale.

### Added
- Bundled fonts: Fraunces and Work Sans (SIL Open Font License, see `fonts/`). They load from the extension itself, so there are still no network requests.
- Keyboard support on the ruler (arrow keys, Home, End).

## [2.2.0] - 2026-10-18

### Added
- Hold the left mouse button on a playing video to speed it up; release to return.
- Hold the space bar for the same effect; a quick tap still plays and pauses.
- Hold speed from 1.25x to 4x, set from the popup or with `[` and `]`.
- On-screen badge while holding.

[2.6.0]: https://github.com/xmanojpx/hold-for-2x/compare/v2.5.0...v2.6.0
[2.5.0]: https://github.com/xmanojpx/hold-for-2x/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/xmanojpx/hold-for-2x/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/xmanojpx/hold-for-2x/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/xmanojpx/hold-for-2x/releases/tag/v2.2.0
