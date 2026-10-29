(function () {
  const $ = (id) => document.getElementById(id);
  const cv = $('cv');
  const ctx = cv.getContext('2d');
  const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const PALS = {
    violet: ['#8b5cf6', '#22d3ee'],
    fire: ['#f43f8e', '#fb923c'],
    green: ['#22c55e', '#3b82f6'],
  };
  const KEY = 'cc-planning-v1';
  const FONT = 'system-ui, "Segoe UI", Roboto, sans-serif';

  const defaults = () => ({
    name: 'Ma Chaîne', ptitle: 'Planning de la semaine', pal: 'violet',
    days: DAYS.map((d, i) => ({ on: i === 1 || i === 3 || i === 5, time: '20:00', game: '' })),
  });
  let state = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Array.isArray(saved.days) && saved.days.length === 7) state = saved;
  } catch (e) { /* valeurs par défaut */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignoré */ } };

  // Formulaire des jours (construit avec le DOM)
  const box = $('days');
  DAYS.forEach((d, i) => {
    const row = document.createElement('div');
    row.className = 'day-row';
    const lab = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = state.days[i].on;
    lab.append(cb, document.createTextNode(d));
    const time = document.createElement('input');
    time.type = 'time';
    time.value = state.days[i].time;
    time.setAttribute('aria-label', 'Heure ' + d);
    const game = document.createElement('input');
    game.type = 'text';
    game.maxLength = 30;
    game.placeholder = 'Jeu ou thème';
    game.value = state.days[i].game;
    game.setAttribute('aria-label', 'Jeu ' + d);
    const upd = () => { state.days[i] = { on: cb.checked, time: time.value, game: game.value }; time.disabled = game.disabled = !cb.checked; draw(); };
    [cb, time, game].forEach((el) => el.addEventListener('input', upd));
    time.disabled = game.disabled = !cb.checked;
    row.append(lab, time, game);
    box.appendChild(row);
  });
  $('name').value = state.name;
  $('ptitle').value = state.ptitle;
  $('pal').value = state.pal;

  function draw() {
    state.name = $('name').value;
    state.ptitle = $('ptitle').value;
    state.pal = $('pal').value;
    persist();
    const [c1, c2] = PALS[state.pal] || PALS.violet;
    const W = cv.width;
    const H = cv.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0b0b14';
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W, 0, 0, W, 0, 700);
    glow.addColorStop(0, c1 + '55');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff';
    ctx.font = `800 52px ${FONT}`;
    ctx.fillText(state.ptitle || 'Planning', 50, 80);
    const g = ctx.createLinearGradient(50, 0, 450, 0);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.font = `700 28px ${FONT}`;
    ctx.fillText(state.name || '', 50, 122);

    const top = 150;
    const rowH = 74;
    state.days.forEach((d, i) => {
      const y = top + i * rowH;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(50, y, W - 100, rowH - 10, 14) : ctx.rect(50, y, W - 100, rowH - 10);
      if (d.on) {
        const rg = ctx.createLinearGradient(50, 0, W - 50, 0);
        rg.addColorStop(0, c1 + 'cc');
        rg.addColorStop(1, c2 + 'cc');
        ctx.fillStyle = rg;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,.06)';
      }
      ctx.fill();
      ctx.fillStyle = d.on ? '#fff' : 'rgba(255,255,255,.4)';
      ctx.font = `700 30px ${FONT}`;
      ctx.fillText(DAYS[i], 80, y + 42);
      ctx.font = `500 28px ${FONT}`;
      if (d.on) {
        ctx.fillText(d.time || '', 330, y + 42);
        ctx.font = `600 28px ${FONT}`;
        ctx.fillText(d.game || 'Live', 480, y + 42);
      } else {
        ctx.fillText('Repos', 330, y + 42);
      }
    });
  }

  function asText() {
    const lines = [state.ptitle + ' – ' + state.name];
    state.days.forEach((d, i) => { if (d.on) lines.push(`${DAYS[i]} ${d.time}${d.game ? ' : ' + d.game : ''}`); });
    return lines.join('\n');
  }

  ['name', 'ptitle', 'pal'].forEach((id) => $(id).addEventListener('input', draw));
  $('dl').addEventListener('click', () => window.downloadCanvas(cv, 'planning-stream.png'));
  $('copy').addEventListener('click', () => window.copyText(asText(), $('status')));
  draw();
})();
