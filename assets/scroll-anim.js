/* ================================================================
   滚动淡入动效 — assets/scroll-anim.js
   支持多种入场动画类型，自动分组交错延迟
   动态内容页面可调用 window.initScrollAnims() 重新绑定
   ================================================================ */
;(function() {
  'use strict';

  var ANIM_CLASSES = [
    'fade-in-up', 'fade-in-left', 'fade-in-right',
    'scale-in', 'blur-in', 'rotate-in', 'flip-in', 'draw-in'
  ];
  var SELECTOR = ANIM_CLASSES.map(function(c) { return '.' + c + ':not(.visible)'; }).join(', ');

  function observe(elements) {
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function(el) { el.classList.add('visible'); });
      return;
    }

    /* 按 section 分组，同组内交错延迟 */
    var groups = [];
    var groupMap = new Map();
    elements.forEach(function(el) {
      var section = el.closest('section') || el.parentElement;
      if (!groupMap.has(section)) {
        var g = { section: section, items: [] };
        groupMap.set(section, g);
        groups.push(g);
      }
      groupMap.get(section).items.push(el);
    });
    groups.forEach(function(g) {
      g.items.forEach(function(el, i) {
        if (!el.getAttribute('data-delay')) {
          el.setAttribute('data-delay', Math.min(i * 80, 480));
        }
      });
    });

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-delay')) || 0;
          setTimeout(function() { el.classList.add('visible'); }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function(el) { observer.observe(el); });
  }

  window.initScrollAnims = function() {
    var els = document.querySelectorAll(SELECTOR);
    if (els.length) observe(els);
  };

  /* 页面加载后自动初始化 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initScrollAnims);
  } else {
    window.initScrollAnims();
  }
})();
