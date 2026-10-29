// Utilitaires communs : copie dans le presse-papiers, mode overlay OBS, bandeau cookies.
(function () {
  window.copyText = async function (text, statusEl) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    if (statusEl) {
      statusEl.textContent = 'Copié !';
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
    }
  };

  if (new URLSearchParams(location.search).get('overlay') === '1') {
    document.body.classList.add('overlay');
  }

  // --- Consentement cookies : refuser aussi simple qu'accepter. ---
  // Aucun traceur n'est chargé sans accord. Ajoutez ici le script de stats / AdSense dans loadTrackers().
  const KEY = 'consent-v1';
  const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const set = (v) => { try { localStorage.setItem(KEY, v); } catch (e) { /* ignoré */ } };

  function loadTrackers() {
    // Exemple Umami :
    // const s = document.createElement('script');
    // s.defer = true; s.src = 'https://cloud.umami.is/script.js'; s.dataset.websiteId = 'VOTRE_ID';
    // document.head.appendChild(s);
  }

  function showBanner() {
    if (document.getElementById('cookie-banner') || document.body.classList.contains('overlay')) return;
    const b = document.createElement('div');
    b.id = 'cookie-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookies');
    b.innerHTML = '<div class="inner"><p>Nous utilisons des cookies de mesure d’audience et de publicité uniquement avec votre accord. Voir la <a href="/confidentialite/">politique de confidentialité</a>.</p>'
      + '<div class="actions"><button type="button" data-v="yes">Accepter</button><button type="button" data-v="no">Refuser</button></div></div>';
    b.addEventListener('click', (e) => {
      const v = e.target.dataset && e.target.dataset.v;
      if (!v) return;
      set(v);
      b.remove();
      if (v === 'yes') loadTrackers();
    });
    document.body.appendChild(b);
  }

  document.getElementById('cookie-settings').addEventListener('click', showBanner);
  const c = get();
  if (c === 'yes') loadTrackers();
  else if (c === null) showBanner();
})();

// --- Animations ---
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Apparition au scroll des cartes et des blocs de texte.
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.cards a, .group h2, .explain, .related h2').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--d', (i % 3) * 0.08 + 's');
      io.observe(el);
    });
  }

  // Effet « pop » quand un résultat change.
  if (!reduce) {
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => {
        const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        if (!el || !el.classList || !(el.classList.contains('big') || el.classList.contains('winner'))) return;
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
      });
    });
    document.querySelectorAll('.big, .winner').forEach((el) => mo.observe(el, { childList: true, characterData: true, subtree: true }));
  }

  // Confettis (canvas plein écran, supprimé à la fin).
  window.confetti = function () {
    if (reduce) return;
    const c = document.createElement('canvas');
    c.id = 'confetti';
    c.width = innerWidth;
    c.height = innerHeight;
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const colors = ['#8b5cf6', '#22d3ee', '#f472b6', '#facc15', '#4ade80'];
    const parts = Array.from({ length: 140 }, () => ({
      x: c.width / 2, y: c.height * 0.45,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4,
      s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    const t0 = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, c.width, c.height);
      parts.forEach((p) => {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (now - t0 < 3000) requestAnimationFrame(frame);
      else c.remove();
    })(t0);
  };
})();

// --- Progression : XP, niveaux, succès, quête (stockage local uniquement) ---
(function () {
  if (document.body.classList.contains('overlay')) return;
  const KEY = 'cc-progress-v1';
  const XP_PER_LEVEL = 60;
  const TOTAL_TOOLS = parseInt(document.body.dataset.total, 10) || 10;
  const RANKS = ['Noob', 'Rookie', 'Joueur', 'Pro', 'Élite', 'Légende'];
  const ACH = {
    first: ['Premier pas', 'Premier outil découvert'],
    explorer: ['Explorateur', '3 outils découverts'],
    complete: ['Complétionniste', 'Tous les outils découverts'],
    copy: ['Copier-coller', 'Premier résultat copié'],
    lucky: ['Chanceux', 'Un gagnant tiré à la roue'],
  };

  const fresh = () => ({ xp: 0, used: {}, ach: {} });
  function load() {
    try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY))); } catch (e) { return fresh(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ignoré */ } }
  let st = load();

  const level = () => 1 + Math.floor(st.xp / XP_PER_LEVEL);
  const rank = () => RANKS[Math.min(level() - 1, RANKS.length - 1)];

  // HUD dans l'en-tête
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.title = 'Ta progression : gagne de l’XP en utilisant les outils';
  const lvlEl = document.createElement('span');
  lvlEl.className = 'hud-lvl';
  const bar = document.createElement('span');
  bar.className = 'xpbar';
  const fill = document.createElement('i');
  bar.appendChild(fill);
  hud.append(lvlEl, bar);
  const nav = document.querySelector('.main-nav');
  if (nav) nav.after(hud);

  const toasts = document.createElement('div');
  toasts.className = 'toasts';
  toasts.setAttribute('aria-live', 'polite');
  document.body.appendChild(toasts);

  function toast(text, cls) {
    const t = document.createElement('div');
    t.className = 'toast ' + (cls || '');
    t.textContent = text;
    toasts.appendChild(t);
    setTimeout(() => t.classList.add('out'), 3200);
    setTimeout(() => t.remove(), 3700);
  }

  const used = () => Object.keys(st.used).length;

  function render() {
    lvlEl.textContent = 'LVL ' + level() + ' · ' + rank();
    fill.style.width = ((st.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100) + '%';
    const quest = document.querySelector('.quest');
    if (quest) {
      quest.querySelector('.quest-n').textContent = used() + '/' + TOTAL_TOOLS;
      quest.querySelector('i').style.width = (used() / TOTAL_TOOLS * 100) + '%';
      quest.classList.toggle('complete', used() >= TOTAL_TOOLS);
    }
    document.querySelectorAll('.cards a[data-key]').forEach((a) => a.classList.toggle('done', !!st.used[a.dataset.key]));
  }

  function unlock(id) {
    if (st.ach[id] || !ACH[id]) return;
    st.ach[id] = true;
    toast('🏆 Succès débloqué : ' + ACH[id][0] + ' – ' + ACH[id][1], 'ach');
  }

  function award(n, label, achId) {
    const before = level();
    st.xp += n;
    if (label) toast('+' + n + ' XP · ' + label);
    if (achId) unlock(achId);
    if (level() > before) toast('⬆ Niveau ' + level() + ' : ' + rank() + ' !', 'lvl');
    save();
    render();
  }
  window.xp = award;

  // Copie = petit bonus
  const origCopy = window.copyText;
  window.copyText = function () { award(5, 'Résultat copié', 'copy'); return origCopy.apply(this, arguments); };

  // Découverte d'un outil à la première visite
  const m = document.body.className.match(/tool-(\S+)/);
  if (m && !st.used[m[1]]) {
    st.used[m[1]] = true;
    if (used() >= 1) unlock('first');
    if (used() >= 3) unlock('explorer');
    if (used() >= TOTAL_TOOLS) unlock('complete');
    award(25, 'Nouvel outil découvert');
  }

  // Quête sur l'accueil
  const hero = document.querySelector('.hero');
  if (hero) {
    const q = document.createElement('div');
    q.className = 'quest';
    const t = document.createElement('span');
    t.className = 'quest-t';
    t.textContent = 'QUÊTE · Découvre les ' + TOTAL_TOOLS + ' outils';
    const b = document.createElement('span');
    b.className = 'xpbar';
    b.appendChild(document.createElement('i'));
    const n = document.createElement('span');
    n.className = 'quest-n';
    q.append(t, b, n);
    hero.appendChild(q);
  }

  const reset = document.getElementById('reset-progress');
  if (reset) reset.addEventListener('click', () => { st = fresh(); save(); render(); toast('Progression réinitialisée'); });

  render();
})();

// Téléchargement d'un canvas en PNG (+ petit bonus d'XP).
window.downloadCanvas = function (canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (window.xp) window.xp(10, 'Image téléchargée');
  }, 'image/png');
};
