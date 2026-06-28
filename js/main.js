/* ============================================================
   TechSnap — main.js  v3.0
   Pinned Hero + Scroll Overlay via GSAP ScrollTrigger + Lenis
   ============================================================ */
(function () {
  'use strict';

  /* ------ Mobile menu ------ */
  const toggle    = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
  }

  /* ------ Header frosted on scroll ------ */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------ Category filter ------ */
  const catBtns = document.querySelectorAll('.cat-btn');
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.article-card').forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.style.display = show ? '' : 'none';
        if (show && !card.classList.contains('visible')) {
          requestAnimationFrame(() => card.classList.add('visible'));
        }
      });
    });
  });

  /* ------ IntersectionObserver fallback for cards ------ */
  function initCardFadeIn() {
    const cards = document.querySelectorAll('.article-card');
    if (!cards.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Array.from(cards).indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('visible'), (idx % 3) * 90);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    cards.forEach(c => io.observe(c));
  }

  /* ------ Main GSAP init ------ */
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      initCardFadeIn();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* === Lenis === */
    let lenis = null;
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    /* ===================================================
       HERO PIN — image fades/scales as content rises
       trigger: hero-pin-wrap (200vh)
       =================================================== */
    const heroEl    = document.querySelector('.hero');
    const heroImg   = document.querySelector('.hero-image-wrap');
    const heroText  = document.querySelector('.hero-text-overlay');
    const heroHint  = document.querySelector('.hero-scroll-hint');
    const contentSec = document.querySelector('.content-section');

    /* -------------------------------------------------------
       Hero をGSAPでpin（position:fixed相当）
       heroはCSSでposition:fixedなので、
       GSAPのpinはcontent-sectionが通り過ぎるまでの間
       Heroアニメーションを制御するためだけに使う
       ------------------------------------------------------- */

    /* Hero画像: スクロールに合わせてごく静かに変化 */
    if (heroImg && contentSec) {
      gsap.to(heroImg, {
        scale: 0.98,
        opacity: 0.9,
        filter: 'blur(2px)',
        ease: 'none',
        scrollTrigger: {
          trigger: contentSec,
          start: 'top bottom',   /* content-sectionが画面下端に入り始めたとき */
          end: 'top top',        /* content-sectionが画面上端に揃ったとき */
          scrub: 1.4,
        }
      });
    }

    /* Hero タイトル: opacity 1→0.3 */
    if (heroText && contentSec) {
      gsap.to(heroText, {
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: contentSec,
          start: 'top bottom',
          end: 'top 60%',
          scrub: 1.0,
        }
      });
    }

    /* Scrollヒント: すぐに消える */
    if (heroHint) {
      gsap.to(heroHint, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: '100px top',
          end: '300px top',
          scrub: 0.5,
        }
      });
    }

    /* -------------------------------------------------------
       Story Transition: content-sectionがせり上がる
       - CSSのmargin-top:100vhでHeroの下に通常フローで配置
       - GSAPがtranslateY(80vh→0)でHeroの上にせり上がる
       - scrub連動で「自然に生まれる」感覚を作る
       - Heroは背景に残り続ける（position:fixed）
       ------------------------------------------------------- */
    if (contentSec) {
      gsap.fromTo(contentSec,
        { y: '80vh' },
        {
          y: '0vh',
          ease: 'none',
          scrollTrigger: {
            trigger: contentSec,
            start: 'top bottom',   /* content-sectionの上端が画面下端に入った瞬間 */
            end: 'top top',        /* content-sectionの上端が画面上端に達した時点 */
            scrub: 1.2,
          }
        }
      );
    }

    /* === Article cards stagger === */
    const cards = gsap.utils.toArray('.article-card');
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0,
          duration: 0.65, ease: 'power2.out',
          delay: (i % 3) * 0.08,
          scrollTrigger: {
            trigger: card,
            start: 'top 91%',
            toggleActions: 'play none none none',
            once: true,
          },
          onStart: () => card.classList.add('visible'),
        }
      );
    });

    /* === Section titles === */
    gsap.utils.toArray('.section-title').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 18 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });

    /* === Ranking items === */
    gsap.utils.toArray('.rank-item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, x: -18 },
        {
          opacity: 1, x: 0, duration: 0.5, ease: 'power2.out',
          delay: i * 0.07,
          scrollTrigger: { trigger: item, start: 'top 90%', once: true }
        }
      );
    });
  }

  /* ------ Init ------ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.addEventListener('load', initScrollAnimations);
    });
  } else {
    window.addEventListener('load', initScrollAnimations);
  }

})();
