/* ================================================================
   BGM 全局播放器 — assets/bgm.js
   所有页面共用，localStorage 同步状态，跨页面续播
   ================================================================ */
;(function() {
  'use strict';

  /* ---- 歌曲列表 ---- */
  var BGM_LIST = [
    { title: 'Ashes',                artist: 'Stellar',               file: 'bgm/Ashes (Explicit) .mp3' },
    { title: 'Closer',               artist: 'The Chainsmokers',      file: 'bgm/Closer.aac' },
    { title: 'Contact',              artist: 'Lulleaux & Giang Pham', file: 'bgm/Contact - Lulleaux&Giang Pham.aac' },
    { title: 'Lash Out',             artist: 'Unknown',               file: 'bgm/Lash Out.aac' },
    { title: 'My Personal Song',     artist: 'Unknown',               file: 'bgm/My Personal Song.mp3' },
    { title: 'Relax',                artist: 'Junona Boys',           file: 'bgm/Relax - Junona Boys.mp3' },
    { title: 'The Cool Kid',         artist: 'Unknown',               file: 'bgm/The Cool Kid.aac' }
  ];

  /* ---- 路径修正：根据当前页面深度自动计算 bgm/ 的相对路径 ---- */
  var depth = location.pathname.replace(/\\/g, '/').split('/').length - 2;
  var prefix = depth > 0 ? '../'.repeat(depth) : '';
  BGM_LIST.forEach(function(t) { t.file = prefix + t.file; });

  /* ---- localStorage 键 ---- */
  var LS_KEY = 'bgm_state';

  function loadState() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch(e) { return {}; }
  }
  function saveState(extra) {
    var s = loadState();
    s.idx    = audio._idx;
    s.time   = audio.currentTime;
    s.vol    = audio.volume;
    s.playing = !audio.paused;
    s.ts     = Date.now();
    if (extra) for (var k in extra) s[k] = extra[k];
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch(e) {}
  }

  /* ---- 随机播放下一首（不重复当前） ---- */
  function shuffleIdx(current) {
    if (BGM_LIST.length <= 1) return 0;
    var next;
    do { next = Math.floor(Math.random() * BGM_LIST.length); } while (next === current);
    return next;
  }

  /* ---- Audio 实例 ---- */
  var audio = new Audio();
  audio._idx = 0;
  audio.preload = 'auto';

  /* ---- DOM 构建 ---- */
  function build() {
    // 避免重复构建
    if (document.getElementById('bgmRoot')) return;

    var root = document.createElement('div');
    root.id = 'bgmRoot';
    root.innerHTML =
    '<div class="bgm-player paused" id="bgmPlayer">' +
      '<div class="bgm-peek" id="bgmPeek" title="BGM">' +
        '<div class="bgm-peek-bars"><span></span><span></span><span></span><span></span></div>' +
      '</div>' +
      '<div class="bgm-panel">' +
        '<div class="bgm-panel__inner">' +
          '<div class="bgm-panel__header">' +
            '<div><div class="bgm-panel__title" id="bgmTitle">—</div>' +
            '<div class="bgm-panel__artist" id="bgmArtist">—</div></div>' +
            '<button class="bgm-panel__close" id="bgmClose" title="收起">✕</button>' +
          '</div>' +
          '<div class="bgm-panel__controls">' +
            '<button class="bgm-btn" id="bgmPrev" title="上一首">⏮</button>' +
            '<button class="bgm-btn bgm-btn--play" id="bgmToggle" title="播放/暂停">▶</button>' +
            '<button class="bgm-btn" id="bgmNext" title="下一首">⏭</button>' +
          '</div>' +
          '<div class="bgm-panel__volume">' +
            '<span class="bgm-panel__volume-icon">🔊</span>' +
            '<input type="range" class="bgm-volume" id="bgmVolume" min="0" max="100" value="50">' +
          '</div>' +
          '<div class="bgm-panel__list" id="bgmList"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(root);

    /* 绑定事件 */
    var player  = document.getElementById('bgmPlayer');
    var peek    = document.getElementById('bgmPeek');
    var close   = document.getElementById('bgmClose');
    var toggle  = document.getElementById('bgmToggle');
    var prev    = document.getElementById('bgmPrev');
    var next    = document.getElementById('bgmNext');
    var vol     = document.getElementById('bgmVolume');
    var list    = document.getElementById('bgmList');
    var title   = document.getElementById('bgmTitle');
    var artist  = document.getElementById('bgmArtist');

    /* 渲染播放列表 */
    var listHtml = '';
    BGM_LIST.forEach(function(t, i) {
      listHtml += '<button class="bgm-track' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '">' +
        '<span class="bgm-track__idx">' + (i + 1) + '</span>' +
        '<span class="bgm-track__name">' + t.title + '</span></button>';
    });
    list.innerHTML = listHtml;

    function updateUI(idx) {
      var t = BGM_LIST[idx];
      title.textContent = t.title;
      artist.textContent = t.artist;
      // 高亮列表
      list.querySelectorAll('.bgm-track').forEach(function(el, i) {
        el.classList.toggle('active', i === idx);
      });
    }
    function setPlaying(playing) {
      player.classList.toggle('paused', !playing);
      toggle.textContent = playing ? '⏸' : '▶';
    }

    /* 展开/收起 */
    peek.onclick = function() { player.classList.toggle('expanded'); };
    close.onclick = function() { player.classList.remove('expanded'); };

    /* ---- 上下拖动 ---- */
    var dragState = { active: false, startY: 0, startBottom: 0 };
    function getBottom() {
      return parseInt(getComputedStyle(player).bottom) || 30;
    }
    function onStartDrag(e) {
      // 只响应左键
      if (e.type === 'mousedown' && e.button !== 0) return;
      // 点击控制按钮时不拖动
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
      var delta = dragState.startY - clientY; // 向上拖 delta 为正
      var newBottom = dragState.startBottom + delta;
      var maxBottom = window.innerHeight - 60;
      newBottom = Math.max(10, Math.min(maxBottom, newBottom));
      player.style.bottom = newBottom + 'px';
      // 移除 top 防止冲突
      player.style.top = 'auto';
    }
    function onEndDrag() {
      if (!dragState.active) return;
      dragState.active = false;
      player.classList.remove('dragging');
      // 保存位置
      try { localStorage.setItem('bgm_bottom', getBottom()); } catch(e) {}
    }
    player.addEventListener('mousedown', onStartDrag);
    document.addEventListener('mousemove', onMoveDrag);
    document.addEventListener('mouseup', onEndDrag);
    player.addEventListener('touchstart', onStartDrag, { passive: false });
    document.addEventListener('touchmove', onMoveDrag, { passive: true });
    document.addEventListener('touchend', onEndDrag);

    // 恢复保存的位置
    try {
      var savedBottom = localStorage.getItem('bgm_bottom');
      if (savedBottom !== null) {
        player.style.bottom = savedBottom + 'px';
      }
    } catch(e) {}

    /* 播放/暂停 */
    toggle.onclick = function() {
      if (audio.paused) { audio.play(); } else { audio.pause(); }
    };
    prev.onclick = function() {
      audio._idx = shuffleIdx(audio._idx);
      loadTrack(audio._idx, true);
    };
    next.onclick = function() {
      audio._idx = shuffleIdx(audio._idx);
      loadTrack(audio._idx, true);
    };
    vol.oninput = function() { audio.volume = this.value / 100; };

    /* 列表点击 */
    list.onclick = function(e) {
      var btn = e.target.closest('.bgm-track');
      if (!btn) return;
      audio._idx = parseInt(btn.getAttribute('data-idx'));
      loadTrack(audio._idx, true);
    };

    /* 加载并播放 */
    function loadTrack(idx, autoplay) {
      audio.src = BGM_LIST[idx].file;
      updateUI(idx);
      if (autoplay) {
        audio.play().catch(function(){});
      }
    }

    /* Audio 事件 */
    audio.onplay  = function() { setPlaying(true); };
    audio.onpause = function() { setPlaying(false); };
    audio.onended = function() {
      audio._idx = shuffleIdx(audio._idx);
      loadTrack(audio._idx, true);
    };
    audio.ontimeupdate = function() {
      // 每 3 秒存一次状态（节流）
      if (Math.floor(audio.currentTime) % 3 === 0) saveState();
    };

    /* 页面离开前保存状态 */
    window.addEventListener('beforeunload', function() { saveState(); });
    window.addEventListener('pagehide', function() { saveState(); });
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) saveState();
    });

    /* ---- 恢复上次播放状态 ---- */
    var state = loadState();
    var startIdx = state.idx || 0;
    var startTime = state.time || 0;
    var startVol = state.vol !== undefined ? state.vol : 0.3;
    var wasPlaying = state.playing;
    var stateAge = state.ts ? (Date.now() - state.ts) : Infinity;

    audio._idx = startIdx;
    audio.volume = startVol;
    vol.value = Math.round(startVol * 100);
    loadTrack(startIdx, false);

    updateUI(startIdx);

    /* ---- 自动播放策略 ----
       浏览器禁止无交互 autoplay，所以：
       1. 立即尝试恢复播放（部分浏览器/Safari PWA 可能成功）
       2. 若失败，在用户任意交互时持续重试，直到播放成功
    */
    var autoPlayDone = false;
    function attemptAutoPlay() {
      if (autoPlayDone || !audio.paused) return;
      audio.play().then(function() {
        autoPlayDone = true;
        setPlaying(true);
        if (wasPlaying) {
          player.classList.add('expanded');
          setTimeout(function() { player.classList.remove('expanded'); }, 3000);
        }
        removeAutoPlayListeners();
      }).catch(function() {});
    }
    function onUserInteract() {
      if (autoPlayDone) return;
      if (audio.paused) {
        if (wasPlaying && stateAge < 30000) {
          audio.currentTime = startTime;
        }
        attemptAutoPlay();
      } else {
        autoPlayDone = true;
        removeAutoPlayListeners();
      }
    }
    function removeAutoPlayListeners() {
      ['click','touchstart','keydown','pointerdown'].forEach(function(evt) {
        document.removeEventListener(evt, onUserInteract);
      });
    }
    ['click','touchstart','keydown','pointerdown'].forEach(function(evt) {
      document.addEventListener(evt, onUserInteract, { passive: true });
    });

    // 立即尝试一次（无需用户交互）
    if (wasPlaying && stateAge < 30000) {
      audio.currentTime = startTime;
      attemptAutoPlay();
    }

    /* ---- 空格键暂停/播放（排除输入框） ---- */
    document.addEventListener('keydown', function(e) {
      if (e.code === 'Space' || e.key === ' ') {
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
        e.preventDefault();
        if (audio.paused) audio.play(); else audio.pause();
      }
    });
  }

  /* 页面加载后构建 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
