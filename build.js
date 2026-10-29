// Générateur du site statique : node build.js  ->  dossier dist/
// Aucune dépendance. Assemble l'en-tête/pied de page commun, les pages d'outils, le sitemap.
const fs = require('fs');
const path = require('path');

const SITE = {
  name: 'OutilsCréateur',
  url: (process.env.SITE_URL || 'https://outilscreateur.fr').replace(/\/$/, ''),
  tagline: 'Outils gratuits pour streamers, YouTubeurs et TikTokeurs',
  email: 'contact@outilscreateur.fr',
};

const SECTIONS = [
  { id: 'twitch', label: 'Stream et Twitch' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'reseaux-sociaux', label: 'Réseaux sociaux' },
];

const TOOLS = [
  {
    key: 'revenus-twitch', icon: '💜', section: 'twitch', slug: 'calculateur-revenus',
    nav: 'Revenus Twitch', h1: 'Calculateur de revenus Twitch gratuit',
    title: 'Calculateur de revenus Twitch gratuit (subs, bits, pubs)',
    desc: 'Estimez gratuitement ce que rapporte votre chaîne Twitch : abonnements, bits et publicités. Résultat instantané, modifiable et sans inscription.',
    short: 'Estime tes revenus selon les subs, bits et viewers.',
  },
  {
    key: 'revenus-youtube', icon: '▶️', section: 'youtube', slug: 'calculateur-revenus',
    nav: 'Revenus YouTube', h1: 'Calculateur de revenus YouTube gratuit',
    title: 'Calculateur de revenus YouTube gratuit (vues et RPM)',
    desc: 'Combien rapportent vos vues YouTube ? Estimez vos revenus mensuels et annuels selon le nombre de vues et le RPM. Gratuit, sans inscription.',
    short: 'Estime tes revenus selon les vues et le RPM.',
  },
  {
    key: 'minuteur-stream', icon: '⏱️', section: 'twitch', slug: 'minuteur-stream',
    nav: 'Minuteur de stream', h1: 'Minuteur et compte à rebours pour stream (OBS)',
    title: 'Compte à rebours pour stream OBS gratuit – plein écran',
    desc: 'Compte à rebours plein écran à ajouter dans OBS comme source navigateur. Réglez la durée, le texte et les couleurs, puis copiez le lien. Gratuit.',
    short: 'Compte à rebours plein écran à mettre dans OBS.',
  },
  {
    key: 'compteur-caracteres', icon: '🔤', section: 'reseaux-sociaux', slug: 'compteur-caracteres',
    nav: 'Compteur de caractères', h1: 'Compteur de caractères pour réseaux sociaux',
    title: 'Compteur de caractères réseaux sociaux (X, Instagram, TikTok, YouTube)',
    desc: 'Vérifiez la longueur de votre titre, bio ou légende selon la plateforme : X, Instagram, TikTok, YouTube, Twitch. Gratuit et instantané.',
    short: 'Vérifie la longueur d’un titre, d’une bio ou d’une légende.',
  },
  {
    key: 'generateur-hashtags', icon: '#️⃣', section: 'reseaux-sociaux', slug: 'generateur-hashtags',
    nav: 'Hashtags', h1: 'Générateur de hashtags gratuit',
    title: 'Générateur de hashtags gratuit pour TikTok, Instagram et YouTube',
    desc: 'Générez des hashtags adaptés à votre thème (gaming, cuisine, fitness, musique…) pour TikTok, Instagram et YouTube. Copiez-les en un clic.',
    short: 'Propose des hashtags selon un thème choisi.',
  },
  {
    key: 'roue-giveaway', icon: '🎁', section: 'reseaux-sociaux', slug: 'roue-giveaway',
    nav: 'Roue giveaway', h1: 'Roue de tirage au sort pour giveaway',
    title: 'Roue de tirage au sort gratuite pour giveaway (pseudos)',
    desc: 'Tirez un gagnant au hasard parmi une liste de pseudos avec une roue animée. Idéal pour les giveaways Twitch, YouTube et Instagram. Gratuit.',
    short: 'Tire un gagnant au hasard parmi une liste de pseudos.',
  },
  {
    key: 'apercu-miniature', icon: '🖼️', section: 'youtube', slug: 'apercu-miniature',
    nav: 'Aperçu miniature', h1: 'Aperçu de miniature YouTube sur mobile et PC',
    title: 'Aperçu de miniature YouTube gratuit (mobile et PC)',
    desc: 'Testez votre miniature YouTube comme dans le fil d’accueil, sur mobile et sur PC, avant de publier. Gratuit, sans envoi de fichier.',
    short: 'Vois ta miniature comme dans le fil YouTube.',
  },
  {
    key: 'ratios-video', icon: '📐', section: 'youtube', slug: 'ratios-video',
    nav: 'Ratios vidéo', h1: 'Convertisseur de format vidéo : 16:9, 9:16, 1:1',
    title: 'Convertisseur de ratio vidéo 16:9, 9:16, 1:1 – calcul des tailles',
    desc: 'Calculez la taille exacte de votre vidéo en 16:9, 9:16, 1:1 ou 4:5 pour YouTube, TikTok et Instagram. Recadrage et résolutions standard.',
    short: 'Calcule les tailles pour 16:9, 9:16, 1:1.',
  },
  {
    key: 'generateur-overlay', icon: '🎨', section: 'twitch', slug: 'generateur-overlay',
    nav: 'Overlays simples', h1: 'Générateur d’overlay et de bandeau pour stream (PNG)',
    title: 'Générateur d’overlay Twitch gratuit : bandeau et alerte en PNG',
    desc: 'Créez un bandeau de pseudo ou une alerte pour votre stream et téléchargez-les en PNG transparent. Couleurs et textes personnalisables.',
    short: 'Crée un bandeau ou une alerte à télécharger en PNG.',
  },
  {
    key: 'planificateur-stream', icon: '🗓️', section: 'twitch', slug: 'planificateur-stream',
    nav: 'Planning de stream', h1: 'Planificateur de stream : planning de la semaine en image',
    title: 'Planning de stream gratuit : créez votre programme en image',
    desc: 'Créez le planning de votre semaine de stream et téléchargez-le en image à partager sur Twitter, Discord et Instagram. Gratuit.',
    short: 'Crée un planning de la semaine à partager en image.',
  },
];

const PAGES = [
  { slug: 'soutenir', title: 'Soutenir le projet', desc: `Soutenez ${SITE.name}, des outils gratuits pour créateurs de contenu.` },
  { slug: 'a-propos', title: 'À propos', desc: `À propos de ${SITE.name}, des outils gratuits pour les créateurs de contenu francophones.` },
  { slug: 'contact', title: 'Contact', desc: `Contacter ${SITE.name} pour une suggestion d’outil, un bug ou une question. Nous répondons dès que possible.` },
  { slug: 'mentions-legales', title: 'Mentions légales', desc: `Mentions légales de ${SITE.name} : éditeur du site, hébergeur, propriété intellectuelle et responsabilité.` },
  { slug: 'confidentialite', title: 'Politique de confidentialité', desc: `Politique de confidentialité et cookies de ${SITE.name} : données traitées, cookies, droits RGPD.` },
];

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');
const write = (p, data) => {
  const full = path.join(DIST, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, data);
};
const toolUrl = (t) => `/${t.section}/${t.slug}/`;

function layout({ title, desc, urlPath, body, script, jsonLd, bodyClass = '', noindex = false }) {
  const canonical = SITE.url + urlPath;
  const nav = SECTIONS.map((s) => `<a href="/#${s.id}">${esc(s.label)}</a>`).join('');
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/style.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body class="${bodyClass}" data-total="${TOOLS.length}">
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/"><svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#lg)"/><path d="M18 22h28v7H36v19h-8V29H18z" fill="#0b0b14"/></svg>${esc(SITE.name)}</a>
    <nav class="main-nav" aria-label="Navigation principale">${nav}</nav>
  </div>
</header>
<main class="wrap">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <nav class="footer-nav" aria-label="Pied de page">
      ${PAGES.map((p) => `<a href="/${p.slug}/">${esc(p.title)}</a>`).join('')}
      <button type="button" class="link-btn" id="cookie-settings">Gérer les cookies</button>
      <button type="button" class="link-btn" id="reset-progress">Réinitialiser ma progression</button>
    </nav>
    <p class="disclaimer">${esc(SITE.name)} est un site indépendant, non affilié à Twitch, YouTube, TikTok, Instagram ou X. Les marques citées appartiennent à leurs propriétaires.</p>
  </div>
</footer>
<script src="/js/common.js" defer></script>
${script ? `<script src="${script}" defer></script>` : ''}
</body>
</html>
`;
}

function related(tool) {
  const others = TOOLS.filter((t) => t.key !== tool.key);
  const sameSection = others.filter((t) => t.section === tool.section);
  const rest = others.filter((t) => t.section !== tool.section);
  const picks = [...sameSection, ...rest].slice(0, 3);
  return `<section class="related"><h2>Vous aimerez aussi</h2><ul class="cards">${picks
    .map((t) => `<li><a data-key="${t.key}" href="${toolUrl(t)}"><span class="ico" aria-hidden="true">${t.icon}</span><span class="txt"><strong>${esc(t.nav)}</strong><span>${esc(t.short)}</span></span><span class="go" aria-hidden="true">→</span></a></li>`)
    .join('')}</ul></section>`;
}

function buildTool(tool) {
  const content = read(`tools/${tool.key}.html`);
  const faq = [...content.matchAll(/<h3>([^<]+)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)];
  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication',
      name: tool.h1, url: SITE.url + toolUrl(tool), applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web', inLanguage: 'fr', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
  ];
  if (faq.length) {
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((m) => ({
        '@type': 'Question', name: m[1],
        acceptedAnswer: { '@type': 'Answer', text: m[2].replace(/<[^>]+>/g, '') },
      })),
    });
  }
  const body = `<nav class="crumbs" aria-label="Fil d’Ariane"><a href="/">Accueil</a> › <a href="/#${tool.section}">${esc(SECTIONS.find((s) => s.id === tool.section).label)}</a></nav>
<h1>${esc(tool.h1)}</h1>
${content}
${related(tool)}`;
  write(path.join(tool.section, tool.slug, 'index.html'), layout({
    title: tool.title, desc: tool.desc, urlPath: toolUrl(tool), body,
    script: `/js/${tool.key}.js`, jsonLd, bodyClass: `tool-${tool.key}`,
  }));
}

function buildHome() {
  const groups = SECTIONS.map((s) => `<section id="${s.id}" class="group"><h2>${esc(s.label)}</h2><ul class="cards">${TOOLS
    .filter((t) => t.section === s.id)
    .map((t) => `<li><a data-key="${t.key}" href="${toolUrl(t)}"><span class="ico" aria-hidden="true">${t.icon}</span><span class="txt"><strong>${esc(t.nav)}</strong><span>${esc(t.short)}</span></span><span class="go" aria-hidden="true">→</span></a></li>`)
    .join('')}</ul></section>`).join('\n');
  const body = `<section class="hero">
  <span class="pill">Nouveau · 100 % gratuit</span>
  <h1>Les outils qu’il manquait aux <span class="grad">créateurs</span></h1>
  <p>Calculateurs, générateurs et utilitaires pour streamers, YouTubeurs et TikTokeurs. Tout tourne dans votre navigateur.</p>
  <ul class="badges"><li>Sans compte</li><li>Sans installation</li><li>Mobile et PC</li></ul>
</section>
${groups}`;
  write('index.html', layout({
    title: `${SITE.name} – ${SITE.tagline}`,
    desc: 'Outils en ligne gratuits en français pour streamers, YouTubeurs et TikTokeurs : calculateurs de revenus, minuteur OBS, hashtags, giveaway.',
    urlPath: '/', body,
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url, inLanguage: 'fr' },
  }));
}

function buildPages() {
  for (const p of PAGES) {
    const content = read(`pages/${p.slug}.html`).replace(/\{\{NAME\}\}/g, SITE.name).replace(/\{\{EMAIL\}\}/g, SITE.email).replace(/\{\{URL\}\}/g, SITE.url);
    write(path.join(p.slug, 'index.html'), layout({
      title: `${p.title} – ${SITE.name}`, desc: p.desc, urlPath: `/${p.slug}/`,
      body: `<h1>${esc(p.title)}</h1>\n<div class="prose">${content}</div>`,
    }));
  }
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(path.join(SRC, 'assets'), DIST);
  buildHome();
  TOOLS.forEach(buildTool);
  buildPages();
  const urls = ['/', ...TOOLS.map(toolUrl), ...PAGES.map((p) => `/${p.slug}/`)];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE.url}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
  write('404.html', layout({
    title: `Page introuvable – ${SITE.name}`, desc: 'Page introuvable.', urlPath: '/404.html', noindex: true,
    body: '<h1>Page introuvable</h1><p><a href="/">Retour à l’accueil</a></p>',
  }));
  console.log(`OK : ${urls.length} pages générées dans dist/ (${SITE.url})`);
}

build();
