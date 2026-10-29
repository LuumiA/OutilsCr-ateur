(function () {
  const $ = (id) => document.getElementById(id);
  let imgUrl = '';

  function thumb(duration) {
    const t = document.createElement('div');
    t.className = 'yt-thumb';
    if (imgUrl) t.style.backgroundImage = `url("${imgUrl}")`;
    else t.classList.add('sample');
    const d = document.createElement('span');
    d.className = 'yt-dur';
    d.textContent = duration;
    t.appendChild(d);
    return t;
  }

  function meta(withAvatar) {
    const m = document.createElement('div');
    m.className = 'yt-meta';
    if (withAvatar) {
      const av = document.createElement('div');
      av.className = 'yt-av';
      av.textContent = ($('channel').value.trim()[0] || '?').toUpperCase();
      m.appendChild(av);
    }
    const txt = document.createElement('div');
    const ti = document.createElement('div');
    ti.className = 'yt-title';
    ti.textContent = $('title').value || 'Titre de la vidéo';
    const ch = document.createElement('div');
    ch.className = 'yt-sub';
    ch.textContent = $('channel').value || 'Chaîne';
    const vw = document.createElement('div');
    vw.className = 'yt-sub';
    vw.textContent = $('views').value;
    txt.append(ti, ch, vw);
    m.appendChild(txt);
    return m;
  }

  function render() {
    $('yt').dataset.theme = $('theme').value;
    const pc = $('card-pc');
    const mo = $('card-mobile');
    const sd = $('card-side');
    [pc, mo, sd].forEach((e) => { e.textContent = ''; });
    pc.append(thumb('12:34'), meta(true));
    mo.append(thumb('12:34'), meta(true));
    sd.append(thumb('12:34'), meta(false));
  }

  $('file').addEventListener('change', () => {
    const f = $('file').files[0];
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    imgUrl = URL.createObjectURL(f);
    const probe = new Image();
    probe.onload = () => {
      const ok = probe.width === 1280 && probe.height === 720;
      $('fileinfo').textContent = `${probe.width}×${probe.height} · ${(f.size / 1024 / 1024).toFixed(2)} Mo`
        + (ok ? ' · taille idéale ✓' : ' · conseillé : 1280×720')
        + (f.size > 2 * 1024 * 1024 ? ' · attention, plus de 2 Mo' : '');
    };
    probe.src = imgUrl;
    render();
    if (window.xp) window.xp(5, 'Miniature testée');
  });
  ['title', 'channel', 'views', 'theme'].forEach((id) => $(id).addEventListener('input', render));
  render();
})();
