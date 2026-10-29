(function () {
  const $ = (id) => document.getElementById(id);
  const canvas = $('wheel');
  const ctx = canvas.getContext('2d');
  const SIZE = canvas.width;
  const R = SIZE / 2;
  const COLORS = ['#6d4aff', '#ff6b9d', '#00b8a9', '#f6b73c', '#3a86ff', '#ef476f', '#06d6a0', '#8338ec'];
  const MAX_LABELS = 60;

  let angle = 0; // rotation courante en radians
  let spinning = false;

  const names = () => $('names').value.split('\n').map((s) => s.trim()).filter(Boolean);

  // Entier aléatoire uniforme dans [0, max[ (sans biais de modulo).
  function randomInt(max) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  }

  function draw() {
    const list = names();
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.save();
    ctx.translate(R, R);
    ctx.rotate(angle);
    if (list.length === 0) {
      ctx.beginPath();
      ctx.arc(0, 0, R - 4, 0, Math.PI * 2);
      ctx.fillStyle = '#9a9ab0';
      ctx.fill();
    } else {
      const step = (Math.PI * 2) / list.length;
      list.forEach((name, i) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R - 4, i * step, (i + 1) * step);
        ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();
        if (list.length <= MAX_LABELS) {
          ctx.save();
          ctx.rotate(i * step + step / 2);
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.font = `bold ${Math.max(11, Math.min(24, 300 / list.length + 8))}px system-ui, sans-serif`;
          const label = name.length > 16 ? name.slice(0, 15) + '…' : name;
          ctx.fillText(label, R - 20, 0);
          ctx.restore();
        }
      });
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(R, R, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  function updateInfo() {
    const n = names().length;
    $('info').textContent = n + (n > 1 ? ' participants' : ' participant');
    $('spin').disabled = n < 2 || spinning;
  }

  function spin() {
    const list = names();
    if (list.length < 2 || spinning) return;
    spinning = true;
    $('spin').disabled = true;
    $('winner').textContent = '…';
    $('copy').disabled = true;

    const winner = randomInt(list.length);
    const step = (Math.PI * 2) / list.length;
    // Le pointeur est en haut (-π/2). On amène le milieu du secteur gagnant sous le pointeur.
    const target = -Math.PI / 2 - (winner * step + step / 2);
    const jitter = (Math.random() - 0.5) * step * 0.7;
    const turns = 5 + randomInt(3);
    const start = angle;
    let end = target + jitter - turns * Math.PI * 2;
    // S'assurer que la rotation est décroissante depuis start (sens anti-horaire cohérent).
    while (end > start - Math.PI * 2 * 4) end -= Math.PI * 2;
    const duration = 5000;
    const t0 = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - t, 4);
      angle = start + (end - start) * ease;
      draw();
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spinning = false;
        $('winner').textContent = list[winner];
        if (window.confetti) window.confetti();
        if (window.xp) window.xp(10, 'Gagnant tiré !', 'lucky');
        $('copy').disabled = false;
        if ($('remove').checked) {
          list.splice(winner, 1);
          $('names').value = list.join('\n');
          angle = 0;
          draw();
        }
        updateInfo();
      }
    }
    requestAnimationFrame(frame);
  }

  $('names').addEventListener('input', () => { if (!spinning) { angle = 0; draw(); updateInfo(); } });
  $('spin').addEventListener('click', spin);
  $('dedupe').addEventListener('click', () => {
    if (spinning) return;
    $('names').value = [...new Set(names().map((n) => n.replace(/^@/, '')))].join('\n');
    angle = 0;
    draw();
    updateInfo();
  });
  $('copy').addEventListener('click', () => window.copyText($('winner').textContent, $('status')));
  draw();
  updateInfo();
})();
