/* ================================================================
   SCRIPT.JS — Phoebe Pang Portfolio
   包含：自訂鼠標、環境光暈、滾動顯現、視差、
         平滑滾動、導航陰影、卡片磁吸、字母入場、Lightbox
================================================================ */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. 自訂鼠標
  ────────────────────────────────────────────────────────── */
  const cursorDot     = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  let mouseX   = window.innerWidth  / 2;
  let mouseY   = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;

  /* 內點：即時跟隨 */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
    }
  });

  /* 外環：RAF 平滑跟隨 */
  function animateCursorOutline() {
    outlineX += (mouseX - outlineX) * 0.18;
    outlineY += (mouseY - outlineY) * 0.18;
    if (cursorOutline) {
      cursorOutline.style.left = outlineX + 'px';
      cursorOutline.style.top  = outlineY + 'px';
    }
    requestAnimationFrame(animateCursorOutline);
  }
  animateCursorOutline();

  /* Hover 可點擊元素時放大外環 */
  const hoverTargets = document.querySelectorAll('a, button, .project-card, .video-item, .photo-card-v, .ui-card, [data-hover]');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-link'));
  });

  /* 鼠標離開視窗時隱藏 */
  document.addEventListener('mouseleave', () => {
    if (cursorDot)     cursorDot.style.opacity = '0';
    if (cursorOutline) cursorOutline.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    if (cursorDot)     cursorDot.style.opacity = '1';
    if (cursorOutline) cursorOutline.style.opacity = '1';
  });


  /* ────────────────────────────────────────────────────────────
     2. 環境光暈（跟隨鼠標的淡綠色光圈）
  ────────────────────────────────────────────────────────── */
  const glow = document.querySelector('.ambient-glow');
  if (glow) {
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }


  /* ────────────────────────────────────────────────────────────
     3. 滾動顯現動畫（IntersectionObserver）
        HTML 元素加上 data-reveal 屬性即可觸發
        可配合 data-reveal-delay="0.2" 設定延遲（秒）
  ────────────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.revealDelay || '0';
            entry.target.style.setProperty('--reveal-delay', delay + 's');
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target); /* 只觸發一次 */
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => revealObserver.observe(el));
  }


  /* ────────────────────────────────────────────────────────────
     4. 視差滾動（.parallax-item + data-speed 屬性）
  ────────────────────────────────────────────────────────── */
  const parallaxItems = document.querySelectorAll('.parallax-item');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    parallaxItems.forEach(item => {
      const speed  = parseFloat(item.dataset.speed) || 0;
      const offset = scrollY * speed;
      item.style.transform = `translateY(${offset}px)`;
    });
  }, { passive: true });


  /* ────────────────────────────────────────────────────────────
     5. 平滑滾動（點擊 # 錨點連結）
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ────────────────────────────────────────────────────────────
     6. 導航欄：滾動後加深背景
  ────────────────────────────────────────────────────────── */
  const nav = document.querySelector('.glass-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.style.boxShadow = '0 8px 40px rgba(0,0,0,0.07)';
        nav.style.background = 'rgba(255,255,255,0.6)';
      } else {
        nav.style.boxShadow = '0 4px 30px rgba(0,0,0,0.03)';
        nav.style.background = 'rgba(255,255,255,0.4)';
      }
    }, { passive: true });
  }


  /* ────────────────────────────────────────────────────────────
     7. 專案卡片磁吸傾斜效果（透視 3D）
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.project-card').forEach(card => {
    const img = card.querySelector('.project-image');
    if (!img) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const dx   = (e.clientX - rect.left  - rect.width  / 2) / rect.width;
      const dy   = (e.clientY - rect.top   - rect.height / 2) / rect.height;
      img.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      img.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
    });
  });


  /* ────────────────────────────────────────────────────────────
     8. Hero 姓名逐字母入場動畫
  ────────────────────────────────────────────────────────── */
  function splitAndAnimate(el, baseDelay, perCharDelay) {
    if (!el) return;
    const text = el.textContent.trim();
    el.textContent = '';
    el.style.opacity = '1'; /* 覆蓋父元素 fade-up 的 opacity:0 */

    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(20px);
        animation: fade-up-in 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        animation-delay: ${baseDelay + i * perCharDelay}s;
      `;
      el.appendChild(span);
    });
  }

  setTimeout(() => {
    splitAndAnimate(document.querySelector('.hero-name .name-plain'),  0.45, 0.055);
    splitAndAnimate(document.querySelector('.hero-name .name-italic'), 0.72, 0.055);
  }, 50);


  /* ────────────────────────────────────────────────────────────
     9. 貼紙隨機微動動畫
        給所有 .sticker 元素自動套用漂浮效果
        每張貼紙速度和距離都略有不同
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.sticker').forEach((sticker) => {
    const duration = 3 + Math.random() * 3;   /* 每個貼紙 3–6 秒一個循環 */
    const delay    = Math.random() * 2;        /* 0–2 秒起始延遲，讓各貼紙不同步 */
    const distance = 6 + Math.random() * 8;   /* 垂直浮動 6–14px */
    const rotation = -3 + Math.random() * 6;  /* 左右微轉 ±3 度 */

    sticker.style.animation = `sticker-float ${duration}s ${delay}s ease-in-out infinite alternate`;
    sticker.style.setProperty('--float-y',   `-${distance}px`);
    sticker.style.setProperty('--float-rot', `${rotation}deg`);
  });


  /* ────────────────────────────────────────────────────────────
     10. Lightbox（支援圖片 + 影片）
  ────────────────────────────────────────────────────────── */

  /* 開啟圖片 Lightbox（detail 頁面的圖片點擊放大） */
  window.openLightbox = function (imgSrc) {
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (!lightbox) return;

    if (lightboxImg) lightboxImg.src = imgSrc;
    lightbox.style.display       = 'flex';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('cursor-bright');

    if (cursorDot)     cursorDot.style.zIndex     = '10005';
    if (cursorOutline) cursorOutline.style.zIndex = '10005';
  };

  /* 開啟影片 Lightbox（video detail 頁面使用） */
  window.openLightboxVideo = function (videoSrc) {
    const lightbox      = document.getElementById('lightbox');
    const lightboxVideo = document.getElementById('lightbox-video');
    if (!lightbox) return;

    if (lightboxVideo) lightboxVideo.src = videoSrc;
    lightbox.style.display       = 'flex';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('cursor-bright');

    if (cursorDot)     cursorDot.style.zIndex     = '10005';
    if (cursorOutline) cursorOutline.style.zIndex = '10005';
  };

  /* 關閉 Lightbox（圖片 + 影片通用） */
  window.closeLightbox = function () {
    const lightbox      = document.getElementById('lightbox');
    const lightboxImg   = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    if (!lightbox) return;

    lightbox.style.display       = 'none';
    document.body.style.overflow = 'auto';
    document.body.classList.remove('cursor-bright');

    if (lightboxImg)   lightboxImg.src = '';
    if (lightboxVideo) { lightboxVideo.pause(); lightboxVideo.src = ''; }

    /* 恢復鼠標 z-index */
    if (cursorDot)     cursorDot.style.zIndex     = '10002';
    if (cursorOutline) cursorOutline.style.zIndex = '10001';
  };

  /* 點擊背景關閉 */
  document.addEventListener('click', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && e.target === lightbox) closeLightbox();
  });

  /* ESC 鍵關閉 */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

})();
