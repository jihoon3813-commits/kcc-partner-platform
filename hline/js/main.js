/* ================================================
   HomeCC H-LINE Landing Page - Main JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. Scroll Fade-up Animation ---- */
  const fadeElements = document.querySelectorAll('.fade-up');
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  fadeElements.forEach(el => observer.observe(el));


  /* ---- 2. Counter Animation ---- */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const startVal = 0;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => {
    counterObserver.observe(el);
  });


  /* ---- 3. CTA Button Actions ---- */
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 2500);
  }

  // 전화 버튼 클릭
  document.querySelectorAll('[data-action="call"]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'tel:18778204';
    });
  });

  // 상담 버튼 클릭 → smooth scroll to final CTA
  document.querySelectorAll('[data-action="consult"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector('#section-final-cta');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        showToast('📋 상담 신청 폼으로 이동합니다');
      }
    });
  });


  /* ---- 4. Sticky Nav shadow on scroll ---- */
  const nav = document.querySelector('.top-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.style.boxShadow = '0 2px 16px rgba(0,0,0,0.1)';
    } else {
      nav.style.boxShadow = 'none';
    }
  }, { passive: true });


  /* ---- 5. Spec Cards stagger ---- */
  const specCards = document.querySelectorAll('.spec-card');
  specCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.12}s`;
  });


  /* ---- 6. Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ---- 7. Comparison table row highlight ---- */
  const compareRows = document.querySelectorAll('.compare-table__row');
  compareRows.forEach(row => {
    row.addEventListener('touchstart', () => {
      row.style.background = 'rgba(201,169,122,0.07)';
    }, { passive: true });
    row.addEventListener('touchend', () => {
      setTimeout(() => {
        row.style.background = '';
      }, 200);
    }, { passive: true });
  });


  /* ---- 8. Parallax-lite for hero ---- */
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          if (scrolled < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  /* ---- 9. Floating CTA Bar hide/show ---- */
  const floatingCta = document.querySelector('.floating-cta');
  if (floatingCta) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current < 200) {
        // 히어로 영역에선 숨김
        floatingCta.style.transform = 'translateX(-50%) translateY(100%)';
        floatingCta.style.opacity = '0';
      } else {
        floatingCta.style.transform = 'translateX(-50%) translateY(0)';
        floatingCta.style.opacity = '1';
      }
      lastScroll = current;
    }, { passive: true });

    floatingCta.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    floatingCta.style.transform = 'translateX(-50%) translateY(100%)';
    floatingCta.style.opacity = '0';
  }

  console.log('🏠 HomeCC H-LINE Landing Page Initialized');
});
