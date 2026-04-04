/* ========================================
   KCC HomeCC 이지바스 - Main JavaScript
   ======================================== */

// ---- 현재 슬라이드 인덱스 ----
let currentSlide = 0;
const totalSlides = 5;

// ---- DOM 로드 완료 후 초기화 ----
document.addEventListener('DOMContentLoaded', function () {
  initHeader();
  initFixedCTA();
  initScrollReveal();
  initCounterAnimation();
  // initComparisionTableFix(); // HTML에서 직접 구조 적용
  autoSlide();
});

/* ========================================
   헤더 스크롤 효과
   ======================================== */
function initHeader() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ========================================
   하단 고정 CTA 표시/숨김
   ======================================== */
function initFixedCTA() {
  const fixedCta = document.getElementById('fixedCta');
  const hero = document.getElementById('hero');
  const formSection = document.getElementById('consultForm');

  window.addEventListener('scroll', function () {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const formTop = formSection.getBoundingClientRect().top;
    const windowH = window.innerHeight;

    // 히어로 섹션 지나면 보이기, 폼 섹션 진입 시 숨기기
    if (heroBottom < 0 && formTop > windowH) {
      fixedCta.classList.add('show');
    } else {
      fixedCta.classList.remove('show');
    }
  }, { passive: true });
}

/* ========================================
   스크롤 이동 함수들
   ======================================== */
function scrollToForm() {
  const form = document.getElementById('consultForm');
  if (form) {
    const offset = form.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

function scrollToCase() {
  const caseSection = document.getElementById('case');
  if (caseSection) {
    const offset = caseSection.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

/* ========================================
   스크롤 등장 애니메이션
   ======================================== */
function initScrollReveal() {
  const sections = document.querySelectorAll('section');
  const revealTargets = [];

  sections.forEach(section => {
    // 섹션 내 주요 요소에 reveal 클래스 부여
    const cards = section.querySelectorAll(
      '.problem-card, .solution-point, .ba-tag, .stat-item, .faq-item, .material-detail, .process-section'
    );
    cards.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 80}ms`;
      revealTargets.push(el);
    });
  });

  // IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => observer.observe(el));
}

/* ========================================
   숫자 카운터 애니메이션
   ======================================== */
function initCounterAnimation() {
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  if (!statNums.length) return;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => counterObserver.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    el.textContent = Math.round(eased * target);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

/* ========================================
   베네핏 슬라이더
   ======================================== */
function slideBenefit(direction) {
  const newIndex = (currentSlide + direction + totalSlides) % totalSlides;
  goToSlide(newIndex);
}

function goToSlide(index) {
  const cards = document.querySelectorAll('.benefit-card');
  const dots = document.querySelectorAll('.dot');

  // 이전 카드 숨기기
  cards[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  // 새 카드 보이기
  currentSlide = index;
  cards[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');

  // 버튼 상태 업데이트
  updateSliderBtns();
}

function updateSliderBtns() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (prevBtn) prevBtn.disabled = false;
  if (nextBtn) nextBtn.disabled = false;
}

// 자동 슬라이드
function autoSlide() {
  setInterval(() => {
    slideBenefit(1);
  }, 4000);
}

// 터치 스와이프 지원
let touchStartX = 0;
let touchStartY = 0;

const slider = document.getElementById('benefitsSlider');
if (slider) {
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) slideBenefit(1);
      else slideBenefit(-1);
    }
  }, { passive: true });
}

/* ========================================
   FAQ 토글
   ======================================== */
function toggleFaq(btn) {
  const item = btn.parentElement;
  const answer = item.querySelector('.faq-answer');
  const isOpen = btn.classList.contains('open');

  // 다른 FAQ 닫기
  document.querySelectorAll('.faq-question.open').forEach(q => {
    if (q !== btn) {
      q.classList.remove('open');
      q.parentElement.querySelector('.faq-answer').classList.remove('open');
    }
  });

  // 현재 FAQ 토글
  if (isOpen) {
    btn.classList.remove('open');
    answer.classList.remove('open');
  } else {
    btn.classList.add('open');
    answer.classList.add('open');
  }
}

/* ========================================
   폼 단계 전환
   ======================================== */
function nextStep() {
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');

  // 유효성 검사
  const name = document.getElementById('userName').value.trim();
  const phone = document.getElementById('userPhone').value.trim();
  const region = document.getElementById('userRegion').value;

  if (!name) {
    shakeField('userName', '이름을 입력해주세요');
    return;
  }

  if (!phone || !isValidPhone(phone)) {
    shakeField('userPhone', '올바른 연락처를 입력해주세요 (예: 010-1234-5678)');
    return;
  }

  if (!region) {
    shakeField('userRegion', '지역을 선택해주세요');
    return;
  }

  step1.classList.add('hidden');
  step2.classList.remove('hidden');
}

function prevStep() {
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  step2.classList.add('hidden');
  step1.classList.remove('hidden');
}

function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^01[016789]\d{7,8}$/.test(cleaned);
}

function shakeField(fieldId, msg) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  // 기존 에러 메시지 제거
  const existingErr = field.parentElement.querySelector('.field-error');
  if (existingErr) existingErr.remove();

  // 에러 메시지 추가
  const err = document.createElement('p');
  err.className = 'field-error';
  err.style.cssText = 'color: #d32f2f; font-size: 12px; margin-top: 4px; font-weight: 500;';
  err.textContent = msg;
  field.parentElement.appendChild(err);

  // 쉐이크 애니메이션
  field.style.animation = 'shake 0.4s ease';
  field.style.borderColor = '#d32f2f';
  setTimeout(() => {
    field.style.animation = '';
    field.style.borderColor = '';
  }, 400);

  field.focus();
}

// 필드 포커스 시 에러 제거
document.addEventListener('DOMContentLoaded', () => {
  ['userName', 'userPhone', 'userRegion'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('focus', () => {
        const err = el.parentElement.querySelector('.field-error');
        if (err) err.remove();
        el.style.borderColor = '';
      });
    }
  });
});

/* ========================================
   폼 제출
   ======================================== */
function submitForm(event) {
  event.preventDefault();

  const formEl = document.getElementById('consultFormEl');
  const successMsg = document.getElementById('successMsg');

  // 간단한 로딩 상태
  const submitBtn = formEl.querySelector('.submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 신청 중...';
  submitBtn.disabled = true;

  // 시뮬레이션 (실제 서버 연동 시 fetch로 대체)
  setTimeout(() => {
    formEl.classList.add('hidden');
    successMsg.classList.remove('hidden');

    // 스크롤
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 하단 CTA 숨기기
    document.getElementById('fixedCta').classList.remove('show');
  }, 1200);
}

/* ========================================
   비교표 DOM 수정 (HTML 레이아웃 보완)
   ======================================== */
function initComparisionTableFix() {
  // 기존 compare-row를 재구성
  const rows = document.querySelectorAll('.compare-row');
  rows.forEach(row => {
    const label = row.querySelector('.cr-label');
    const oldCell = row.querySelector('.cr-old');
    const newCell = row.querySelector('.cr-new');

    if (!label || !oldCell || !newCell) return;

    // 기존 자식 제거 후 재구성
    row.innerHTML = '';
    const labelClone = label.cloneNode(true);

    const body = document.createElement('div');
    body.className = 'cr-row-body';

    const oldClone = oldCell.cloneNode(true);
    const newClone = newCell.cloneNode(true);
    const div = document.createElement('div');
    div.className = 'cr-divider';

    body.appendChild(oldClone);
    body.appendChild(div);
    body.appendChild(newClone);

    row.appendChild(labelClone);
    row.appendChild(body);
  });
}

/* ========================================
   CSS 동적 추가 (쉐이크 애니메이션)
   ======================================== */
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }

    .cr-row-body {
      display: grid;
      grid-template-columns: 1fr 4px 1fr;
    }

    .cr-row-body .cr-divider {
      background: #e9ecef;
    }

    .cr-row-body .cr-old,
    .cr-row-body .cr-new {
      padding: 14px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.4;
    }

    .cr-row-body .cr-old {
      color: #d32f2f;
      background: rgba(211,47,47,0.04);
    }

    .cr-row-body .cr-new {
      color: #2e7d32;
      background: rgba(46,125,50,0.05);
    }

    .cr-row-body .cr-old i,
    .cr-row-body .cr-new i {
      flex-shrink: 0;
      font-size: 14px;
    }

    /* 베네핏 카드 스와이프 힌트 */
    @keyframes swipeHint {
      0%, 100% { opacity: 0.4; transform: translateX(0); }
      50% { opacity: 0.8; transform: translateX(4px); }
    }

    .benefits-slider::after {
      content: '← 스와이프 →';
      display: block;
      text-align: center;
      font-size: 11px;
      color: #adb5bd;
      margin-top: 8px;
      animation: swipeHint 2s ease infinite;
    }

    /* 폰 번호 자동 포매팅 표시 */
    #userPhone::placeholder { color: #adb5bd; }

    /* 체크박스 체크 시 스타일 */
    .check-item input[type="checkbox"] {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    /* 히어로 배경 애니메이션 */
    @keyframes subtlePulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .hero-badge {
      animation: subtlePulse 3s ease infinite;
    }

    /* before/after 라벨 글로우 */
    .after-label {
      animation: glowGreen 2s ease infinite;
    }

    @keyframes glowGreen {
      0%, 100% { box-shadow: 0 0 0 0 rgba(46,125,50,0.2); }
      50% { box-shadow: 0 0 8px 3px rgba(46,125,50,0.2); }
    }

    /* 통계 숫자 강조 */
    .stat-num, .stat-unit {
      background: linear-gradient(135deg, #1a3a6e, #2d5aa0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* 고정 CTA 펄스 */
    .fixed-cta-btn {
      animation: ctaPulse 2.5s ease infinite;
    }

    @keyframes ctaPulse {
      0%, 100% { box-shadow: 0 8px 30px rgba(232,119,34,0.55); }
      50% { box-shadow: 0 8px 40px rgba(232,119,34,0.75), 0 0 0 4px rgba(232,119,34,0.15); }
    }

    /* 폼 입력 필드 포커스 효과 */
    .form-group input:focus,
    .form-group select:focus {
      transform: translateY(-1px);
    }

    /* 섹션 전환 */
    section {
      transition: background 0.3s;
    }

    /* 프로그레스 표시 */
    .form-step .step-title::after {
      content: '';
      flex: 1;
      height: 2px;
      background: #e9ecef;
      border-radius: 1px;
    }

    #step1 .step-title::before { content: '1/2 단계'; font-size: 11px; color: #adb5bd; font-weight: 400; }
    #step2 .step-title::before { content: '2/2 단계'; font-size: 11px; color: #adb5bd; font-weight: 400; }

    /* 베네핏 카드 호버 효과 */
    .benefit-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .benefit-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 50px rgba(0,0,0,0.2);
    }
  `;
  document.head.appendChild(style);
})();

/* ========================================
   전화번호 자동 포맷
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('userPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      let value = this.value.replace(/\D/g, '');
      if (value.length <= 3) {
        this.value = value;
      } else if (value.length <= 7) {
        this.value = value.slice(0, 3) + '-' + value.slice(3);
      } else if (value.length <= 11) {
        this.value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
      }
    });
  }
});

/* ========================================
   부드러운 앵커 스크롤
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
});

/* ========================================
   페이지 로드 진행 표시
   ======================================== */
(function () {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px; width: 0%;
    background: linear-gradient(90deg, #e87722, #f59340);
    z-index: 9999; transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(232,119,34,0.6);
  `;
  document.body.appendChild(bar);

  let scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const scrollPct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        bar.style.width = Math.min(scrollPct, 100) + '%';
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
})();
