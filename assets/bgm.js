/* ================================================================
   BGM 全局播放器 — assets/bgm.js
   用户明确播放后才加载音频；localStorage 只保存播放状态
   ================================================================ */
;(function() {
  'use strict';

  var BGM_LIST = [
    { title: 'Ashes',                artist: 'Stellar',               file: 'bgm/Ashes (Explicit) .mp3' },
    { title: 'Closer',               artist: 'The Chainsmokers',      file: 'bgm/Closer.aac' },
    { title: 'Contact',              artist: 'Lulleaux & Giang Pham', file: 'bgm/Contact - Lulleaux&Giang Pham.aac' },
    { title: 'My Personal Song',     artist: 'Unknown',               file: 'bgm/My Personal Song.mp3' },
    { title: 'Relax',                artist: 'Junona Boys',           file: 'bgm/Relax - Junona Boys.mp3' }
  ];

  var depth = location.pathname.replace(/\\/g, '/').split('/').length - 2;
  var prefix = depth > 0 ? '../'.repeat(depth) : '';
  BGM_LIST.forEach(function(track) { track.file = prefix + track.file; });

  var LS_KEY = 'bgm_state';
  var POSITION_KEY = 'bgm_bottom';
  var audio = new Audio();
  var loadedIdx = -1;
  var pendingTime = 0;
  var lastSavedSecond = -1;
  audio.preload = 'none';

  function loadState() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; }
  }
  function clampIndex(value) {
    value = Number(value);
    if (!isFinite(value)) return 0;
    return Math.max(0, Math.min(BGM_LIST.length - 1, Math.floor(value)));
  }
  function saveState() {
    var s = {
      idx: audio._idx,
      time: audio.currentTime || 0,
      vol: audio.volume,
      playing: !audio.paused,
      ts: Date.now()
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function shuffleIdx(current) {
    if (BGM_LIST.length <= 1) return 0;
    var next;
    do { next = Math.floor(Math.random() * BGM_LIST.length); } while (next === current);
    return next;
  }

  function build() {
    if (document.getElementById('bgmRoot')) return;

    var state = loadState();
    audio._idx = clampIndex(state.idx);
    audio.volume = typeof state.vol === 'number' ? Math.max(0, Math.min(1, state.vol)) : .3;
    pendingTime = typeof state.time === 'number' ? Math.max(0, state.time) : 0;

    var root = document.createElement('div');
    root.id = 'bgmRoot';
    root.innerHTML =
      '<div class="bgm-player paused" id="bgmPlayer">' +
        '<div class="bgm-peek" id="bgmPeek" title="BGM" aria-label="打开背景音乐">' +
          '<div class="bgm-peek-bars"><span></span><span></span><span></span><span></span></div>' +
        '</div>' +
        '<div class="bgm-panel" aria-label="背景音乐播放器">' +
          '<div class="bgm-panel__inner">' +
            '<div class="bgm-panel__header">' +
              '<div><div class="bgm-panel__title" id="bgmTitle">—</div>' +
              '<div class="bgm-panel__artist" id="bgmArtist">点击播放后加载</div></div>' +
              '<button class="bgm-panel__close" id="bgmClose" title="收起" type="button">✕</button>' +
            '</div>' +
            '<div class="bgm-panel__controls">' +
              '<button class="bgm-btn" id="bgmPrev" title="上一首" type="button">⏮</button>' +
              '<button class="bgm-btn bgm-btn--play" id="bgmToggle" title="播放/暂停" type="button">▶</button>' +
              '<button class="bgm-btn" id="bgmNext" title="下一首" type="button">⏭</button>' +
            '</div>' +
            '<div class="bgm-panel__volume">' +
              '<span class="bgm-panel__volume-icon">🔊</span>' +
              '<input type="range" class="bgm-volume" id="bgmVolume" min="0" max="100" value="30" aria-label="音量">' +
            '</div>' +
            '<div class="bgm-panel__list" id="bgmList"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    var player = document.getElementById('bgmPlayer');
    var peek = document.getElementById('bgmPeek');
    var close = document.getElementById('bgmClose');
    var toggle = document.getElementById('bgmToggle');
    var prev = document.getElementById('bgmPrev');
    var next = document.getElementById('bgmNext');
    var vol = document.getElementById('bgmVolume');
    var list = document.getElementById('bgmList');
    var title = document.getElementById('bgmTitle');
    var artist = document.getElementById('bgmArtist');

    vol.value = Math.round(audio.volume * 100);

    function updateUI() {
      var track = BGM_LIST[audio._idx];
      title.textContent = track.title;
      artist.textContent = audio.paused ? track.artist + ' · 点击播放' : track.artist;
      toggle.textContent = audio.paused ? '▶' : '⏸';
      player.classList.toggle('paused', audio.paused);
      list.querySelectorAll('.bgm-track').forEach(function(el, i) {
        el.classList.toggle('active', i === audio._idx);
      });
    }

    function ensureAudio(index) {
      index = clampIndex(index);
      if (loadedIdx === index && audio.src) return;
      loadedIdx = index;
      audio._idx = index;
      audio.src = BGM_LIST[index].file;
      audio.preload = 'none';
      audio.load();
    }

    function playCurrent() {
      ensureAudio(audio._idx);
      var promise = audio.play();
      if (promise && promise.catch) promise.catch(function() {});
    }

    function loadTrack(index, autoplay) {
      audio._idx = clampIndex(index);
      pendingTime = 0;
      ensureAudio(audio._idx);
      updateUI();
      if (autoplay) playCurrent();
    }

    BGM_LIST.forEach(function(track, i) {
      list.insertAdjacentHTML('beforeend',
        '<button class="bgm-track" data-idx="' + i + '" type="button">' +
          '<span class="bgm-track__idx">' + (i + 1) + '</span>' +
          '<span class="bgm-track__name">' + track.title + '</span>' +
        '</button>');
    });

    peek.onclick = function() { player.classList.toggle('expanded'); };
    close.onclick = function() { player.classList.remove('expanded'); };
    toggle.onclick = function() { if (audio.paused) playCurrent(); else audio.pause(); };
    prev.onclick = function() { loadTrack(shuffleIdx(audio._idx), true); };
    next.onclick = function() { loadTrack(shuffleIdx(audio._idx), true); };
    vol.oninput = function() { audio.volume = Number(this.value) / 100; saveState(); };
    list.onclick = function(e) {
      var button = e.target.closest('.bgm-track');
      if (!button) return;
      loadTrack(Number(button.getAttribute('data-idx')), true);
    };

    /* ---- 拖动与位置恢复 ---- */
    var dragState = { active: false, startY: 0, startBottom: 0 };
    function getBottom() { return parseInt(getComputedStyle(player).bottom, 10) || 24; }
    function onStartDrag(e) {
      if (e.type === 'mousedown' && e.button !== 0) return;
      if (e.target.closest('.bgm-btn, .bgm-volume, .bgm-track, .bgm-panel__close')) return;
      dragState.active = true;
      dragState.startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      dragState.startBottom = getBottom();
      player.classList.add('dragging');
      e.preventDefault();
    }
    function onMoveDrag(e) {
      if (!dragState.active) return;
      var clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      var newBottom = dragState.startBottom + dragState.startY - clientY;
      var maxBottom = window.innerHeight - 70;
      player.style.bottom = Math.max(10, Math.min(maxBottom, newBottom)) + 'px';
      player.style.top = 'auto';
    }
    function onEndDrag() {
      if (!dragState.active) return;
      dragState.active = false;
      player.classList.remove('dragging');
      try { localStorage.setItem(POSITION_KEY, String(getBottom())); } catch (e) {}
    }
    player.addEventListener('mousedown', onStartDrag);
    document.addEventListener('mousemove', onMoveDrag);
    document.addEventListener('mouseup', onEndDrag);
    player.addEventListener('touchstart', onStartDrag, { passive: false });
    document.addEventListener('touchmove', onMoveDrag, { passive: true });
    document.addEventListener('touchend', onEndDrag);
    try {
      var savedBottom = localStorage.getItem(POSITION_KEY);
      if (savedBottom !== null) player.style.bottom = savedBottom + 'px';
    } catch (e) {}

    audio.addEventListener('loadedmetadata', function() {
      if (pendingTime > 0) {
        try { audio.currentTime = Math.min(pendingTime, Math.max(0, audio.duration - .1)); } catch (e) {}
        pendingTime = 0;
      }
    });
    audio.addEventListener('play', updateUI);
    audio.addEventListener('pause', function() { saveState(); updateUI(); });
    audio.addEventListener('ended', function() { loadTrack(shuffleIdx(audio._idx), true); });
    audio.addEventListener('error', function() { artist.textContent = '音频加载失败'; updateUI(); });
    audio.addEventListener('timeupdate', function() {
      var second = Math.floor(audio.currentTime);
      if (second % 3 === 0 && second !== lastSavedSecond) {
        lastSavedSecond = second;
        saveState();
      }
    });
    window.addEventListener('beforeunload', saveState);
    window.addEventListener('pagehide', saveState);
    document.addEventListener('visibilitychange', function() { if (document.hidden) saveState(); });
    document.addEventListener('keydown', function(e) {
      if (e.code !== 'Space' || /input|textarea|select/i.test(e.target.tagName || '') || e.target.isContentEditable) return;
      e.preventDefault();
      if (audio.paused) playCurrent(); else audio.pause();
    });

    /* 初始化只显示状态，不设置 audio.src，不产生音频请求。 */
    updateUI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
