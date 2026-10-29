(function () {
  const $ = (id) => document.getElementById(id);

  const THEMES = {
    'Gaming': ['gaming', 'gamer', 'jeuxvideo', 'gameplay', 'streamer', 'twitch', 'lets play', 'fps', 'ps5', 'pcgaming', 'esport', 'gamingfrance', 'jeuvideo', 'clipgaming', 'highlights'],
    'Minecraft': ['minecraft', 'minecraftfr', 'minecraftmemes', 'minecraftbuilds', 'survie', 'redstone', 'minecrafthardcore', 'gamingfr', 'minecraftvideo', 'mc'],
    'Fortnite': ['fortnite', 'fortnitefr', 'fortnitememes', 'battleroyale', 'fortniteclips', 'victoryroyale', 'fortnitegameplay', 'gamingfr', 'fncs'],
    'Vlog / IRL': ['vlog', 'irl', 'viequotidienne', 'dayinmylife', 'routine', 'storytime', 'lifestyle', 'quotidien', 'vlogfrance', 'dailyvlog'],
    'Humour': ['humour', 'drole', 'memes', 'blague', 'comedie', 'funny', 'mdr', 'humourfrancais', 'sketch', 'lol'],
    'Musique': ['musique', 'music', 'rapfr', 'chanteur', 'cover', 'nouveauson', 'beatmaker', 'studio', 'artistefrancais', 'newmusic'],
    'Cuisine': ['cuisine', 'recette', 'recettefacile', 'foodie', 'cuisinemaison', 'gourmand', 'patisserie', 'idéerepas', 'faitmaison', 'chef'],
    'Fitness / Sport': ['fitness', 'sport', 'musculation', 'workout', 'motivation', 'entrainement', 'gym', 'perdredupoids', 'running', 'santé'],
    'Voyage': ['voyage', 'travel', 'vacances', 'explorer', 'decouverte', 'roadtrip', 'tourisme', 'idéevoyage', 'aventure', 'paysage'],
    'Mode / Beauté': ['mode', 'beaute', 'ootd', 'makeup', 'tendance', 'style', 'skincare', 'look', 'fashion', 'conseilsbeaute'],
    'Montage vidéo': ['montagevideo', 'videoediting', 'premierepro', 'davinciresolve', 'capcut', 'aftereffects', 'monteur', 'tutomontage', 'editing', 'videocreator'],
    'Business / Argent': ['business', 'entrepreneur', 'argent', 'finance', 'revenuspassifs', 'freelance', 'marketing', 'reussite', 'investissement', 'sidehustle'],
  };

  const GENERIC = {
    tiktok: ['fyp', 'pourtoi', 'foryou', 'viral', 'tiktokfrance', 'fypシ', 'xyzbca'],
    instagram: ['reels', 'instagood', 'explore', 'instafrance', 'reelsfrance', 'contentcreator', 'creatorsfrance'],
    youtube: ['youtube', 'youtubefrance', 'youtubeur', 'shorts', 'createurdecontenu'],
  };

  Object.keys(THEMES).forEach((name) => {
    const o = document.createElement('option');
    o.value = name;
    o.textContent = name;
    $('theme').appendChild(o);
  });

  const clean = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  // Mélange Fisher-Yates.
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let current = '';

  function generate() {
    const n = Math.min(30, Math.max(3, parseInt($('n').value, 10) || 10));
    const theme = THEMES[$('theme').value].map(clean);
    const generic = GENERIC[$('platform').value].map(clean);
    const kw = clean($('kw').value);
    const pool = [];
    if (kw) pool.push(kw, kw + 'fr', kw + 'france', kw + 'clips', kw + 'tuto');
    const nGeneric = Math.min(generic.length, Math.max(1, Math.round(n * 0.25)));
    const picked = [
      ...pool.slice(0, Math.min(pool.length, Math.ceil(n * 0.3))),
      ...shuffle(generic).slice(0, nGeneric),
      ...shuffle(theme),
    ];
    const unique = [...new Set(picked.filter(Boolean))].slice(0, n);
    current = unique.map((t) => '#' + t).join(' ');
    $('tags').textContent = current;
    $('tags').classList.remove('note');
    $('copy').disabled = false;
    $('again').disabled = false;
  }

  $('gen').addEventListener('click', generate);
  $('again').addEventListener('click', generate);
  $('copy').addEventListener('click', () => window.copyText(current, $('status')));
})();
