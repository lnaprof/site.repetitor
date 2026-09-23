/* ============================================================
   Лендинг репетитора — скрипты
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  document.documentElement.classList.remove('loading');
  initHeader();
  initBurger();
  initReveal();
  initCarousel();
  initFaq();
  initStickyCta();
});

/* ---------- Шапка: тень при скролле ---------- */
function initHeader() {
  var header = document.querySelector('.header');
  var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Бургер-меню ---------- */
function initBurger() {
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Появление блоков при скролле (fade-in + slide-up) ---------- */
function initReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (el, i) {
    if (i % 3 === 1) el.classList.add('delayed-1');
    if (i % 3 === 2) el.classList.add('delayed-2');
    observer.observe(el);
  });
}

/* ---------- Карусель отзывов ---------- */
function initCarousel() {
  var track = document.getElementById('reviewsTrack');
  var prev = document.getElementById('reviewsPrev');
  var next = document.getElementById('reviewsNext');
  var dotsWrap = document.getElementById('reviewsDots');
  if (!track || !prev || !next || !dotsWrap) return;

  var cards = track.children;
  var index = 0;
  var perView = 1;
  var dots = [];

  function calcPerView() {
    var w = window.innerWidth;
    if (w >= 1100) return 3;
    if (w >= 720) return 2;
    return 1;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    dots = [];
    var count = Math.max(1, cards.length - perView + 1);
    for (var i = 0; i < count; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'reviews__dot' + (i === index ? ' active' : '');
      dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      dot.addEventListener('click', function () {
        index = parseInt(this.dataset.index, 10);
        update();
      });
      dot.dataset.index = String(i);
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
  }

  function update() {
    var max = dots.length - 1;
    if (index < 0) index = max;
    if (index > max) index = 0;
    track.style.setProperty('--i', index);
    dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
  }

  function rebuild() {
    perView = calcPerView();
    track.style.setProperty('--per-view', perView);
    index = Math.min(index, Math.max(0, cards.length - perView));
    index = Math.max(0, index);
    buildDots();
    update();
  }

  prev.addEventListener('click', function () { index--; update(); });
  next.addEventListener('click', function () { index++; update(); });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuild, 150);
  });

  // Свайп для мобильных
  var startX = null;
  track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 48) {
      if (dx < 0) { index++; } else { index--; }
      update();
    }
    startX = null;
  }, { passive: true });

  // Автопрокрутка раз в 6 секунд (ставим на паузу при наведении)
  var autoTimer = setInterval(function () {
    if (document.hidden) return;
    index++;
    update();
  }, 6000);

  var carousel = document.getElementById('reviewsCarousel');
  carousel.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
  carousel.addEventListener('mouseleave', function () {
    clearInterval(autoTimer);
    autoTimer = setInterval(function () { index++; update(); }, 6000);
  });

  rebuild();
}

/* ---------- FAQ: закрываем остальные пункты ---------- */
function initFaq() {
  var items = document.querySelectorAll('.faq__item');
  items.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        items.forEach(function (other) {
          if (other !== item) other.removeAttribute('open');
        });
      }
    });
  });
}

/* ---------- Sticky CTA (мобильные) ---------- */
function initStickyCta() {
  var sticky = document.getElementById('stickyCta');
  var form = document.getElementById('form');
  if (!sticky || !form) return;

  var hero = document.getElementById('hero');

  function onScroll() {
    if (window.innerWidth < 721) {
      var heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
      var formTop = form.offsetTop;

      var pastHero = window.scrollY > heroBottom - 120;
      var atForm = window.scrollY > formTop - window.innerHeight * 0.75;

      sticky.classList.toggle('show', pastHero && !atForm);
      document.body.classList.toggle('form-visible', atForm);
    } else {
      sticky.classList.remove('show');
      document.body.classList.remove('form-visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}

/* ---------- Форма записи ----------
   Сбор заявок вынесен в Яндекс Форму (см. index.html, блок #form).
   Форма Яндекса автоматически пишет ответы в подключённую Яндекс Таблицу,
   поэтому отдельный JS для отправки не нужен.
   ---------- */