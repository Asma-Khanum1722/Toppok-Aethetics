/**
 * TOPPKO AESTHETICS · High-Precision Editorial Motion Engine
 * Lightweight, hardware-accelerated, zero-dependency Awwwards-grade physics.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Top Precision Scroll Progress Bar
    const progressBar = document.getElementById('scrollProgressBar');
    let ticking = false;

    function updateScrollProgress() {
      if (progressBar) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
        progressBar.style.transform = `scaleX(${progress})`;
      }
      ticking = false;
    }

    // 2. Submerging Smart Navbar
    const navWrapper = document.getElementById('smartNavWrapper');
    let lastScrollY = window.scrollY;
    let scrollStopTimer = null;

    function handleNavbarScroll() {
      const currentScrollY = window.scrollY;

      if (navWrapper) {
        // Scrolled glass effect
        if (currentScrollY > 20) {
          navWrapper.classList.add('scrolled');
        } else {
          navWrapper.classList.remove('scrolled');
        }

        // Submerge on scroll down, reveal on scroll up
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          navWrapper.classList.add('nav-hidden');
        } else {
          navWrapper.classList.remove('nav-hidden');
        }

        // When scrolling stops, smoothly glide navbar back in
        clearTimeout(scrollStopTimer);
        scrollStopTimer = setTimeout(() => {
          navWrapper.classList.remove('nav-hidden');
        }, 160);
      }

      lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', () => {
      handleNavbarScroll();
      if (!ticking) {
        requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    }, { passive: true });

    updateScrollProgress();

    // 3. Scroll Reveal Engine (IntersectionObserver)
    const revealElements = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('is-revealed'));
    }

    // 4. Interactive 3D Specimen Card Tilt & Cursor Spotlight
    const cards = document.querySelectorAll('.card-item');
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouch && cards.length > 0) {
      cards.forEach(card => {
        let rafId = null;

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Set CSS custom variables for specular spotlight
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);

          // 3D Perspective Tilt calculation
          const normX = (x / rect.width) * 2 - 1; // -1 to 1
          const normY = (y / rect.height) * 2 - 1; // -1 to 1
          const tiltX = -normY * 4.5;
          const tiltY = normX * 4.5;

          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-6px)`;
          });
        });

        card.addEventListener('mouseleave', () => {
          if (rafId) cancelAnimationFrame(rafId);
          card.style.transform = '';
          card.style.setProperty('--mouse-x', '-500px');
          card.style.setProperty('--mouse-y', '-500px');
        });
      });
    }

    // 5. Hero Interactive Parallax Showcase
    const heroZone = document.querySelector('.hero-zone');
    const heroMediaBox = document.getElementById('heroMediaBox');
    const heroBadge = document.getElementById('heroBadge');

    if (!isTouch && heroZone && heroMediaBox) {
      let heroRaf = null;

      heroZone.addEventListener('mousemove', (e) => {
        const rect = heroZone.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        if (heroRaf) cancelAnimationFrame(heroRaf);
        heroRaf = requestAnimationFrame(() => {
          const img = heroMediaBox.querySelector('img');
          if (img) {
            img.style.transform = `translate3d(${(normX * 8).toFixed(1)}px, ${(normY * 8).toFixed(1)}px, 0) scale(1.02)`;
          }
          if (heroBadge) {
            heroBadge.style.transform = `translate3d(${(-normX * 12).toFixed(1)}px, ${(-normY * 12).toFixed(1)}px, 28px)`;
          }
        });
      });

      heroZone.addEventListener('mouseleave', () => {
        if (heroRaf) cancelAnimationFrame(heroRaf);
        const img = heroMediaBox.querySelector('img');
        if (img) img.style.transform = '';
        if (heroBadge) heroBadge.style.transform = '';
      });
    }

    // 6. Calm Marquee Ribbon: Steady continuous CSS animation with zero scroll-acceleration
    // (Decoupled from scroll physics to ensure a smooth, serene experience)

    // 7. Floating WhatsApp Speed-Dial Toggle
    const trigger = document.getElementById('waTriggerBtn');
    const popup = document.getElementById('waPopupMenu');
    const closeBtn = document.getElementById('waPopupClose');

    if (trigger && popup) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.toggle('show');
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          popup.classList.remove('show');
        });
      }

      document.addEventListener('click', (e) => {
        if (!popup.contains(e.target) && e.target !== trigger) {
          popup.classList.remove('show');
        }
      });
    }
  });
})();

