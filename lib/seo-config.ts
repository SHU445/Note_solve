/**
 * Configuration SEO centralisée
 * Modifiez cette URL avec votre URL de production Vercel
 */
export const SEO_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://note-solve.vercel.app',
  siteName: 'Problem Notes',
  siteDescription: 'Organisez vos idées, tâches et liens pour résoudre efficacement vos problèmes complexes. Interface moderne avec drag & drop, export/import JSON et sauvegarde automatique.',
  keywords: [
    'notes',
    'problèmes',
    'organisation',
    'productivité',
    'résolution',
    'brainstorming',
    'gestion de projet',
    'prise de notes',
    'markdown',
    'workspace',
  ] as string[],
  ogImage: '/og-image.png',
  twitterHandle: '@ProblemNotes',
};

