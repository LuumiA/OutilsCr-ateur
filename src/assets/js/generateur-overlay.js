(function () {
  const $ = (id) => document.getElementById(id);
  const cv = $('cv');
  const ctx = cv.getContext('2d');
  const SIZES = { banner: [1200, 260], alert: [1000, 360] };
  const FONT = 'system-ui, "Segoe UI", Roboto, sans-serif';

  function path(x, y, w, h, shape) {
    ctx.beginPath();
    if (shape === 'round') {
      const r = Math.min(40, h / 2);
      ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
    } else if (shape === 'cut') {
      const c = Math.min(50, h / 3);
      ctx.moveTo(x + c, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h - c);
      ctx.lineTo(x + w - c, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + c);
      ctx.closePath();
    } else {
      ctx.rect(x, y, w, h);
    }
  }

  function fitText(text, maxW, size, weight) {
    let s = size;
    do { ctx.font = `${weight} ${s}px ${FONT}`; s -= 2; } while (ctx.measureText(text).width > maxW && s > 16);
    return text;
  }

  function draw() {
    const kind = $('kind').value;
    const [W, H] = SIZES[kind];
    cv.width = W;
    cv.height = H;
    ctx.clearRect(0, 0, W, H);
    const pad = 12;
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, $('c1').value);
    g.addColorStop(1, $('c2').value);

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.45)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;
    path(pad, pad, W - pad * 2, H - pad * 2 - 6, $('shape').value);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();

    // Voile sombre sous le texte pour la lisibilité
    path(pad, pad, W - pad * 2, H - pad * 2 - 6, $('shape').value);
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.fill();

    ctx.fillStyle = $('ct').value;
    ctx.textBaseline = 'middle';
    const icon = $('icon').value.trim();
    if (kind === 'banner') {
      const left = 70;
      ctx.textAlign = 'left';
      fitText($('t1').value, W - left * 2, 96, 800);
      ctx.fillText($('t1').value, left, H / 2 - 28);
      fitText($('t2').value, W - left * 2, 48, 500);
      ctx.globalAlpha = 0.9;
      ctx.fillText($('t2').value, left, H / 2 + 50);
      ctx.globalAlpha = 1;
    } else {
      ctx.textAlign = 'center';
      if (icon) { ctx.font = `110px ${FONT}`; ctx.fillText(icon, W / 2, 85); }
      fitText($('t1').value, W - 120, 80, 800);
      ctx.fillText($('t1').value, W / 2, 195);
      fitText($('t2').value, W - 120, 44, 500);
      ctx.fillText($('t2').value, W / 2, 275);
    }
    $('iconwrap').style.display = kind === 'alert' ? '' : 'none';
  }

  ['kind', 'shape', 't1', 't2', 'icon', 'c1', 'c2', 'ct'].forEach((id) => $(id).addEventListener('input', draw));
  $('dl').addEventListener('click', () => window.downloadCanvas(cv, 'overlay-' + $('kind').value + '.png'));
  draw();
})();
