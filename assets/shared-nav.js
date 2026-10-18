/* ================================================================
   共享导航组件 — 浅色编辑部导航
   子页面共用：顶部导航、移动端面板、返回顶部
   ================================================================ */
;(function() {
  'use strict';

  var depth = location.pathname.replace(/\\/g, '/').split('/').length - 2;
  var prefix = depth > 0 ? '../'.repeat(depth) : '';
  var topNav = document.getElementById('topNav');

  if (!topNav) {
    topNav = document.createElement('nav');
    topNav.className = 'top-nav';
    topNav.id = 'topNav';
    topNav.innerHTML =
      '<div class="top-nav__logo" onclick="location.href=\'' + prefix + '\'">Joke Lin</div>' +
      '<div class="top-nav__links">' +
        '<a class="top-nav__link" href="' + prefix + '#about">About</a>' +
        '<a class="top-nav__link" href="' + prefix + '#works">Works</a>' +
        '<a class="top-nav__link" href="' + prefix + '#archive">Archive</a>' +
      '</div>' +
      '<a class="top-nav__back" href="' + prefix + '#contact">联系我</a>' +
      '<button class="top-nav__menu-btn" id="menuBtn" aria-label="打开导航" type="button">☰</button>';
    document.body.insertBefore(topNav, document.body.firstChild);
  }

  if (!document.querySelector('style[data-shared-nav]')) {
    var style = document.createElement('style');
    style.setAttribute('data-shared-nav', '');
    style.textContent =
      '.top-nav{position:fixed;top:0;left:0;right:0;z-index:8000;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:max(16px,calc(env(safe-area-inset-top,0px) + 12px)) clamp(18px,4vw,44px) 16px;background:linear-gradient(to bottom,rgba(242,240,236,.96),rgba(242,240,236,.78) 72%,rgba(242,240,236,0));transition:box-shadow .3s var(--ease-out, cubic-bezier(.22,.61,.36,1))}' +
      '.top-nav.scrolled{box-shadow:0 1px 0 var(--border-card),0 8px 24px rgba(13,12,11,.06)}' +
      '.top-nav__logo{flex-shrink:0;color:var(--text-primary);font-family:var(--font-heading);font-size:17px;font-weight:400;letter-spacing:-.02em;cursor:pointer;transition:opacity .2s}' +
      '.top-nav__logo:hover{opacity:.62}' +
      '.top-nav__links{display:flex;align-items:center;gap:clamp(14px,2.8vw,30px);margin-left:auto}' +
      '.top-nav__link{color:var(--text-secondary);font-family:var(--font-body);font-size:13px;text-decoration:none;transition:color .2s}' +
      '.top-nav__link:hover{color:var(--text-primary)}' +
      '.top-nav__back{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 18px;border:1px solid var(--border-card-hover);border-radius:999px;background:var(--text-primary);color:#fff!important;-webkit-text-fill-color:#fff;font-size:13px;text-decoration:none;white-space:nowrap;transition:transform .3s var(--ease-out, cubic-bezier(.22,.61,.36,1)),background .2s}' +
      '.top-nav__back:hover{background:#000;color:#fff!important;transform:translateY(-2px)}' +
      '.top-nav__menu-btn{display:none;width:38px;height:38px;border:1px solid var(--border-card);border-radius:50%;background:rgba(255,255,255,.65);color:var(--text-primary);font-size:19px;cursor:pointer}' +
      '.shared-mobile-nav{position:fixed;top:0;right:0;bottom:0;left:0;z-index:7999;display:none;flex-direction:column;align-items:center;justify-content:center;gap:24px;background:rgba(242,240,236,.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}' +
      '.shared-mobile-nav.open{display:flex}' +
      '.shared-mobile-nav a{color:var(--text-primary);font-size:24px;letter-spacing:-.03em;text-decoration:none}' +
      '.shared-mobile-nav .shared-mobile-close{position:absolute;top:20px;right:20px;width:38px;height:38px;border:1px solid var(--border-card);border-radius:50%;background:transparent;color:var(--text-primary);font-size:18px;cursor:pointer}' +
      '@media(max-width:768px){.top-nav{padding:12px 18px}.top-nav__links{display:none}.top-nav__back{margin-left:auto}.top-nav__menu-btn{display:block}.shared-mobile-nav{display:none}.shared-mobile-nav.open{display:flex}}';
    document.head.appendChild(style);
  }

  if (!document.getElementById('sharedMobileNav')) {
    var mobile = document.createElement('div');
    mobile.className = 'shared-mobile-nav';
    mobile.id = 'sharedMobileNav';
    mobile.innerHTML =
      '<button class="shared-mobile-close" type="button" aria-label="关闭导航">✕</button>' +
      '<a href="' + prefix + '#about">About</a>' +
      '<a href="' + prefix + '#works">Works</a>' +
      '<a href="' + prefix + '#archive">Archive</a>' +
      '<a href="' + prefix + '#contact">Contact</a>';
    document.body.appendChild(mobile);
    mobile.querySelector('.shared-mobile-close').onclick = function() { mobile.classList.remove('open'); };
    mobile.querySelectorAll('a').forEach(function(link) {
      link.onclick = function() { mobile.classList.remove('open'); };
    });
  }

  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('sharedMobileNav');
  if (menuBtn && mobileNav) menuBtn.onclick = function() { mobileNav.classList.add('open'); };

  if (!document.getElementById('scrollTopBtn')) {
    var btn = document.createElement('button');
    btn.className = 'scroll-top';
    btn.id = 'scrollTopBtn';
    btn.title = '返回顶部';
    btn.type = 'button';
    btn.textContent = '↑';
    document.body.appendChild(btn);
  }

  var scrollBtn = document.getElementById('scrollTopBtn');
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var y = window.scrollY;
      if (topNav) topNav.classList.toggle('scrolled', y > 30);
      if (scrollBtn) scrollBtn.classList.toggle('show', y > 420);
      ticking = false;
    });
  }, { passive: true });
  if (scrollBtn) scrollBtn.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };
})();
