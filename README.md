# asb-hide-embyjf-subs

A userscript that automatically hides Emby/Jellyfin/Plex native subtitle overlays whenever [asbplayer](https://github.com/killergerbah/asbplayer) subtitles are active. Prevents double subtitles from stacking on screen when using asbplayer alongside Emby, Jellyfin, or Plex.

## How It Works

The script watches the DOM for the presence of asbplayer's bottom subtitle container. When detected, it injects a CSS rule to suppress native subtitle overlays (`.videoSubtitles` for Emby/Jellyfin and `.libjass-subs` for Plex) and removes the `moveUpSubtitles` class from the video element. When asbplayer subtitles are absent, the native subtitles are restored to normal behaviour.

## Installation

1. Install a userscript manager. [Violentmonkey](https://violentmonkey.github.io/) is recommended — it is open source and actively maintained. Tampermonkey and Greasemonkey should work as well.
2. Click **[Install Script](https://raw.githubusercontent.com/bpwhelan/asb-hide-embyjf-subs/main/asb-hide-embyjf-subs.user.js)** — your userscript manager will intercept the `.user.js` URL and prompt you to install.
3. Confirm the installation.

The script includes `@updateURL` and `@downloadURL` headers, so Violentmonkey (and Tampermonkey) can check for and apply updates automatically from this repository.

## Requirements

- An Emby, Jellyfin, or Plex server running its standard web client
- [asbplayer](https://github.com/killergerbah/asbplayer) browser extension installed and active

The script matches `*://*/web/index.html*` (Emby/Plex) and `*://*/web/` (Jellyfin), then activates on the SPA routes used for playback.

## Notes

- The script runs at `document-start` and uses a `MutationObserver`, so it responds to navigation changes within the single-page app without requiring a page reload.
- No external requests are made and no data is collected. The `@grant none` declaration means the script operates entirely within the page's own context.

## Author

[Beangate](https://github.com/bpwhelan)

## License

MIT
