# OutilsCréateur

Site gratuit en français regroupant des petits outils en ligne pour les créateurs de contenu (Twitch, YouTube, TikTok, Instagram). Site statique en HTML, CSS et JavaScript « vanilla » : tous les calculs se font dans le navigateur, sans serveur, sans base de données, sans compte.

## Outils

| Rubrique | Outil | URL |
|---|---|---|
| Stream et Twitch | Calculateur de revenus Twitch | `/twitch/calculateur-revenus/` |
| Stream et Twitch | Minuteur / compte à rebours (source navigateur OBS) | `/twitch/minuteur-stream/` |
| Stream et Twitch | Générateur d'overlays (PNG transparent) | `/twitch/generateur-overlay/` |
| Stream et Twitch | Planificateur de stream (image) | `/twitch/planificateur-stream/` |
| YouTube | Calculateur de revenus YouTube | `/youtube/calculateur-revenus/` |
| YouTube | Aperçu de miniature | `/youtube/apercu-miniature/` |
| YouTube | Convertisseur de ratios vidéo | `/youtube/ratios-video/` |
| Réseaux sociaux | Compteur de caractères | `/reseaux-sociaux/compteur-caracteres/` |
| Réseaux sociaux | Générateur de hashtags | `/reseaux-sociaux/generateur-hashtags/` |
| Réseaux sociaux | Roue de giveaway | `/reseaux-sociaux/roue-giveaway/` |

Une petite couche de gamification (XP, niveaux, succès, quête) est stockée uniquement dans le `localStorage` du navigateur.

## Développement

Prérequis : Node.js 18 ou plus. Aucune dépendance à installer.

```bash
node build.js        # génère le site dans dist/
node test.js         # vérifie SEO de base, liens internes, syntaxe JS
npx serve dist       # aperçu local sur http://localhost:3000
```

Pour changer le nom du site, le domaine ou l'e-mail : constante `SITE` en haut de `build.js`, ou `SITE_URL=https://mondomaine.fr node build.js`.

### Structure

```
build.js              générateur (en-tête/pied de page communs, sitemap, robots.txt)
test.js               tests de fumée
src/tools/*.html      interface + texte SEO + FAQ de chaque outil
src/pages/*.html      pages légales et à propos
src/assets/           CSS, JS (un fichier par outil + common.js), favicon
```

### Ajouter un outil

1. Ajouter une entrée dans `TOOLS` (`build.js`) : `key`, rubrique, `slug`, titre, description.
2. Créer `src/tools/<key>.html` (outil, puis texte d'explication avec des `<h3>` + `<p>` pour la FAQ, reprise en JSON-LD).
3. Créer `src/assets/js/<key>.js`.
4. `node build.js && node test.js`.

## Déploiement (Netlify, gratuit)

1. Sur netlify.com : *Add new site* → *Import from GitHub* → ce dépôt. La configuration est dans `netlify.toml` (commande `node build.js`, dossier `dist`).
2. Variable d'environnement : `SITE_URL` = l'adresse finale (par exemple `https://mondomaine.fr`) pour le sitemap et les balises canoniques.
3. Ajouter le nom de domaine dans *Domain management* ; HTTPS est automatique.

Les liens internes sont absolus (`/css/style.css`) : le site doit être servi à la racine d'un domaine. Ne pas utiliser l'adresse `github.io/<dépôt>/`.

## Avant la mise en ligne

- [ ] Remplir les champs entre crochets dans `src/pages/mentions-legales.html` et `confidentialite.html`.
- [ ] Remplacer le nom, le domaine et l'e-mail dans `build.js`, et le lien Ko-fi dans `src/pages/soutenir.html`.
- [ ] Brancher les statistiques (Umami, Plausible…) dans `loadTrackers()` de `src/assets/js/common.js` : elles ne se chargent qu'après consentement.
- [ ] Tester chaque outil sur téléphone, Chrome et Firefox.
- [ ] Déclarer le site dans Google Search Console et envoyer `sitemap.xml`.

Site indépendant, non affilié à Twitch, YouTube, TikTok, Instagram ou X.
