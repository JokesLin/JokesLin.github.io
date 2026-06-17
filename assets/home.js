(function() {
  'use strict';

  var SITE_LAUNCH_DATE = new Date('2025-08-01');

  /* --- Hero animation visibility control --- */
  var heroAnimRunning = true;
  var heroSection = document.getElementById('hero');
  if (heroSection && 'IntersectionObserver' in window) {
    var heroObs = new IntersectionObserver(function(entries) {
      heroAnimRunning = entries[0].isIntersecting;
    });
    heroObs.observe(heroSection);
  }

  /* --- 实时时钟 --- */
  function updateClock() {
    var now = new Date();
    var h = now.getHours(), m = now.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    var el = document.getElementById('heroTime');
    if (el) el.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }
  updateClock();
  setInterval(updateClock, 10000);

  /* --- 打字机标语 --- */
  var taglines = [
    'INFP · 代码是副业，生活才是主业',
    'AI 协作指挥官 · 泡面料包特级获得者',
    'Deadline 爆发型选手 · B站资深鉴赏者',
    'Spotify 终身聆听者 · 吉他练习生',
    '大众点评V7 · 福州美食业余品评官'
  ];
  var taglineIdx = 0, charIdx = 0, isDeleting = false;
  var typingEl = document.getElementById('typingText');
  function typeLoop() {
    var current = taglines[taglineIdx];
    if (isDeleting) {
      charIdx--;
      if (typingEl) typingEl.textContent = current.substring(0, charIdx);
      if (charIdx <= 0) { isDeleting = false; taglineIdx = (taglineIdx + 1) % taglines.length; setTimeout(typeLoop, 600); return; }
      setTimeout(typeLoop, 30);
    } else {
      charIdx++;
      if (typingEl) typingEl.textContent = current.substring(0, charIdx);
      if (charIdx >= current.length) { setTimeout(function() { isDeleting = true; typeLoop(); }, 2500); return; }
      setTimeout(typeLoop, 60);
    }
  }
  setTimeout(typeLoop, 1200);

  /* --- 滚动文字条 (Marquee) --- */
  var marqueeWords = ['JOKELIN', 'INFP', 'AI EXPLORER', 'PYTHON', 'GUITAR', 'BILIBILI Lv6', 'SPOTIFY', 'CSGO', 'GITHUB PAGES', 'CREATIVE', 'FUZHOU'];
  var track = document.getElementById('marqueeTrack');
  if (track) {
    var html = '';
    for (var dup = 0; dup < 3; dup++) {
      marqueeWords.forEach(function(w) {
        html += '<span class="marquee-item">' + w + '</span>';
        html += '<span class="marquee-dot">·</span>';
      });
    }
    track.innerHTML = html;
  }

  /* --- Resource Hub：从书签数据加载分类资源 --- */
  (function() {
    var grid = document.getElementById('resourceGrid');
    if (!grid) return;
    var RES_CONFIG = [
      { id: 'media',   icon: '🎬', name: '影视娱乐', gradient: 'linear-gradient(135deg,#e74c3c,#c0392b)', glow: 'rgba(231,76,60,0.15)',  show: 4, siteGradient: ['#e74c3c','#c0392b'] },
      { id: 'games',   icon: '🎮', name: '游戏下载', gradient: 'linear-gradient(135deg,#8e44ad,#9b59b6)', glow: 'rgba(142,68,173,0.15)', show: 4, siteGradient: ['#8e44ad','#9b59b6'] },
      { id: 'ai',      icon: '🤖', name: 'AI 工具',   gradient: 'linear-gradient(135deg,#6c47ff,#4630b3)', glow: 'rgba(108,71,255,0.15)', show: 4, siteGradient: ['#6c47ff','#4630b3'] },
      { id: 'tech',    icon: '🔧', name: '实用工具', gradient: 'linear-gradient(135deg,#1a73e8,#0d47a1)', glow: 'rgba(26,115,232,0.15)', show: 4, siteGradient: ['#1a73e8','#0d47a1'] },
      { id: 'cloud',   icon: '☁️', name: '网盘存储', gradient: 'linear-gradient(135deg,#00b894,#00cec9)', glow: 'rgba(0,184,148,0.15)',  show: 4, siteGradient: ['#00b894','#00cec9'] },
      { id: 'network', icon: '🌐', name: '网络工具', gradient: 'linear-gradient(135deg,#f39c12,#e67e22)', glow: 'rgba(243,156,18,0.15)', show: 4, siteGradient: ['#f39c12','#e67e22'] }
    ];

    fetch('content/bookmarks/data.json').then(function(r) { return r.json(); }).then(function(data) {
      var catMap = {};
      (data.categories || []).forEach(function(cat) { catMap[cat.id] = cat; });

      var html = '';
      RES_CONFIG.forEach(function(cfg) {
        var cat = catMap[cfg.id];
        if (!cat) return;
        var items = (cat.items || []).slice(0, cfg.show);
        var totalCount = (cat.items || []).length;

        var sitesHtml = '';
        items.forEach(function(item) {
          var g = item.gradient || cfg.siteGradient;
          var desc = item.desc || '';
          sitesHtml += '<a class="res-site" href="' + item.url + '" target="_blank">'
            + '<div class="res-site__icon" style="background:linear-gradient(135deg,' + g[0] + ',' + g[1] + ')">' + item.icon + '</div>'
            + '<div class="res-site__body">'
            + '<div class="res-site__name">' + item.name + '</div>'
            + (desc ? '<div class="res-site__desc">' + desc + '</div>' : '')
            + '</div>'
            + '<span class="res-site__arrow">→</span>'
            + '</a>';
        });

        html += '<div class="res-card blur-in" style="--res-gradient:' + cfg.gradient + ';--res-glow:' + cfg.glow + '">'
          + '<div class="res-card__header">'
          + '<div class="res-card__icon">' + cfg.icon + '</div>'
          + '<div class="res-card__info">'
          + '<div class="res-card__name">' + cfg.name + '</div>'
          + '<div class="res-card__count">' + totalCount + ' 个站点</div>'
          + '</div>'
          + '</div>'
          + '<div class="res-card__sites">' + sitesHtml + '</div>'
          + '<a class="res-card__more" href="content/bookmarks/#' + cfg.id + '">'
          + '查看全部 ' + totalCount + ' 个'
          + '<span class="res-card__more-arrow">→</span>'
          + '</a>'
          + '</div>';
      });
      grid.innerHTML = html;
      if (window.initScrollAnims) window.initScrollAnims();
    }).catch(function() {});
  })();

  /* --- 导航栏滚动效果 + 返回顶部 (merged & throttled) --- */
  var topNav = document.getElementById('topNav');
  var scrollBtn = document.getElementById('scrollTopBtn');
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var y = window.scrollY;
      topNav.classList.toggle('scrolled', y > 50);
      scrollBtn.classList.toggle('show', y > 400);
      ticking = false;
    });
  });
  scrollBtn.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };

  /* --- 移动端导航 --- */
  var menuBtn = document.getElementById('menuBtn');
  var menuClose = document.getElementById('menuClose');
  var mobileNav = document.getElementById('mobileNav');
  if (menuBtn) menuBtn.onclick = function() { mobileNav.classList.add('open'); };
  if (menuClose) menuClose.onclick = function() { mobileNav.classList.remove('open'); };
  window.closeMobileNav = function() { if (mobileNav) mobileNav.classList.remove('open'); };

  /* --- Hero 几何线条背景 --- */
  (function() {
    var canvas = document.getElementById('heroBgCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var lines = [];
    var LINE_COUNT = 18;
    function resize() {
      var hero = document.getElementById('hero');
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Line() {
      this.reset();
    }
    Line.prototype.reset = function() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.len = 80 + Math.random() * 200;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = 0.002 + Math.random() * 0.008;
      this.drift = (Math.random() - 0.5) * 0.3;
      this.opacity = 0.03 + Math.random() * 0.08;
      this.width = 0.5 + Math.random() * 1;
    };
    Line.prototype.update = function() {
      this.angle += this.speed;
      this.x += Math.cos(this.angle) * this.drift;
      this.y += Math.sin(this.angle) * this.drift;
      if (this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) {
        this.reset();
      }
    };
    Line.prototype.draw = function() {
      var x2 = this.x + Math.cos(this.angle) * this.len;
      var y2 = this.y + Math.sin(this.angle) * this.len;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(255,255,255,' + this.opacity + ')';
      ctx.lineWidth = this.width;
      ctx.stroke();
      // 交叉点小圆
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(51,112,255,' + (this.opacity * 1.5) + ')';
      ctx.fill();
    };

    for (var i = 0; i < LINE_COUNT; i++) lines.push(new Line());

    // 连接距离较近的端点
    function connectEnds() {
      for (var a = 0; a < lines.length; a++) {
        for (var b = a + 1; b < lines.length; b++) {
          var dx = lines[a].x - lines[b].x;
          var dy = lines[a].y - lines[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(51,112,255,' + (0.03 * (1 - dist / 200)) + ')';
            ctx.lineWidth = 0.5;
            ctx.moveTo(lines[a].x, lines[a].y);
            ctx.lineTo(lines[b].x, lines[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!heroAnimRunning) { requestAnimationFrame(animate); return; }
      ctx.fillStyle = 'rgba(10,10,10,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      lines.forEach(function(l) { l.update(); l.draw(); });
      connectEnds();
      requestAnimationFrame(animate);
    }
    // 初始填充黑色
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();
  })();

  /* --- 粒子系统 --- */
  (function() {
    var canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 60;
    function resize() {
      var hero = document.getElementById('hero');
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.3 + 0.1;
    }
    Particle.prototype.update = function() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    };
    Particle.prototype.draw = function() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + this.opacity + ')';
      ctx.fill();
    };
    for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    function connectParticles() {
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.06 * (1 - dist / 150)) + ')';
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }
    function animateParticles() {
      if (!heroAnimRunning) { requestAnimationFrame(animateParticles); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function(p) { p.update(); p.draw(); });
      connectParticles();
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  })();

  /* --- 鼠标跟随光晕 --- */
  (function() {
    var glow = document.getElementById('heroGlow');
    var hero = document.getElementById('hero');
    if (!glow || !hero) return;
    var shown = false;
    hero.addEventListener('mousemove', function(e) {
      if (!shown) { glow.classList.add('hero__glow--visible'); shown = true; }
      var rect = hero.getBoundingClientRect();
      glow.style.left = (e.clientX - rect.left) + 'px';
      glow.style.top = (e.clientY - rect.top) + 'px';
    });
  })();

  /* --- 噪点纹理生成 --- */
  (function() {
    var canvas = document.getElementById('heroGrain');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width = 256; canvas.height = 256;
    function generateGrain() {
      var imgData = ctx.createImageData(256, 256);
      for (var i = 0; i < imgData.data.length; i += 4) {
        var v = Math.random() * 255;
        imgData.data[i] = v; imgData.data[i+1] = v; imgData.data[i+2] = v;
        imgData.data[i+3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    }
    generateGrain();
    // Visibility-aware grain interval
    var grainInterval = null;
    function startGrain() {
      if (!grainInterval) grainInterval = setInterval(generateGrain, 120);
    }
    function stopGrain() {
      if (grainInterval) { clearInterval(grainInterval); grainInterval = null; }
    }
    if (heroAnimRunning) startGrain();
    // Observe hero visibility to start/stop grain (reuses heroObs if available)
    if (heroSection && 'IntersectionObserver' in window) {
      var grainObs = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) startGrain();
        else stopGrain();
      });
      grainObs.observe(heroSection);
    }
  })();

  /* --- 区块标题滚动揭示 --- */
  (function() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.section-title').forEach(function(el) { el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.section-title').forEach(function(el) { obs.observe(el); });
  })();

  /* --- 运行时天数 --- */
  (function() {
    var days = Math.floor((new Date() - SITE_LAUNCH_DATE) / (1000 * 60 * 60 * 24));
    var el = document.getElementById('runtimeDays');
    if (el) el.textContent = days;
  })();

  /* --- 手风琴切换 --- */
  window.toggleAccordion = function(header) {
    var item = header.parentElement;
    var wasOpen = item.classList.contains('open');
    // 关闭所有
    document.querySelectorAll('.accordion-item').forEach(function(ai) {
      ai.classList.remove('open');
    });
    // 切换当前
    if (!wasOpen) item.classList.add('open');
  };

  /* --- 统计数字动画 --- */
  function animateCounter(el, target) {
    var duration = 2000;
    var start = 0;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  /* --- 滚动入场动画 (由 scroll-anim.js 处理) --- */

  /* ===== 1. 点击计数器 — 星光粒子爆破（5秒冷却） ===== */
  (function() {
    var clickCount = 0;
    var lastClickTime = 0;
    var COOLDOWN = 5000; // 5秒冷却
    document.addEventListener('click', function(e) {
      // 忽略交互元素上的点击
      if (e.target.closest('a, button, input, .accordion-header, .bgm-player, .top-nav, .mobile-nav')) return;
      var now = Date.now();
      if (now - lastClickTime < COOLDOWN) return;
      lastClickTime = now;
      clickCount++;
      var x = e.clientX, y = e.clientY;
      // 粒子爆破
      for (var i = 0; i < 8; i++) {
        var dot = document.createElement('div');
        dot.className = 'star-burst';
        var angle = (Math.PI * 2 / 8) * i;
        var dist = 30 + Math.random() * 40;
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        dot.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
        dot.style.setProperty('--by', Math.sin(angle) * dist + 'px');
        dot.style.background = ['#fff', '#3370ff', '#80caff', '#f1e7b5'][i % 4];
        document.body.appendChild(dot);
        (function(d) { setTimeout(function() { d.remove(); }, 800); })(dot);
      }
      // 弹出文字
      var popup = document.createElement('div');
      popup.className = 'star-click-popup';
      var num = (2000 + clickCount * 7 + Math.floor(Math.random() * 500)).toLocaleString();
      popup.textContent = '✨ 你是第 ' + num + ' 位点亮星光的旅人';
      popup.style.left = x + 'px';
      popup.style.top = (y - 10) + 'px';
      document.body.appendChild(popup);
      setTimeout(function() { popup.remove(); }, 1600);
    });
  })();

  /* ===== 3. 页脚随机名言 ===== */
  (function() {
    var quotes = [
      '「代码是写给人看的，顺便让机器执行。」— Harold Abelson',
      '「简单是终极的复杂。」— 达芬奇',
      '「不是因为看到了希望才坚持，而是坚持了才看到希望。」',
      '「人生就像骑自行车，想保持平衡就得往前走。」— 爱因斯坦',
      '「真正的智慧不是预见未来，而是知道当下该做什么。」',
      '「每一个不曾起舞的日子，都是对生命的辜负。」— 尼采',
      '「你不需要看到整个楼梯，只需迈出第一步。」— 马丁·路德·金',
      '「最好的时间是十年前，其次是现在。」',
      '「万物皆有裂痕，那是光照进来的地方。」— Leonard Cohen',
      '「做你害怕做的事，害怕自然会消失。」— Ralph Waldo Emerson',
      '「世界上只有一种英雄主义，就是认清了生活的真相后依然热爱它。」— 罗曼·罗兰',
      '「Stay hungry, stay foolish.」— Steve Jobs',
      '「完美不是无可添加，而是无可删减。」— Antoine de Saint-Exupéry',
      '「种一棵树最好的时间是十年前，其次是现在。」— 中国谚语',
      '「吾日三省吾身：为人谋而不忠乎？与朋友交而不信乎？传不习乎？」— 曾子',
      '「路漫漫其修远兮，吾将上下而求索。」— 屈原',
      '「知之者不如好之者，好之者不如乐之者。」— 孔子',
      '「纸上得来终觉浅，绝知此事要躬行。」— 陆游',
      '「博学之，审问之，慎思之，明辨之，笃行之。」— 《中庸》',
      '「生活不止眼前的苟且，还有诗和远方的田野。」— 高晓松',
      '「既然选择了远方，便只顾风雨兼程。」— 汪国真',
      '「你今天的日积月累，终将成为别人的望尘莫及。」',
      '「所有的努力都不会白费，你付出多少时间和精力，都是在对未来的积累。」',
      '「To iterate is human, to recurse divine.」— L. Peter Deutsch',
      '「Talk is cheap. Show me the code.」— Linus Torvalds',
      '「任何足够先进的技术，都与魔法无异。」— Arthur C. Clarke',
    ];
    var el = document.getElementById('footerQuote');
    if (el) {
      var idx = Math.floor(Math.random() * quotes.length);
      el.textContent = quotes[idx];
    }
  })();

})();
