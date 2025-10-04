# Problem Notes

Application web moderne de prise de notes et de résolution de problèmes, construite avec Next.js 15 et React 19.

## 🚀 Fonctionnalités

- 📝 **Notes Markdown** : Créez des notes riches avec support complet du Markdown
- ✅ **Tâches** : Gérez vos tâches avec des sous-tâches
- 🔗 **Liens** : Organisez vos liens importants
- 📁 **Groupes** : Organisez vos éléments par groupes
- 🎯 **Drag & Drop** : Interface intuitive avec glisser-déposer
- 💾 **Sauvegarde automatique** : Vos données sont sauvegardées localement
- 📤 **Export/Import JSON** : Sauvegardez et partagez vos sessions
- 🔍 **Recherche en temps réel** : Trouvez rapidement vos notes
- 🎨 **Interface moderne** : Design responsive et élégant
- ⌨️ **Raccourcis clavier** : Workflow optimisé

## 🛠️ Installation

Installez les dépendances :

```bash
npm install
```

## 🏃 Démarrage

Lancez le serveur de développement :

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🔍 Optimisation SEO

L'application est entièrement optimisée pour le référencement :

- ✅ **Métadonnées complètes** (Open Graph, Twitter Cards, etc.)
- ✅ **Sitemap XML** automatiquement généré
- ✅ **Fichier robots.txt** configuré pour l'indexation Google
- ✅ **Configuration centralisée** et personnalisable

### Configuration de l'URL de base

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_BASE_URL=https://votre-url.vercel.app
```

Pour plus de détails, consultez la [Documentation SEO complète](./SEO_DOCUMENTATION.md).

## 📚 Technologies utilisées

- **Next.js 15** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utility-first
- **dnd-kit** - Drag & drop moderne
- **Zustand** - Gestion d'état légère
- **React Markdown** - Rendu Markdown
- **Lucide React** - Icônes modernes

## ⌨️ Raccourcis clavier

- `Ctrl+N` : Créer une nouvelle note
- `Ctrl+T` : Créer une nouvelle tâche
- `Ctrl+L` : Créer un nouveau lien
- `Ctrl+G` : Créer un nouveau groupe
- `/` : Activer la recherche
- `Suppr` : Supprimer l'élément sélectionné
- `Échap` : Désélectionner l'élément

## 📖 En savoir plus

Pour en savoir plus sur Next.js :

- [Documentation Next.js](https://nextjs.org/docs)
- [Tutoriel interactif Next.js](https://nextjs.org/learn)

## 🚀 Déploiement sur Vercel

Le moyen le plus simple de déployer votre application est d'utiliser la [plateforme Vercel](https://vercel.com/new).

1. Poussez votre code sur GitHub
2. Importez votre projet dans Vercel
3. Ajoutez la variable d'environnement `NEXT_PUBLIC_BASE_URL`
4. Déployez !

Consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.

## 📄 Licence

Ce projet est sous licence MIT.

---

Fait avec ❤️ par l'équipe Problem Notes
