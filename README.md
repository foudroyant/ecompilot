# EcomPilot

Deux pages statiques pour un projet fictif : une landing page et un tableau de bord e-commerce, sans build ni framework.

- `index.html` — landing
- `dashboard.html` — tableau de bord

## Lancer en local

Aucune installation n'est nécessaire : ouvrez `index.html` dans un navigateur (les scripts sont classiques, pas des modules ES).

Pour un rendu identique à la mise en ligne, un petit serveur local suffit :

```bash
npx serve .
# ou
python -m http.server 8000
```

## Déployer

**Netlify** : glissez-déposez le dossier `ecompilot` sur l'interface Netlify, ou connectez le dépôt avec une commande de build vide et la racine comme dossier de publication.

**GitHub Pages** : poussez le contenu à la racine du dépôt, puis *Settings → Pages → Deploy from a branch → main / root*. Tous les chemins sont relatifs : le site fonctionne aussi dans un sous-dossier (`/ecompilot/`).

## Structure

```
ecompilot/
├── index.html
├── dashboard.html
├── site.webmanifest      # nom, couleurs, icônes PWA
├── css/styles.css        # tokens :root + composants + responsive
├── js/data.js            # source unique de vérité + contrôles de cohérence
├── js/icons.js           # icônes Lucide inline (trait 1.75)
├── js/chart.js           # courbe/aire et donut en SVG
├── js/ui.js              # statuts, toast, dialogues
├── js/landing.js         # navigation, aperçu du dashboard dans le hero
├── js/dashboard.js       # KPI, graphique, donut, tableau, recherche
├── assets/
│   ├── favicon.svg       # anneau + point, trait 8, sans arc menthe
│   ├── icon-192.svg
│   ├── icon-512.svg
│   └── img/
│       ├── hero.jpg
│       ├── livraison.jpg
│       └── produits.jpg
└── README.md
```

## Note de conception

### Concept

EcomPilot est un tableau de bord pour les boutiques en ligne d'Afrique francophone. Le parti pris n'est pas celui d'un outil « tech » froid : l'interface reste dense et précise, mais les matières sont chaudes (sable, bois, tissu) et la couleur de marque végétale, le vert forêt. Un gérant de boutique doit s'y reconnaître sans que l'interface tombe dans l'imagerie folklorique.

La landing montre l'application elle-même : le hero contient un aperçu du tableau de bord (chrome de navigateur, rail vert forêt, quatre KPI, courbe et donut), généré par le même moteur de graphique et les mêmes données que `dashboard.html`. Aucune maquette dessinée en dur, aucun chiffre inventé pour l'occasion.

### Sobriété de la landing

- Deux boutons d'action seulement : « Essai gratuit » dans le hero et dans le CTA final. Aucun bouton dans le header.
- Aucun emoji ni symbole ornemental dans les titres ou les paragraphes. Les séparateurs « · » ont été remplacés par des virgules ou des phrases. Les illustrations des modules sont des SVG dessinés dans la palette, jamais des émojis.
- Footer allégé : fond vert forêt, logo monochrome blanc, deux colonnes de liens et une ligne légale compacte.

### Logo

Le logo est construit à partir de l'icône de référence : arc extérieur vert forêt, arc intérieur menthe, point terracotta en haut à droite.

| Usage | Version |
|---|---|
| Fond clair (header, contenu) | Couleur : `#1F5C4A`, `#7BC4A4`, point `#D9703F` |
| Fond vert forêt (footer, rail du dashboard) | Monochrome blanc `#FBF8F3`, arc intérieur à 60 %, point blanc |
| Favicon 16–32 px | Anneau `#1F5C4A` trait 8, point `#D9703F` rayon 6, sans arc menthe |
| Icône d'application 192 / 512 | Carré vert forêt arrondi, icône blanche, marge de 20 % |

Règles respectées : zone de protection d'au moins la hauteur du point autour du logo, icône jamais en dessous de 24 px, logo horizontal jamais en dessous de 120 px, proportions conservées, aucune déformation.

Le mot « EcomPilot » est du texte HTML en Plus Jakarta Sans 800 (« Ecom » forêt, « Pilot » anthracite) plutôt qu'un tracé : il reste sélectionnable, net à toutes les tailles et suit les variantes monochromes. La hauteur de l'icône (26 px) est calée sur la hauteur des majuscules du mot (× 1,4).

### Palette

| Rôle | Hex | Usage |
|---|---|---|
| Vert forêt | `#1F5C4A` | Marque, sidebar, boutons primaires, courbe |
| Vert menthe | `#7BC4A4` | Aires de graphique, pastilles, accents |
| Terracotta | `#D9703F` | Statut « en attente », accents |
| Sable | `#F4EBDD` | Sections alternées de la landing |
| Blanc cassé | `#FBF8F3` | Surface générale |
| Anthracite | `#1E2420` | Texte principal |
| Gris chaud | `#6B6A63` | Libellés et légendes |
| Vert succès | `#2E8B57` | Pastille « livrée » |
| Rouge erreur | `#B23A3A` | Erreurs de formulaire |

Trois encres dérivées ont été ajoutées parce que les couleurs brutes ne passent pas le contraste 4,5:1 en texte normal :

- `--success-ink: #217046` (5,7:1) pour le libellé « Livrée » ; la pastille garde `#2E8B57` ;
- `--clay-ink: #A8492A` (5,4:1) pour le libellé « En attente » ;
- `--mint-tint` (menthe très claire) pour l'item actif de la sidebar et les fonds de badges ; le menthe plein reste réservé aux aplats non textuels.

### Typographie

Plus Jakarta Sans (700/800) pour les titres et les chiffres KPI, Inter (400/500/600) pour le texte et l'interface. Les montants utilisent `font-variant-numeric: tabular-nums` et une espace insécable (`U+00A0`) avant `FCFA`, y compris dans les tableaux et les infobulles. Grille d'espacement de 8 px.

### Structure des pages

- **Landing** : navigation sticky → hero (titre, sous-titre, aperçu du dashboard) → 4 modules illustrés (Commandes, Livraisons, Produits, Statistiques) avec `livraison.jpg` → catalogue avec `produits.jpg` et quatre références → témoignages → CTA sur `hero.jpg` → footer vert forêt.
- **Dashboard** : sidebar (vert forêt, item actif en menthe clair) → en-tête → 4 KPI → graphique 2/3 + donut 1/3 → tableau. La recherche filtre réellement les lignes, les pilules 7 j / 30 j / 12 mois changent la série, la modale « Nouvelle commande » affiche un toast sans modifier les données.

### Images et illustrations

Trois visuels fournis, tous en `assets/img/` :

- `livraison.jpg` (1:1) : section « Fonctionnalités » ;
- `produits.jpg` (1:1) : section « Catalogue » ;
- `hero.jpg` (16:9) : arrière-plan du CTA final, sous un dégradé vert forêt.

Les quatre modules de la landing sont présentés explicitement : un titre, une phrase de rôle, deux capacités concrètes et une illustration SVG propre à chaque métier (liste de commandes, tournée de livraison, stocks produits, courbe de ventes). Aucun émoji n'est utilisé comme illustration.

Les deux images 1:1 sont cadrées dans des conteneurs à hauteur maîtrisée (ratio 16/9 sur tablette, hauteur fixe pour le catalogue) avec `object-fit: cover` : elles ne s'étirent plus en colonnes trop hautes. `hero.jpg` contient une fausse interface avec des chiffres illisibles ; elle reste donc en arrière-plan flouté par le dégradé et ne sert pas d'aperçu principal.

### Cohérence des données

- Somme des 30 ventes quotidiennes = **3 850 000 FCFA** (valeurs multiples de 5 000).
- **385 livrées + 75 en attente + 60 en cours = 520 reçues**.
- 385 / 520 = 74,04 % → « 74 % du total ».
- Parts du donut : 74 % + 12 % + 14 % = 100 % ; « Annulée » figure à 0, en gris.
- CA : novembre (3 850 000) contre octobre (3 440 000) = **+11,9 %**, affiché « +12 % ».
- Commandes : 520 contre 482 = **+7,9 %**, affiché « +8 % ».
- `js/data.js` contient `ECOM.check()`, qui vérifie ces égalités en console.

### Accessibilité et performance

Navigation clavier, focus visible, lien d'évitement, `aria-current`, `aria-pressed` sur les pilules, infobulle du graphique accessible avec les flèches (et résumé `aria-label`), tableau avec `caption` et `scope`, textes alternatifs, contrastes vérifiés, `prefers-reduced-motion`. Aucune librairie, une seule feuille de style, icônes SVG inline, polices en `display=swap`.

### Outils

Éditeur de texte et navigateur. Aucune dépendance de build.
