(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const overlay = params.get('overlay') === '1';
  const hex = (v, d) => (/^[0-9a-f]{6}$/i.test(v || '') ? '#' + v : d);

  // Valeurs initiales depuis l'URL (utilisées par la source navigateur d'OBS).
  if (params.has('m')) $('min').value = Math.min(999, Math.max(0, parseInt(params.get('m'), 10) || 0));
  if (params.has('s')) $('sec').value = Math.min(59, Math.max(0, parseInt(params.get('s'), 10) || 0));
  if (params.has('t')) $('text').value = params.get('t').slice(0, 60);
  if (params.has('e')) $('endtext').value = params.get('e').slice(0, 30);
  if (params.has('fg')) $('fg').value = hex(params.get('fg'), '#ffffff');
  if (params.has('bg')) {
    $('bgmode').value = 'color';
    $('bg').value = hex(params.get('bg'), '#111111');
  }

  let remaining = 0;
  let endAt = 0;
  let timer = null;

  const total = () => (Math.max(0, parseInt($('min').value, 10) || 0) * 60) + Math.min(59, Math.max(0, parseInt($('sec').value, 10) || 0));
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    return String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };

  function applyStyle() {
    $('display').style.color = $('fg').value;
    $('label').style.color = $('fg').value;
    const transparent = $('bgmode').value === 'transparent';
    const color = transparent ? 'transparent' : $('bg').value;
    if (overlay) document.body.style.setProperty('--overlay-bg', color);
    else $('display').style.background = transparent ? 'var(--bg)' : color;
    $('label').textContent = $('text').value;
    updateLink();
  }

  function tick() {
    remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    if (remaining === 0) {
      clearInterval(timer);
      timer = null;
      $('display').textContent = $('endtext').value;
      $('display').classList.remove('urgent');
      $('display').classList.add('done');
      return;
    }
    $('display').textContent = fmt(remaining);
    $('display').classList.toggle('urgent', remaining <= 10);
  }

  function start() {
    if (timer) return;
    if (remaining <= 0) remaining = total();
    if (remaining <= 0) return;
    endAt = Date.now() + remaining * 1000;
    timer = setInterval(tick, 250);
    tick();
  }
  function pause() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }
  function reset() {
    pause();
    remaining = total();
    endAt = 0;
    $('display').classList.remove('urgent', 'done');
    $('display').textContent = fmt(remaining);
  }

  function updateLink() {
    const p = new URLSearchParams({ overlay: '1', m: $('min').value || '0', s: $('sec').value || '0', t: $('text').value, e: $('endtext').value, fg: $('fg').value.slice(1) });
    if ($('bgmode').value === 'color') p.set('bg', $('bg').value.slice(1));
    $('obslink').value = location.origin + location.pathname + '?' + p.toString();
  }

  ['min', 'sec', 'text', 'endtext', 'fg', 'bg', 'bgmode'].forEach((id) => $(id).addEventListener('input', () => {
    applyStyle();
    if (!timer && (id === 'min' || id === 'sec')) reset();
  }));
  $('start').addEventListener('click', start);
  $('pause').addEventListener('click', pause);
  $('reset').addEventListener('click', reset);
  $('full').addEventListener('click', () => {
    const el = document.querySelector('.tool');
    if (el.requestFullscreen) el.requestFullscreen();
  });
  $('copylink').addEventListener('click', () => window.copyText($('obslink').value, $('status')));

  applyStyle();
  reset();
  if (overlay) start();
})();
