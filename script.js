/* ============================================================
   OCEAN® — interaction layer
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- loader ---------------- */
  var loader = document.getElementById('loader');
  var loaderBar = document.getElementById('loaderBar');
  var enterAudio = document.getElementById('enterAudio');
  var enterSilent = document.getElementById('enterSilent');
  var ambient = document.getElementById('ambient');
  var soundToggle = document.getElementById('soundToggle');
  var soundLabel = document.getElementById('soundLabel');

  var progress = 0;
  var progressTimer = null;

  function tickProgress() {
    progress = Math.min(progress + Math.random() * 16 + 6, 100);
    if (loaderBar) loaderBar.style.width = progress + '%';
    if (progress < 100) {
      progressTimer = window.setTimeout(tickProgress, 130);
    }
  }
  if (loaderBar) tickProgress();

  function closeLoader() {
    if (!loader) return;
    if (progressTimer) window.clearTimeout(progressTimer);
    if (loaderBar) loaderBar.style.width = '100%';
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    window.setTimeout(function () {
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    }, 800);
    revealAll();
  }

  /* ---------------- ambient sound ---------------- */
  var STORE_KEY = 'ocean-sound';

  function setSoundUI(playing) {
    if (!soundToggle) return;
    soundToggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
    if (soundLabel) soundLabel.textContent = playing ? 'Sound on' : 'Sound off';
  }

  function playAmbient() {
    if (!ambient) return;
    ambient.volume = 0.28;
    var p = ambient.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () { setSoundUI(false); });
    }
  }

  function stopAmbient() {
    if (!ambient) return;
    ambient.pause();
  }

  if (ambient) {
    ambient.addEventListener('play', function () { setSoundUI(true); });
    ambient.addEventListener('pause', function () { setSoundUI(false); });
  }

  // Audio is paused on load; the control must reflect that.
  setSoundUI(false);

  if (enterAudio) {
    enterAudio.addEventListener('click', function () {
      try { localStorage.setItem(STORE_KEY, 'on'); } catch (e) {}
      playAmbient();
      closeLoader();
    });
  }
  if (enterSilent) {
    enterSilent.addEventListener('click', function () {
      try { localStorage.setItem(STORE_KEY, 'off'); } catch (e) {}
      stopAmbient();
      closeLoader();
    });
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', function () {
      var playing = soundToggle.getAttribute('aria-pressed') === 'true';
      if (playing) {
        stopAmbient();
        try { localStorage.setItem(STORE_KEY, 'off'); } catch (e) {}
      } else {
        playAmbient();
        try { localStorage.setItem(STORE_KEY, 'on'); } catch (e) {}
      }
    });
  }

  // Never autoplay: only resume if the visitor previously chose sound on.
  var stored = null;
  try { stored = localStorage.getItem(STORE_KEY); } catch (e) {}
  if (stored === 'on' && ambient) {
    // Browsers block playback without a gesture; reflect the real state.
    setSoundUI(false);
  }

  /* ---------------- reveal on scroll ---------------- */
  var revealTargets = [].slice.call(document.querySelectorAll('.card, .reveal'));

  function revealAll() {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealTargets.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 60 + 'ms';
      io.observe(el);
    });
  } else {
    revealAll();
  }

  /* ---------------- filters ---------------- */
  var filters = [].slice.call(document.querySelectorAll('.filter'));
  var cards = [].slice.call(document.querySelectorAll('.card'));
  var emptyMsg = document.getElementById('gridEmpty');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      var shown = 0;
      cards.forEach(function (card) {
        var match = cat === 'all' || card.getAttribute('data-cat') === cat;
        card.classList.toggle('is-hidden', !match);
        if (match) {
          shown++;
          card.classList.add('is-in');
        }
      });
      if (emptyMsg) emptyMsg.hidden = shown > 0;
    });
  });

  /* ---------------- header hide on scroll ---------------- */
  var header = document.getElementById('siteHeader');
  var lastY = window.pageYOffset;

  window.addEventListener('scroll', function () {
    if (!header) return;
    var y = window.pageYOffset;
    if (y > 160 && y > lastY) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
    lastY = y;
  }, { passive: true });

  /* ---------------- mobile menu ---------------- */
  var menuToggle = document.getElementById('menuToggle');
  var siteNav = document.getElementById('siteNav');

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    siteNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        siteNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------------- custom cursor ---------------- */
  var cursor = document.getElementById('cursor');
  var cursorLabel = document.getElementById('cursorLabel');
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (cursor && fine && !reduceMotion) {
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    var tx = cx;
    var ty = cy;

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      cursor.classList.add('is-on');
    }, { passive: true });

    (function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      window.requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor]');
      if (t) {
        cursor.classList.add('is-big');
        if (cursorLabel) cursorLabel.textContent = t.getAttribute('data-cursor');
      } else {
        cursor.classList.remove('is-big');
        if (cursorLabel) cursorLabel.textContent = '';
      }
    });

    document.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-on');
    });
  }

  /* ---------------- smooth anchor offset ---------------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.pageYOffset - 10;
    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------------- safety: never leave the page locked ---------------- */
  window.setTimeout(function () {
    if (document.body.classList.contains('is-loading')) closeLoader();
  }, 6000);
})();
