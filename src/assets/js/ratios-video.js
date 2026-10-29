(function () {
  const $ = (id) => document.getElementById(id);
  const RATIOS = [
    { name: '16:9', w: 16, h: 9, std: '1920×1080', use: 'YouTube, Twitch' },
    { name: '9:16', w: 9, h: 16, std: '1080×1920', use: 'TikTok, Reels, Shorts' },
    { name: '1:1', w: 1, h: 1, std: '1080×1080', use: 'Instagram carré' },
    { name: '4:5', w: 4, h: 5, std: '1080×1350', use: 'Instagram portrait' },
    { name: '4:3', w: 4, h: 3, std: '1440×1080', use: 'Format classique' },
    { name: '21:9', w: 21, h: 9, std: '2560×1080', use: 'Cinéma, ultra-wide' },
  ];
  const even = (n) => Math.max(2, Math.floor(n / 2) * 2);
  const pos = (id) => Math.max(1, parseInt($(id).value, 10) || 1);

  // Plus grand rectangle de ratio rw:rh contenu dans w×h.
  function fit(w, h, rw, rh) {
    let nw = w;
    let nh = (w * rh) / rw;
    if (nh > h) { nh = h; nw = (h * rw) / rh; }
    return [even(nw), even(nh)];
  }

  let text = '';
  function renderTable() {
    const w = pos('w');
    const h = pos('h');
    const box = $('table');
    box.textContent = '';
    const lines = [`Source : ${w}×${h}`];
    RATIOS.forEach((r) => {
      const [fw, fh] = fit(w, h, r.w, r.h);
      const row = document.createElement('div');
      row.className = 'ratio-row';
      const a = document.createElement('strong');
      a.textContent = r.name;
      const b = document.createElement('span');
      b.textContent = `${fw}×${fh}`;
      b.className = 'ratio-size';
      const c = document.createElement('span');
      c.className = 'note';
      c.textContent = `${r.use} · standard ${r.std}`;
      row.append(a, b, c);
      box.appendChild(row);
      lines.push(`${r.name} : ${fw}×${fh} (${r.use}, standard ${r.std})`);
    });
    text = lines.join('\n');
  }

  RATIOS.forEach((r, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = `${r.name} – ${r.use}`;
    $('qr').appendChild(o);
  });
  $('qr').value = 1;

  function quick(from) {
    const r = RATIOS[$('qr').value];
    if (from === 'w') $('qh').value = even((pos('qw') * r.h) / r.w);
    else $('qw').value = even((pos('qh') * r.w) / r.h);
  }

  $('w').addEventListener('input', renderTable);
  $('h').addEventListener('input', renderTable);
  $('qw').addEventListener('input', () => quick('w'));
  $('qh').addEventListener('input', () => quick('h'));
  $('qr').addEventListener('change', () => quick('w'));
  $('copy').addEventListener('click', () => window.copyText(text, $('status')));
  renderTable();
  quick('w');
})();
