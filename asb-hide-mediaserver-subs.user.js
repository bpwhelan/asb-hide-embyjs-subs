// ==UserScript==
// @name         asbplayer: Hide Media Server Subs
// @namespace    https://github.com/bpwhelan/asb-hide-mediaserver-subs
// @version      1.2.0
// @description  Hides Emby/Jellyfin/Plex native subtitle overlays whenever asbplayer subtitles are active.
// @author       Beangate
// @updateURL    https://raw.githubusercontent.com/bpwhelan/asb-hide-mediaserver-subs/main/asb-hide-mediaserver-subs.user.js
// @downloadURL  https://raw.githubusercontent.com/bpwhelan/asb-hide-mediaserver-subs/main/asb-hide-mediaserver-subs.user.js
// @match        *://*/web/index.html*
// @match        *://*/web/
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const ASB_SELECTOR = '.asbplayer-subtitles-container-bottom';
  const NATIVE_SUB_SELECTOR = [
    '.videoSubtitles',
    '[class*="videoSubtitles"]',
    '.libjass-subs',
    '[class*="libjass-subs"]',
  ].join(', ');
  const STYLE_ID = 'tm-asb-hide-mediaserver-subs';
  const LOG_PREFIX = '[asb-hide-mediaserver-subs]';

  function isTargetPage() {
    const path = location.pathname;
    const hash = location.hash;
    const isEmby = /\/web\/index\.html$/i.test(path) && hash.startsWith('#!/videoosd/videoosd.html');
    const isJellyfin = /\/web\/?$/i.test(path) && hash.startsWith('#/video');
    const isPlex = /\/web\/index\.html$/i.test(path) && hash.startsWith('#!/');
    return isEmby || isJellyfin || isPlex;
  }

  function ensureHideStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .videoSubtitles,
      [class*="videoSubtitles"],
      .libjass-subs,
      [class*="libjass-subs"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function removeHideStyle() {
    document.getElementById(STYLE_ID)?.remove();
  }

  function disableTextTracks() {
    const video = document.querySelector('video');
    if (!video) return 0;

    let disabledCount = 0;
    [...video.textTracks].forEach((t) => {
      if (t.mode !== 'disabled') {
        t.mode = 'disabled';
        disabledCount += 1;
      }
    });
    video.querySelectorAll('track').forEach((t) => {
      t.default = false;
      t.removeAttribute('default');
    });
    return disabledCount;
  }

  function hideNow() {
    let hiddenOverlayCount = 0;
    document.querySelectorAll(NATIVE_SUB_SELECTOR).forEach((el) => {
      const e = /** @type {HTMLElement} */ (el);
      const changed =
        e.style.display !== 'none' ||
        e.style.visibility !== 'hidden' ||
        e.style.opacity !== '0' ||
        e.textContent !== '';
      e.style.setProperty('display', 'none', 'important');
      e.style.setProperty('visibility', 'hidden', 'important');
      e.style.setProperty('opacity', '0', 'important');
      e.textContent = '';
      if (changed) hiddenOverlayCount += 1;
    });

    let removedMoveUpClassCount = 0;
    document.querySelectorAll('video.moveUpSubtitles').forEach((video) => {
      removedMoveUpClassCount += 1;
      video.classList.remove('moveUpSubtitles');
    });

    const disabledTrackCount = disableTextTracks();

    return {
      hiddenOverlayCount,
      removedMoveUpClassCount,
      disabledTrackCount,
    };
  }

  function apply() {
    if (!isTargetPage()) {
      removeHideStyle();
      return;
    }

    const asbVisible = !!document.querySelector(ASB_SELECTOR);
    if (asbVisible) {
      ensureHideStyle();
      const result = hideNow();
      if (result.hiddenOverlayCount > 0 || result.removedMoveUpClassCount > 0 || result.disabledTrackCount > 0) {
        console.info(
          `${LOG_PREFIX} hide applied: overlays=${result.hiddenOverlayCount}, moveUpClassRemoved=${result.removedMoveUpClassCount}, tracksDisabled=${result.disabledTrackCount}`
        );
      }
    } else {
      removeHideStyle();
    }
  }

  const observer = new MutationObserver(apply);

  function start() {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    apply();
  }

  window.addEventListener('hashchange', apply, false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
