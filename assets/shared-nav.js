/* ================================================================
   共享导航组件 — assets/shared-nav.js
   子页面共用：顶部导航栏 + 回到顶部按钮 + 节流滚动处理器
   首页不加载此脚本（首页有自己的完整导航）
   ================================================================ */
;(function() {
  'use strict';

  /* 路径深度计算 */
  var depth = location.pathname.replace(/\\/g, '/').split('/').length - 2;
  var prefix = depth > 0 ? '../'.repeat(depth) : '';

  /* ---- 注入顶部导航栏（仅当页面没有 #topNav 时） ---- */
  if (!document.getElementById('topNav')) {
    var nav = document.createElement('nav');
    nav.className = 'top-nav';
    nav.id = 'topNav';
    nav.innerHTML =
      '<div class="top-nav__logo" onclick="location.href=\'' + prefix + '\'">Joke Lin</div>' +
      '<div class="top-nav__links">' +
        '<a class="top-nav__link" href="' + prefix + '">首页</a>' +
      '</div>' +
      '<a class="top-nav__back" href="' + prefix + '">返回门户</a>' +
      '<button class="top-nav__menu-btn" id="menuBtn" aria-label="菜单">☰</button>';
    document.body.insertBefore(nav, document.body.firstChild);

    /* 注入导航栏基础样式（如果页面没有 top-nav 样式） */
    if (!document.querySelector('style[data-shared-nav]')) {
      var style = document.createElement('style');
      style.setAttribute('data-shared-nav', '');
      style.textContent =
        '.top-nav{position:fixed;top:0;left:0;right:0;z-index:8000;display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:60px;background:rgba(10,10,10,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transition:box-shadow .3s}' +
        '.top-nav.scrolled{box-shadow:0 1px 0 var(--border-card),0 4px 20px rgba(0,0,0,.3)}' +
        '.top-nav__logo{font-family:var(--font-heading);font-size:20px;font-weight:700;color:var(--text-primary);cursor:pointer;transition:opacity .2s}' +
        '.top-nav__logo:hover{opacity:.7}' +
        '.top-nav__links{display:flex;gap:24px}' +
        '.top-nav__link{font-family:var(--font-body);font-size:14px;color:var(--text-secondary);transition:color .2s}' +
        '.top-nav__link:hover{color:var(--text-primary)}' +
        '.top-nav__back{font-size:13px;color:var(--text-secondary);border:1px solid var(--border-card);border-radius:50px;padding:6px 18px;transition:var(--transition-fast)}' +
        '.top-nav__back:hover{color:var(--accent-1);border-color:var(--accent-1)}' +
        '.top-nav__menu-btn{display:none;background:none;border:none;font-size:22px;color:var(--text-primary);cursor:pointer}' +
        '.scroll-top{position:fixed;bottom:30px;right:30px;z-index:899;width:44px;height:44px;border-radius:50%;background:rgba(20,20,20,.9);border:1px solid var(--border-card);color:var(--text-secondary);font-size:18px;display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transform:translateY(20px);transition:var(--transition-base);backdrop-filter:blur(8px)}' +
        '.scroll-top.show{opacity:1;visibility:visible;transform:translateY(0)}' +
        '.scroll-top:hover{color:var(--accent-1);border-color:var(--accent-1);transform:translateY(-3px)}' +
        '@media(max-width:768px){.top-nav{padding:0 16px;height:56px}.top-nav__links{display:none}.top-nav__menu-btn{display:block}}';
      document.head.appendChild(style);
    }
  }

  /* ---- 注入回到顶部按钮（仅当页面没有 #scrollTopBtn 时） ---- */
  if (!document.getElementById('scrollTopBtn')) {
    var btn = document.createElement('button');
    btn.className = 'scroll-top';
    btn.id = 'scrollTopBtn';
    btn.title = '返回顶部';
    btn.textContent = '↑';
    document.body.appendChild(btn);
  }

  /* ---- 节流滚动处理器 ---- */
  var topNav = document.getElementById('topNav');
  var scrollBtn = document.getElementById('scrollTopBtn');
  var ticking = false;

  window.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var y = window.scrollY;
      if (topNav) topNav.classList.toggle('scrolled', y > 30);
      if (scrollBtn) scrollBtn.classList.toggle('show', y > 400);
      ticking = false;
    });
  });

  if (scrollBtn) {
    scrollBtn.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  }
})();
