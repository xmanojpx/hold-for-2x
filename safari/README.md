# Hold for 2x for Safari (macOS)

Safari needs extensions to ship inside a small Mac app, so this folder holds an Xcode project that wraps the same extension Chrome uses. It was made with Apple's `safari-web-extension-converter`.

There is only one copy of the extension. The project points at `manifest.json`, `src/`, `icons/`, `fonts/` and `LICENSE` in the repo root, so a change there shows up in both Chrome and Safari the next time you build.

## Build and run

You need a Mac with Xcode 14 or later. The app runs on macOS 12 or later with Safari 15.4 or later, which is the first version with Manifest V3.

1. Open `safari/Hold for 2x/Hold for 2x.xcodeproj` in Xcode.
2. Pick the **Hold for 2x** scheme and **My Mac**, then press **Run** (⌘R). The small "Hold for 2x" app opens.
3. Safari only loads unsigned extensions when you allow it:
   - Safari → **Settings → Advanced** → tick **Show features for web developers**.
   - Safari → **Settings → Developer** → tick **Allow unsigned extensions**. Safari asks for your password, and turns this back off every time Safari quits.
4. Safari → **Settings → Extensions** → tick **Hold for 2x**.
5. Allow it on websites. Click the extension's toolbar icon, or go to **Settings → Websites → Hold for 2x**, and choose **Allow** (or "Always Allow on Every Website"). Until you do, Safari won't run it on any page.
6. Reload any video tab that was already open.

To build from the terminal without signing:

```sh
cd "safari/Hold for 2x"
xcodebuild -project "Hold for 2x.xcodeproj" -scheme "Hold for 2x" \
  -configuration Debug CODE_SIGN_IDENTITY="-" CODE_SIGNING_REQUIRED=NO build
```

If you want to sign it, set your own Team under **Signing & Capabilities** for both targets. If you also change the bundle identifier, the extension's ID has to start with the app's ID (`com.xmanojpx.HoldFor2x` and `com.xmanojpx.HoldFor2x.Extension` now), and `extensionBundleIdentifier` in `Hold for 2x/ViewController.swift` has to match.

## What's in here

```
Hold for 2x/                      the container app (the window that tells you to enable the extension)
Hold for 2x Extension/            Safari's extension target: Info.plist and the native message handler
Hold for 2x.xcodeproj/            the project; extension resources point at ../../ (the repo root)
```

The native handler (`SafariWebExtensionHandler.swift`) is the converter's template. The extension doesn't ask for `nativeMessaging`, so nothing calls it.

## Changes after running the converter

The project came from:

```sh
xcrun safari-web-extension-converter . --project-location safari \
  --app-name "Hold for 2x" --bundle-identifier com.xmanojpx.HoldFor2x \
  --swift --macos-only --no-open --no-prompt
```

Then we changed four things by hand. If you make the project again, make these changes again:

1. **Only extension files are bundled.** The converter adds everything in the repo root, including `safari/` itself, the launch video, `scripts/` and the docs. These were taken out of the extension target, which leaves `manifest.json`, `src`, `icons`, `fonts` and `LICENSE`.
2. **Bundle IDs line up.** The converter set the app to `com.xmanojpx.Hold-for-2x` and the extension to `com.xmanojpx.HoldFor2x.Extension`, and Xcode won't build that. The app is now `com.xmanojpx.HoldFor2x`.
3. **Deployment target is macOS 12.0.** Xcode 27 set the app and the project to 27.0.
4. **Version matches `manifest.json`.** `MARKETING_VERSION` is `2.7.0`. Change it whenever the manifest version changes.

## Differences from Chrome

- The JavaScript is the same. Safari supports the `chrome.*` APIs the extension uses: `storage.local`, `storage.onChanged`, `runtime.onMessage`, `tabs.query` and `tabs.sendMessage`.
- Safari 26.2 and later support the popup's `field-sizing: content`. For older versions, `popup.js` measures the speed number so the red "x" stays right next to it. Chrome skips this code.
- iOS and iPadOS aren't included. The extension is built around holding the mouse and the space bar. A touch version would need its own work.

## Not checked yet

The project builds, and macOS registers the extension with Safari (`pluginkit` lists `com.xmanojpx.HoldFor2x.Extension`). The popup was rendered in WebKit, once normally and once with the `field-sizing` fallback forced on. Holding the mouse or space bar on real video sites in Safari still needs testing by hand.
