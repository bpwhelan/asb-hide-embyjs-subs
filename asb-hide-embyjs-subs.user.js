// ==UserScript==
// @name         Emby: Hide Native Subs When asbplayer Subs Are Active
// @namespace    https://github.com/bpwhelan/asb-hide-embyjs-subs
// @version      1.0.0
// @description  Hides Emby/Jellyfin native subtitle overlay whenever asbplayer bottom subtitles container exists.
// @author       Beangate
// @updateURL    https://raw.githubusercontent.com/bpwhelan/asb-hide-embyjs-subs/main/asb-hide-embyjs-subs.user.js
// @downloadURL  https://raw.githubusercontent.com/bpwhelan/asb-hide-embyjs-subs/main/asb-hide-embyjs-subs.user.js
// @match        *://*/web/index.html*
// @match        *://*/web/
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const ASB_SELECTOR = '.asbplayer-subtitles-container-bottom';
  const EMBY_SUB_SELECTOR = '.videoSubtitles, [class*="videoSubtitles"]';
  const STYLE_ID = 'tm-asb-hide-embyjs-subs';

  function isTargetPage() {
    const path = location.pathname;
    const hash = location.hash;
    const isEmby = /\/web\/index\.html$/i.test(path) && hash.startsWith('#!/videoosd/videoosd.html');
    const isJellyfin = /\/web\/?$/i.test(path) && hash.startsWith('#/video');
    return isEmby || isJellyfin;
  }

  function ensureHideStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .videoSubtitles,
      [class*="videoSubtitles"] {
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
    if (!video) return;

    [...video.textTracks].forEach((t) => (t.mode = 'disabled'));
    video.querySelectorAll('track').forEach((t) => {
      t.default = false;
      t.removeAttribute('default');
    });
  }

  function hideNow() {
    document.querySelectorAll(EMBY_SUB_SELECTOR).forEach((el) => {
      const e = /** @type {HTMLElement} */ (el);
      e.style.setProperty('display', 'none', 'important');
      e.style.setProperty('visibility', 'hidden', 'important');
      e.style.setProperty('opacity', '0', 'important');
      e.textContent = '';
    });

    document.querySelectorAll('video.moveUpSubtitles').forEach((video) => {
      video.classList.remove('moveUpSubtitles');
    });

    disableTextTracks();
  }

  function apply() {
    if (!isTargetPage()) {
      removeHideStyle();
      return;
    }

    const asbVisible = !!document.querySelector(ASB_SELECTOR);
    if (asbVisible) {
      ensureHideStyle();
      hideNow();
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
