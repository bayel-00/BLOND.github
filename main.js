'use strict';
(() => {

/* ============================================
   УТИЛИТЫ
   ============================================ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;   // только textContent — никакого innerHTML с данными
  return n;
};
const storage = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* приватный режим */ } }
};
const pad = n => String(n).padStart(2, '0');
const setLock = on => { document.body.style.overflow = on ? 'hidden' : ''; };

/* ============================================
   ДАННЫЕ
   ============================================ */
const UNSPLASH = 'https://images.unsplash.com/';
const photo = (id, w, q = 70) => `${UNSPLASH}${id}?auto=format&fit=crop&w=${w}&q=${q}`;

const masters = {
  anna: {
    name: 'Анна', role: 'Эксперт по сложному блонду',
    text: 'Стаж 8 лет. Специализируется на многоуровневом осветлении, платиновом блонде и восстановлении после неудачного окрашивания. Регулярно проходит обучение у европейских колористов. Умеет слышать клиента и находить именно «тот» оттенок.',
    tags: ['Сложный блонд', 'Платина', 'Аиртач', 'Восстановление'],
    photo: 'photo-1494790108377-be9c29b29330'
  },
  maria: {
    name: 'Мария', role: 'Колорист-технолог',
    text: 'Стаж 6 лет. Эксперт по тонированию и сложным растяжкам цвета. Работает с любыми типами волос, подбирает безопасные протоколы осветления. Каждый оттенок создаёт индивидуально, учитывая подтон кожи и структуру волос.',
    tags: ['Тонирование', 'Растяжка цвета', 'Шатуш', 'Тёплый блонд'],
    photo: 'photo-1438761681033-6461ffad8d80'
  },
  ekaterina: {
    name: 'Екатерина', role: 'Специалист по уходу',
    text: 'Стаж 5 лет. Отвечает за здоровье волос после окрашивания. Ботокс, кератиновое восстановление, СПА-ритуалы — её стихия. Подбирает индивидуальные программы ухода, которые сохраняют блеск и силу волос между визитами.',
    tags: ['Ботокс', 'Кератин', 'СПА-уходы', 'Реконструкция'],
    photo: 'photo-1534528741775-53994a69daeb'
  },
  olga: {
    name: 'Ольга', role: 'Стилист-укладка',
    text: 'Стаж 7 лет. Создаёт укладки, которые подчёркивают цвет и держатся весь день. Вечерние причёски, локоны, гладкость — всё с заботой о структуре волос. Её работы регулярно появляются на обложках петербургских изданий.',
    tags: ['Укладки', 'Вечерние причёски', 'Локоны', 'Стрижки'],
    photo: 'photo-1517841905240-472988babdf9'
  }
};

const SERVICES = [
  'Сложный блонд', 'Аиртач', 'Тонирование', 'Мелирование',
  'Ботокс для волос', 'Кератиновое восстановление', 'Женская стрижка', 'Укладка'
];
const MASTER_NAMES = ['Анна', 'Мария', 'Екатерина', 'Ольга'];

/* ============================================
   АНИМАЦИИ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ
   ============================================ */
const revealEls = $$('.reveal, .reveal-scale, .reveal-left, .reveal-right');
const galleryEls = $$('.masonry-item');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const t = entry.target;
      const delay = parseInt(t.dataset.delay || '0', 10);
      setTimeout(() => t.classList.add('is-visible'), delay);
      revealObserver.unobserve(t);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(e => revealObserver.observe(e));

  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('is-visible'), i * 90);
      galleryObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  galleryEls.forEach(e => galleryObserver.observe(e));
} else {
  [...revealEls, ...galleryEls].forEach(e => e.classList.add('is-visible'));
}

/* ============================================
   ШАПКА ПРИ СКРОЛЛЕ
   ============================================ */
const header = $('#header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ============================================
   ПАРАЛЛАКС (только на десктопе)
   ============================================ */
const parallaxEls = $$('[data-parallax]');
const desktopMQ = window.matchMedia('(min-width: 1101px)');
let ticking = false;
function updateParallax() {
  const vh = window.innerHeight;
  parallaxEls.forEach(e => {
    if (!desktopMQ.matches) { e.style.transform = ''; return; }
    const rect = e.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > vh + 200) return;
    const speed = parseFloat(e.dataset.parallax) || 0.1;
    e.style.transform = `translateY(${(rect.top + rect.height / 2 - vh / 2) * speed}px)`;
  });
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
}, { passive: true });

/* ============================================
   МОБИЛЬНОЕ МЕНЮ
   ============================================ */
const burger = $('#burger');
const mobileMenu = $('#mobileMenu');
burger.addEventListener('click', () => {
  mobileMenu.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
  setLock(true);
});
const closeMenu = () => {
  mobileMenu.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  setLock(false);
};
$('#mobileClose').addEventListener('click', closeMenu);
$$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMenu));

/* ============================================
   КАРТА (подгружается по клику)
   ============================================ */
const MAP_URL = 'https://yandex.ru/map-widget/v1/-/CXfVBLN9';
const mapFacade = $('#mapFacade');
function loadMap() {
  const iframe = document.createElement('iframe');
  iframe.src = MAP_URL;
  iframe.title = 'BLOND на карте';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  // sandbox: сторонний виджет не получает лишних прав
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
  mapFacade.replaceChildren(iframe);
  mapFacade.style.cursor = 'default';
  mapFacade.removeAttribute('role');
  mapFacade.removeAttribute('tabindex');
}
if (mapFacade) {
  mapFacade.addEventListener('click', loadMap, { once: true });
  mapFacade.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadMap(); }
  });
}

/* ============================================
   МОДАЛКА МАСТЕРА
   ============================================ */
const modal = $('#masterModal');
const modalImg = $('#modalImg');
function openMaster(key) {
  const data = masters[key];
  if (!data) return;
  modalImg.src = photo(data.photo, 640, 75);
  modalImg.alt = data.name;
  $('#modalName').textContent = data.name;
  $('#modalRole').textContent = data.role;
  $('#modalText').textContent = data.text;
  $('#modalTags').replaceChildren(...data.tags.map(t => el('span', '', t)));
  modal.classList.add('open');
  setLock(true);
}
$$('.team-card').forEach(card => {
  card.addEventListener('click', () => openMaster(card.dataset.master));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMaster(card.dataset.master); }
  });
});
const closeModal = () => { modal.classList.remove('open'); setLock(false); };
$('#modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
$('#modalBook').addEventListener('click', closeModal);

/* ============================================
   ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ
   ============================================ */
const privacyModal = $('#privacyModal');
$$('.privacy-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    privacyModal.classList.add('open');
    setLock(true);
  });
});
const closePrivacyModal = () => { privacyModal.classList.remove('open'); setLock(false); };
$('#privacyClose').addEventListener('click', closePrivacyModal);
privacyModal.addEventListener('click', e => { if (e.target === privacyModal) closePrivacyModal(); });

/* ============================================
   ЛАЙТБОКС ГАЛЕРЕИ
   ============================================ */
const lightbox = $('#lightbox');
const lightboxImg = $('#lightboxImg');
function bigSrc(src) {
  try {
    const u = new URL(src, location.href);
    if (u.origin + '/' !== UNSPLASH) return src;      // увеличиваем только наши источники
    u.searchParams.set('w', '1400');
    u.searchParams.set('q', '80');
    return u.href;
  } catch { return src; }
}
galleryEls.forEach(item => {
  item.addEventListener('click', () => {
    const img = $('img', item);
    lightboxImg.src = bigSrc(img.currentSrc || img.src);   // большое фото грузим только по клику
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
    setLock(true);
  });
});
const closeLightbox = () => { lightbox.classList.remove('open'); setLock(false); };
$('#lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

/* ============================================
   СЛАЙДЕР ОТЗЫВОВ
   ============================================ */
const slides = $$('.testimonial');
const dots = $$('.dot');
let currentSlide = 0;
let slideTimer;
function showSlide(i) {
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  slides[i].classList.add('active');
  dots[i].classList.add('active');
  currentSlide = i;
}
function startSlider() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => showSlide((currentSlide + 1) % slides.length), 6000);
}
dots.forEach((d, i) => d.addEventListener('click', () => { showSlide(i); startSlider(); }));
if (slides.length) startSlider();

/* ============================================
   ЗАПИСЬ: ДАТА, ВРЕМЯ, СПИСКИ
   Часы работы: 10:00–22:00, последняя запись — 21:00.
   «Сейчас» считается по времени Санкт-Петербурга (Europe/Moscow),
   а не по часам устройства клиента.
   ============================================ */
const SALON_TZ = 'Europe/Moscow';
const OPEN_MIN = 10 * 60;      // 10:00
const LAST_MIN = 21 * 60;      // 21:00 — последняя запись
const STEP_MIN = 30;           // шаг слотов
const MAX_DAYS = 90;           // записаться можно на 90 дней вперёд
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DOW = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

const SLOTS = [];
for (let t = OPEN_MIN; t <= LAST_MIN; t += STEP_MIN) SLOTS.push(t);

const isoDate = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;          // m: 1–12
const fmtTime = t => `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

function salonNow() {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: SALON_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    const g = type => Number(parts.find(p => p.type === type).value);
    return { y: g('year'), m: g('month'), d: g('day'), min: g('hour') * 60 + g('minute') };
  } catch {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate(), min: n.getHours() * 60 + n.getMinutes() };
  }
}
const todayIso = () => { const n = salonNow(); return isoDate(n.y, n.m, n.d); };
function maxIso() {
  const n = salonNow();
  const d = new Date(Date.UTC(n.y, n.m - 1, n.d + MAX_DAYS));
  return isoDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}
/** Слот уже прошёл (или дата в прошлом) */
function isSlotPast(dateStr, slotMin) {
  const n = salonNow();
  const t = isoDate(n.y, n.m, n.d);
  if (dateStr < t) return true;
  return dateStr === t && slotMin <= n.min;
}
/** В этот день ещё есть свободные слоты */
function dayHasSlots(dateStr) {
  const n = salonNow();
  const t = isoDate(n.y, n.m, n.d);
  if (dateStr < t) return false;
  if (dateStr > t) return true;
  return LAST_MIN > n.min;
}

const state = { date: '', time: '' };
const dds = $$('.dd');

function setOpen(dd, open) {
  dd.classList.toggle('open', open);
  $('.dd-btn', dd).setAttribute('aria-expanded', String(open));
}
function closeAll(except) { dds.forEach(d => { if (d !== except) setOpen(d, false); }); }

function setValue(dd, value, label) {
  $('input[type="hidden"]', dd).value = value;
  const v = $('.dd-value', dd);
  if (label) { v.textContent = label; v.classList.remove('is-placeholder'); }
  else { v.textContent = dd.dataset.placeholder || ''; v.classList.add('is-placeholder'); }
  clearError(dd);
}

dds.forEach(dd => {
  const btn = $('.dd-btn', dd);
  btn.addEventListener('click', () => {
    const willOpen = !dd.classList.contains('open');
    closeAll(dd);
    setOpen(dd, willOpen);
    if (willOpen) dd.dispatchEvent(new CustomEvent('dd:open'));
  });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.dd')) closeAll();
});

/* ---------- обычный список (услуга, мастер) ---------- */
function initList(dd, items, defaultValue) {
  const list = el('div', 'dd-list');
  list.setAttribute('role', 'listbox');
  const buttons = items.map(({ value, label }) => {
    const b = el('button', 'dd-opt', label);
    b.type = 'button';
    b.setAttribute('role', 'option');
    b.dataset.value = value;
    b.setAttribute('aria-selected', 'false');
    b.addEventListener('click', () => { select(value, label); setOpen(dd, false); $('.dd-btn', dd).focus(); });
    list.appendChild(b);
    return b;
  });
  $('.dd-panel', dd).appendChild(list);

  function select(value, label) {
    buttons.forEach(b => b.setAttribute('aria-selected', String(b.dataset.value === value)));
    setValue(dd, value, label);
  }
  function reset() {
    const def = items.find(i => i.value === defaultValue);
    buttons.forEach(b => b.setAttribute('aria-selected', 'false'));
    if (def) select(def.value, def.label); else setValue(dd, '', null);
  }
  reset();
  return { reset, items };
}

/* ---------- календарь ---------- */
function initDate(dd, onChange) {
  const panel = $('.dd-panel', dd);
  panel.classList.add('cal');
  let view = null; // { y, m0 }

  function startView() {
    if (state.date) { const [y, m] = state.date.split('-').map(Number); return { y, m0: m - 1 }; }
    const n = salonNow();
    return { y: n.y, m0: n.m - 1 };
  }
  const chevron = dir => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 10 10'); s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.6');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', dir === 'prev' ? 'M7 1L3 5l4 4' : 'M3 1l4 4-4 4');
    s.appendChild(p);
    return s;
  };

  function render() {
    if (!view) view = startView();
    const n = salonNow();
    const today = isoDate(n.y, n.m, n.d);
    const max = maxIso();
    const maxY = Number(max.slice(0, 4)), maxM0 = Number(max.slice(5, 7)) - 1;
    const viewIdx = view.y * 12 + view.m0;

    const head = el('div', 'cal-head');
    const prev = el('button', 'cal-nav'); prev.type = 'button'; prev.setAttribute('aria-label', 'Предыдущий месяц');
    prev.appendChild(chevron('prev'));
    prev.disabled = viewIdx <= n.y * 12 + (n.m - 1);
    prev.addEventListener('click', () => { view.m0--; if (view.m0 < 0) { view.m0 = 11; view.y--; } render(); });
    const next = el('button', 'cal-nav'); next.type = 'button'; next.setAttribute('aria-label', 'Следующий месяц');
    next.appendChild(chevron('next'));
    next.disabled = viewIdx >= maxY * 12 + maxM0;
    next.addEventListener('click', () => { view.m0++; if (view.m0 > 11) { view.m0 = 0; view.y++; } render(); });
    head.append(prev, el('div', 'cal-title', `${MONTHS[view.m0]} ${view.y}`), next);

    const grid = el('div', 'cal-grid');
    DOW.forEach(d => grid.appendChild(el('div', 'cal-dow', d)));
    const offset = (new Date(view.y, view.m0, 1).getDay() + 6) % 7;
    for (let i = 0; i < offset; i++) grid.appendChild(el('span'));
    const daysInMonth = new Date(view.y, view.m0 + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const id = isoDate(view.y, view.m0 + 1, d);
      const b = el('button', 'cal-day', String(d));
      b.type = 'button';
      b.disabled = id > max || !dayHasSlots(id);
      if (id === today) b.classList.add('is-today');
      if (id === state.date) b.classList.add('is-selected');
      b.addEventListener('click', () => {
        state.date = id;
        const [yy, mm, dd2] = id.split('-').map(Number);
        const label = new Date(yy, mm - 1, dd2).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
        setValue(dd, id, label);
        setOpen(dd, false);
        $('.dd-btn', dd).focus();
        onChange();
      });
      grid.appendChild(b);
    }
    panel.replaceChildren(head, grid);
  }

  dd.addEventListener('dd:open', () => { view = startView(); render(); });
  return {
    render,
    clear() { state.date = ''; view = null; setValue(dd, '', null); }
  };
}

/* ---------- время (сетка слотов) ---------- */
function initTime(dd) {
  const panel = $('.dd-panel', dd);
  const btn = $('.dd-btn', dd);
  panel.classList.add('slots');

  function render() {
    const grid = el('div', 'slot-grid');
    let free = 0;
    SLOTS.forEach(t => {
      const b = el('button', 'slot', fmtTime(t));
      b.type = 'button';
      const past = !state.date || isSlotPast(state.date, t);
      b.disabled = past;
      if (!past) free++;
      if (state.time && toMin(state.time) === t) b.classList.add('is-selected');
      b.addEventListener('click', () => {
        if (isSlotPast(state.date, t)) { render(); return; }   // слот успел «устареть»
        state.time = fmtTime(t);
        setValue(dd, state.time, state.time);
        setOpen(dd, false);
        btn.focus();
      });
      grid.appendChild(b);
    });
    const hint = el('p', 'slot-hint',
      free ? 'Запись с 10:00 до 21:00. Прошедшее время недоступно.' : 'На выбранный день свободного времени не осталось.');
    panel.replaceChildren(grid, hint);
  }

  function refresh() {
    dd.dataset.placeholder = state.date ? 'Выберите время' : 'Сначала выберите дату';
    btn.disabled = !state.date;
    if (state.time && (!state.date || isSlotPast(state.date, toMin(state.time)))) state.time = '';
    if (!state.time) setValue(dd, '', null);
  }
  dd.addEventListener('dd:open', render);
  return {
    render, refresh,
    clear() { state.time = ''; refresh(); }
  };
}

/* ---------- сборка ---------- */
const ddService = $('#ddService');
const ddMaster  = $('#ddMaster');
const ddDate    = $('#ddDate');
const ddTime    = $('#ddTime');

const servicePicker = initList(ddService, SERVICES.map(s => ({ value: s, label: s })), null);
const masterPicker  = initList(ddMaster, [{ value: '', label: 'Любой мастер' }, ...MASTER_NAMES.map(m => ({ value: m, label: m }))], '');
const timePicker    = initTime(ddTime);
const datePicker    = initDate(ddDate, () => timePicker.clear());
timePicker.refresh();

/** Сбрасывает выбор, если он успел устареть (например, форма долго была открыта) */
function sanitizeSelection() {
  if (state.date && !dayHasSlots(state.date)) { datePicker.clear(); }
  timePicker.refresh();
}
setInterval(() => {
  sanitizeSelection();
  if (ddTime.classList.contains('open')) timePicker.render();
  if (ddDate.classList.contains('open')) datePicker.render();
}, 30000);

/* ============================================
   ФОРМА ЗАПИСИ: валидация и защита
   ============================================ */
const form = $('#bookingForm');
const formError = $('#formError');
const nameInput = $('input[name="name"]', form);
const phoneInput = $('input[name="phone"]', form);
const consentInput = $('#privacyCheck');
const honeypot = $('input[name="website"]', form);

function fieldOf(node) { return node.closest('.form-field'); }
function setError(node, msg) {
  const f = fieldOf(node);
  f.classList.add('has-error');
  $('.field-error', f).textContent = msg;
}
function clearError(node) {
  const f = fieldOf(node);
  if (!f) return;
  f.classList.remove('has-error');
  const p = $('.field-error', f);
  if (p) p.textContent = '';
}
function showFormError(msg) {
  formError.textContent = msg;
  formError.classList.toggle('show', Boolean(msg));
}
[nameInput, phoneInput].forEach(i => i.addEventListener('input', () => { clearError(i); showFormError(''); }));
consentInput.addEventListener('change', () => clearError(consentInput));

phoneInput.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.startsWith('8')) v = '7' + v.slice(1);
  if (v && !v.startsWith('7')) v = '7' + v;
  v = v.slice(0, 11);
  if (!v) { e.target.value = ''; return; }
  let out = '+7';
  if (v.length > 1) out += ' (' + v.slice(1, 4);
  if (v.length >= 5) out += ') ' + v.slice(4, 7);
  if (v.length >= 8) out += '-' + v.slice(7, 9);
  if (v.length >= 10) out += '-' + v.slice(9, 11);
  e.target.value = out;
});

let touchedAt = 0;                       // когда человек начал заполнять форму
form.addEventListener('focusin', () => { if (!touchedAt) touchedAt = Date.now(); });

const RATE_LIMIT_MS = 60 * 1000;         // не чаще одной заявки в минуту с одного браузера
const NAME_RE = /^[\p{L}][\p{L}\s'’.-]{1,59}$/u;

function resetForm() {
  form.reset();
  state.date = ''; state.time = '';
  servicePicker.reset(); masterPicker.reset();
  setValue(ddDate, '', null);
  timePicker.refresh();
  $$('.form-field', form).forEach(f => { f.classList.remove('has-error'); $('.field-error', f).textContent = ''; });
  showFormError('');
  touchedAt = 0;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  showFormError('');
  sanitizeSelection();

  const name = nameInput.value.replace(/\s+/g, ' ').trim();
  const phoneDigits = phoneInput.value.replace(/\D/g, '');
  const service = $('input[name="service"]', form).value;
  const master = $('input[name="master"]', form).value;
  const errors = [];
  const fail = (node, msg) => { setError(node, msg); errors.push(node); };

  // Сначала сбрасываем старые ошибки
  [nameInput, phoneInput, ddService, ddMaster, ddDate, ddTime, consentInput].forEach(clearError);

  // Обязателен только телефон; остальные поля проверяем, только если они заполнены
  if (name && !NAME_RE.test(name)) fail(nameInput, 'Имя: только буквы, от 2 символов');
  if (phoneDigits.length !== 11) fail(phoneInput, 'Введите номер полностью: +7 (XXX) XXX-XX-XX');
  // Значения проверяем по белому списку — подмена в DevTools не пройдёт
  if (service && !SERVICES.includes(service)) fail(ddService, 'Выберите услугу из списка');
  if (master !== '' && !MASTER_NAMES.includes(master)) fail(ddMaster, 'Выберите мастера из списка');

  if (state.date && !dayHasSlots(state.date)) {
    fail(ddDate, 'Эта дата уже недоступна — выберите другую');
  } else if (state.time) {
    const t = toMin(state.time);
    if (t < OPEN_MIN || t > LAST_MIN) fail(ddTime, 'Запись возможна с 10:00 до 21:00');
    else if (isSlotPast(state.date, t)) fail(ddTime, 'Это время уже прошло — выберите другое');
  }
  if (!consentInput.checked) fail(consentInput, 'Необходимо согласие на обработку данных');

  if (errors.length) {
    const first = errors[0];
    const focusTarget = first.matches('input') ? first : $('.dd-btn', first);
    if (focusTarget && !focusTarget.disabled) focusTarget.focus();
    return;
  }

  // --- Защита от ботов и спама ---
  if (honeypot.value) {                                 // бот заполнил скрытое поле — делаем вид, что всё хорошо
    showSuccess();
    return;
  }
  if (touchedAt && Date.now() - touchedAt < 2000) {     // человек не заполнит форму быстрее 2 секунд
    showFormError('Пожалуйста, повторите отправку.');
    return;
  }
  const last = Number(storage.get('lastBooking') || 0);
  if (Date.now() - last < RATE_LIMIT_MS) {
    showFormError('Заявка уже отправлена. Повторите, пожалуйста, через минуту.');
    return;
  }

  const payload = {
    phone: '+' + phoneDigits,          // единственное обязательное поле — перезвоним для консультации
    name, service, master,             // могут быть пустыми
    date: state.date, time: state.time
  };
  // TODO: здесь отправка на ваш сервер/бота, например:
  // fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  // Сервер обязан заново проверить все поля и время — проверкам в браузере доверять нельзя.
  void payload;

  storage.set('lastBooking', String(Date.now()));
  showSuccess();
});

function showSuccess() {
  closeAll();
  form.classList.add('submitted');
  setTimeout(() => {
    form.classList.remove('submitted');
    resetForm();
  }, 5000);
}

/* ============================================
   COOKIE BANNER
   ============================================ */
const cookieBanner = $('#cookieBanner');
if (!storage.get('cookieConsent')) {
  setTimeout(() => cookieBanner.classList.add('show'), 1500);
}
$('#cookieAccept').addEventListener('click', () => {
  storage.set('cookieConsent', 'true');
  cookieBanner.classList.remove('show');
});

/* ============================================
   ПЛАВНЫЙ СКРОЛЛ К ЯКОРЯМ
   ============================================ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.getElementById(href.slice(1));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ============================================
   ГОД В ФУТЕРЕ + ESC
   ============================================ */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeAll();
  closeModal();
  closeLightbox();
  closeMenu();
  closePrivacyModal();
});

})();
