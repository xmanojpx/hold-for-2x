# Hold for 2x

Press and hold on any video to watch it at 2x. Let go and it drops back to normal.

It works the way holding the screen does in a phone video app, but on the web, including sites whose players have no speed control of their own. Videos play at normal speed until you hold.

https://github.com/user-attachments/assets/3861b1e8-b052-40fd-acfd-c66197127f41

## Install

1. Go to [Releases](https://github.com/xmanojpx/hold-for-2x/releases/latest) and download `hold-for-2x-vX.Y.Z.zip`.
2. Unzip it. You get a `hold-for-2x` folder.
3. Open `chrome://extensions` and turn on **Developer mode** (top right).
4. Click **Load unpacked** and choose the `hold-for-2x` folder.
5. Refresh any video tab that was already open.

Works in Chrome and other Chromium browsers (Edge, Brave). There's no build step, so you can also clone the repo and load the folder directly.

### Safari (macOS)

Safari extensions ship inside a small Mac app, so for now you build it yourself with Xcode. The steps are in [`safari/README.md`](safari/README.md). The short version: open `safari/Hold for 2x/Hold for 2x.xcodeproj`, press Run, tick **Allow unsigned extensions** in Safari's Developer settings, then turn on **Hold for 2x** under Settings → Extensions. It uses the same extension files as Chrome. It hasn't been tested by hand on video sites in Safari yet.

## Use

- **Hold** the left mouse button on a playing video. After a quarter of a second it speeds up. Release to go back.
- **Hold the space bar** to do the same thing from the keyboard. A quick tap still plays and pauses.
- **Set your speed** from the toolbar icon. Type a value, use the + and − buttons, or drag the ruler. The default is 2x, and anything from 1.25x to 4x works.
- **Turn it off on a site** from the toolbar icon. On a page with a video you'll see a switch for that site. It stays off until you reload the tab, or tick "Remember for this site" to keep it off. Handy on YouTube, which already has its own hold-Space-for-2x.
- **Change it from the keyboard** with `[` (slower) and `]` (faster), in steps of 0.25x. A small badge shows the new speed.

## Good to know

- A quick click still pauses and plays as normal. The bottom strip of the video is left alone so the seek bar and buttons keep working.
- It only works in the browser, not in desktop or TV apps.
- Some players try to reset the playback speed. While you hold, the extension keeps it pinned.
- Speed is capped at 4x because audio tends to break up beyond that.

## Privacy

The extension collects nothing and makes no network requests. The only things it stores are your chosen speed and the sites you turned off, locally in your browser. It needs no permissions beyond storage.

## Credits

The popup uses [Geist and Geist Mono](https://github.com/vercel/geist-font), under the SIL Open Font License 1.1. The font files and their licenses are in `fonts/`.

## License

MIT. See `CHANGELOG.md` for version history.
