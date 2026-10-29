// Test de fumée : node test.js (après node build.js)
// Vérifie le SEO de base de chaque page, la validité des liens internes et des scripts, et la syntaxe du JS.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const DIST = path.join(__dirname, 'dist');
let errors = 0;
const fail = (m) => { errors++; console.error('✗', m); };

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(DIST);
const exists = (url) => {
  const p = url.split('#')[0].split('?')[0];
  if (!p) return true;
  const f = path.join(DIST, p);
  return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html')));
};

for (const f of files.filter((x) => x.endsWith('.html'))) {
  const rel = path.relative(DIST, f);
  const html = fs.readFileSync(f, 'utf8');
  if (rel !== '404.html') {
    if (!/<title>[^<]{10,}<\/title>/.test(html)) fail(`${rel} : titre manquant ou trop court`);
    const d = html.match(/<meta name="description" content="([^"]*)"/);
    if (!d || d[1].length < 50) fail(`${rel} : meta description manquante ou trop courte`);
    if ((html.match(/<h1[ >]/g) || []).length !== 1) fail(`${rel} : il faut exactement un h1`);
    if (!/<link rel="canonical"/.test(html)) fail(`${rel} : canonical manquant`);
  }
  if (/\.innerHTML/.test(html)) fail(`${rel} : innerHTML dans la page`);
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (!exists(m[1])) fail(`${rel} : lien cassé ${m[1]}`);
  }
}

// Pas d'innerHTML avec des données utilisateur, sauf chaînes statiques vérifiées à la main (common.js : bandeau).
for (const f of files.filter((x) => x.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { fail(`${path.relative(DIST, f)} : erreur de syntaxe`); }
  const src = fs.readFileSync(f, 'utf8');
  if (/innerHTML\s*=/.test(src) && !f.endsWith('common.js')) fail(`${path.relative(DIST, f)} : innerHTML`);
  if (/api[_-]?key|secret/i.test(src)) fail(`${path.relative(DIST, f)} : clé ou secret suspect`);
}

const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const pages = files.filter((x) => x.endsWith('index.html')).length;
if ((sitemap.match(/<loc>/g) || []).length !== pages) fail(`sitemap : ${(sitemap.match(/<loc>/g) || []).length} URL pour ${pages} pages`);

console.log(errors ? `\n${errors} erreur(s)` : `OK : ${files.length} fichiers vérifiés`);
process.exit(errors ? 1 : 0);
