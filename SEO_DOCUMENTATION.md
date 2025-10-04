# Documentation SEO - Problem Notes

## 📋 Vue d'ensemble

L'application Problem Notes est maintenant optimisée pour le référencement avec :

- ✅ **Métadonnées complètes** (Open Graph, Twitter Cards, etc.)
- ✅ **Sitemap XML** généré automatiquement
- ✅ **Fichier robots.txt** configuré pour autoriser l'indexation par Google
- ✅ **Configuration centralisée** pour faciliter les mises à jour

## 🔧 Configuration

### 1. URL de base

La configuration SEO utilise une URL de base définie dans `lib/seo-config.ts`.

**Pour modifier l'URL de votre application :**

1. Créez un fichier `.env.local` à la racine du projet :
   ```env
   NEXT_PUBLIC_BASE_URL=https://votre-url.vercel.app
   ```

2. Ou modifiez directement le fichier `lib/seo-config.ts` :
   ```typescript
   export const SEO_CONFIG = {
     baseUrl: 'https://votre-url.vercel.app',
     // ...
   }
   ```

### 2. Métadonnées personnalisables

Dans `lib/seo-config.ts`, vous pouvez modifier :
- `siteName` : Nom de votre site
- `siteDescription` : Description pour les moteurs de recherche
- `keywords` : Mots-clés pour le SEO
- `twitterHandle` : Votre compte Twitter

## 📄 Fichiers générés

### Sitemap (`/sitemap.xml`)

Le sitemap est généré automatiquement à partir de `app/sitemap.ts` et inclut :
- Page d'accueil (priorité: 1.0, fréquence: hebdomadaire)
- Page workspace (priorité: 0.9, fréquence: quotidienne)

**Accès :** `https://votre-url.vercel.app/sitemap.xml`

### Robots.txt (`/robots.txt`)

Le fichier robots.txt est généré automatiquement à partir de `app/robots.ts` et configure :
- Autorisation d'indexation pour tous les robots (`*`)
- Autorisation spécifique pour Googlebot et Bingbot
- Blocage du dossier `/api/` (endpoints privés)
- Référence au sitemap XML

**Accès :** `https://votre-url.vercel.app/robots.txt`

## 🎯 Métadonnées implémentées

### Balises HTML de base
- `title` : Titre de la page avec template
- `description` : Description optimisée pour les moteurs de recherche
- `keywords` : Mots-clés pertinents
- `viewport` : Configuration responsive
- `themeColor` : Couleur de thème (clair/sombre)

### Open Graph (Facebook, LinkedIn, etc.)
- `og:type` : website
- `og:locale` : fr_FR
- `og:url` : URL canonique
- `og:site_name` : Nom du site
- `og:title` : Titre optimisé
- `og:description` : Description
- `og:image` : Image de prévisualisation (1200x630px)

### Twitter Cards
- `twitter:card` : summary_large_image
- `twitter:title` : Titre
- `twitter:description` : Description
- `twitter:image` : Image de prévisualisation
- `twitter:creator` : Compte Twitter

### Configuration des robots
- `index` : true (autoriser l'indexation)
- `follow` : true (suivre les liens)
- Configuration spécifique pour Googlebot (images, vidéos, snippets)

## 🖼️ Image Open Graph

Créez une image `public/og-image.png` avec les dimensions suivantes :
- **Taille recommandée :** 1200x630 pixels
- **Format :** PNG ou JPEG
- **Contenu :** Logo + titre de l'application + description visuelle

Vous pouvez utiliser des outils comme [Figma](https://figma.com), [Canva](https://canva.com) ou [OG Image Generator](https://og-image.vercel.app/) pour créer cette image.

## 🔍 Vérification

### 1. Vérifier le sitemap
```bash
# En développement
http://localhost:3000/sitemap.xml

# En production
https://votre-url.vercel.app/sitemap.xml
```

### 2. Vérifier le robots.txt
```bash
# En développement
http://localhost:3000/robots.txt

# En production
https://votre-url.vercel.app/robots.txt
```

### 3. Tester les métadonnées

**Outils recommandés :**
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

## 📊 Soumettre votre site aux moteurs de recherche

### Google Search Console
1. Accédez à [Google Search Console](https://search.google.com/search-console)
2. Ajoutez votre propriété (site web)
3. Soumettez votre sitemap : `https://votre-url.vercel.app/sitemap.xml`

### Bing Webmaster Tools
1. Accédez à [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Ajoutez votre site
3. Soumettez votre sitemap

## 🚀 Déploiement

Lors du déploiement sur Vercel :

1. Ajoutez la variable d'environnement `NEXT_PUBLIC_BASE_URL` dans les paramètres du projet
2. Next.js générera automatiquement le sitemap et robots.txt lors du build
3. Les fichiers seront accessibles à `/sitemap.xml` et `/robots.txt`

## 📝 Notes importantes

- Les métadonnées sont définies au niveau du layout racine (`app/layout.tsx`)
- Le sitemap est regénéré à chaque build
- Les URLs canoniques pointent vers votre URL de production
- Le fichier `robots.txt` autorise l'indexation de toutes les pages sauf `/api/`

## 🔄 Mise à jour

Pour ajouter de nouvelles pages au sitemap, modifiez `app/sitemap.ts` :

```typescript
return [
  // Pages existantes...
  {
    url: `${baseUrl}/nouvelle-page`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
]
```

---

**Dernière mise à jour :** Octobre 2025

