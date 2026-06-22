// Shared marketing content. Per-sport and per-profile pages are data-driven from
// here (one template, many SEO pages). Keep intros distinct to avoid duplicate
// content across pages.

export type SportContent = {
  slug: string
  name: string
  eyebrow: string
  h1: string
  intro: string
}

export const SPORTS: SportContent[] = [
  {
    slug: 'futsal',
    name: 'Futsal',
    eyebrow: 'Logiciel de tournoi de futsal',
    h1: 'Gérez votre tournoi de futsal, du tirage au trophée',
    intro:
      'Poules, calendrier multi-terrains, phase finale et classements en direct : Cup Generator gère votre tournoi de futsal de l’inscription des équipes au coup de sifflet final.',
  },
  {
    slug: 'football',
    name: 'Football',
    eyebrow: 'Logiciel de tournoi de football',
    h1: 'Votre tournoi de football, organisé sans tableur',
    intro:
      'Foot à 5, à 7 ou à 11 : créez vos poules, générez le calendrier sur plusieurs terrains et suivez scores et classements en temps réel, sur une seule plateforme.',
  },
  {
    slug: 'padel',
    name: 'Padel',
    eyebrow: 'Logiciel de tournoi de padel',
    h1: 'Organisez votre tournoi de padel sans prise de tête',
    intro:
      'Inscriptions des paires, tirage des poules, planning des courts et tableau final : tout est automatisé pour que vous profitiez du tournoi au lieu de gérer un fichier Excel.',
  },
  {
    slug: 'volley',
    name: 'Volley-ball',
    eyebrow: 'Logiciel de tournoi de volley',
    h1: 'Votre tournoi de volley, géré de A à Z',
    intro:
      'Des poules à la phase finale, Cup Generator répartit les matchs sur vos terrains, calcule les classements et affiche tout en direct dans la salle.',
  },
  {
    slug: 'basket',
    name: 'Basket',
    eyebrow: 'Logiciel de tournoi de basket',
    h1: 'Organisez votre tournoi de basket en quelques clics',
    intro:
      'Inscriptions en ligne, tirage au sort, calendrier multi-terrains et classements automatiques : concentrez-vous sur le jeu, la plateforme s’occupe de la logistique.',
  },
  {
    slug: 'ping-pong',
    name: 'Ping-pong',
    eyebrow: 'Logiciel de tournoi de ping-pong',
    h1: 'Votre tournoi de tennis de table, simplifié',
    intro:
      'Poules, tableaux et classements se génèrent automatiquement. Saisissez les scores, l’affichage et le classement final se mettent à jour en direct.',
  },
]

export type ProfileContent = {
  slug: string
  name: string
  eyebrow: string
  h1: string
  intro: string
  bullets: string[]
}

export const PROFILES: ProfileContent[] = [
  {
    slug: 'clubs',
    name: 'Clubs sportifs',
    eyebrow: 'Cup Generator pour les clubs',
    h1: 'L’outil de tournoi pensé pour les clubs',
    intro:
      'Montez votre tournoi annuel sans y passer vos soirées. Tirage, calendrier et classements automatisés, et une page publique aux couleurs du club.',
    bullets: [
      'Page publique et affichage TV aux couleurs de votre club',
      'Gestion des sponsors visibles sur chaque page',
      'Inscriptions en ligne avec validation et capacité',
    ],
  },
  {
    slug: 'comites',
    name: 'Comités des fêtes',
    eyebrow: 'Cup Generator pour les comités des fêtes',
    h1: 'Le tournoi du village, clé en main',
    intro:
      'Pas besoin d’être informaticien : si vous savez remplir un formulaire, vous savez organiser votre tournoi. On vous accompagne pour le premier.',
    bullets: [
      'Mise en place en quelques minutes, sans compétence technique',
      'Tirage au sort animé à projeter sur grand écran',
      'Résultats en direct pour le public et les équipes',
    ],
  },
  {
    slug: 'ecoles',
    name: 'Écoles de jeunes',
    eyebrow: 'Cup Generator pour les écoles de jeunes',
    h1: 'Des tournois de jeunes parfaitement organisés',
    intro:
      'Gérez de nombreuses équipes sur plusieurs terrains sans erreur de planning, et tenez parents et coachs informés en temps réel.',
    bullets: [
      'Calendrier multi-terrains pour faire jouer tout le monde',
      'Classement fair-play en plus des résultats sportifs',
      'Page publique consultable par les parents',
    ],
  },
  {
    slug: 'entreprises',
    name: 'Entreprises',
    eyebrow: 'Cup Generator pour les entreprises',
    h1: 'Votre tournoi inter-entreprises, sans logistique',
    intro:
      'Team building ou tournoi caritatif : lancez les inscriptions, laissez la plateforme gérer le déroulé et offrez une vraie expérience aux participants.',
    bullets: [
      'Inscriptions en ligne pour les équipes internes',
      'Affichage TV pour animer la journée',
      'Sponsors et logo de l’entreprise sur chaque page',
    ],
  },
]

export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Pour quels sports Cup Generator fonctionne-t-il ?',
    a: 'Tous les sports qui se jouent en poules puis en phase finale : football, futsal, padel, volley, basket, ping-pong, pétanque… Le format est entièrement configurable.',
  },
  {
    q: 'Faut-il des compétences techniques ?',
    a: 'Non. Si vous savez remplir un formulaire, vous savez créer votre tournoi. On vous accompagne gratuitement pour la mise en place du premier.',
  },
  {
    q: 'Combien de temps pour mettre en place un tournoi ?',
    a: 'Quelques minutes pour la configuration. Les équipes s’inscrivent ensuite en ligne, et le tirage comme le calendrier se génèrent automatiquement.',
  },
  {
    q: 'Combien ça coûte ?',
    a: 'Cup Generator est en lancement : la mise en place de vos premiers tournois est gratuite. Contactez-nous pour une démo et une offre adaptée à votre événement.',
  },
  {
    q: 'Les équipes et le public peuvent-ils suivre en direct ?',
    a: 'Oui. Chaque tournoi a une page publique avec scores et classements en temps réel, et un mode TV pour l’affichage en salle.',
  },
  {
    q: 'Mes données sont-elles en sécurité ?',
    a: 'Les données de votre tournoi vous appartiennent et sont isolées par organisateur. Nous ne les revendons pas et respectons le RGPD.',
  },
]

export type ComparisonRow = { criterion: string; excel: string; generic: string; cupgenerator: string }

export const COMPARISON_INTRO =
  'Beaucoup d’organisateurs gèrent encore leur tournoi sur tableur ou avec un outil généraliste. Voici comment ces approches se comparent à Cup Generator sur les tâches qui comptent vraiment.'

export const COMPARISON: ComparisonRow[] = [
  { criterion: 'Inscriptions en ligne', excel: 'Saisie manuelle, erreurs fréquentes', generic: 'Formulaire de base', cupgenerator: 'Formulaire dédié, liste centralisée' },
  { criterion: 'Tirage au sort', excel: 'À faire à la main', generic: 'Rarement intégré', cupgenerator: 'Tirage animé, affiché en direct' },
  { criterion: 'Planning multi-terrains', excel: 'Très long à construire', generic: 'Souvent limité', cupgenerator: 'Généré automatiquement' },
  { criterion: 'Recalcul après retard', excel: 'Tout reprendre à la main', generic: 'Variable selon l’outil', cupgenerator: 'Horaires recalés en un clic' },
  { criterion: 'Scores et classements', excel: 'Formules fragiles, erreurs de calcul', generic: 'Mise à jour manuelle', cupgenerator: 'Classements en direct, automatiques' },
  { criterion: 'Affichage en salle', excel: 'Non prévu', generic: 'Rarement disponible', cupgenerator: 'Écran TV et tableau live' },
  { criterion: 'Gestion des arbitres', excel: 'Sur papier', generic: 'Peu adapté', cupgenerator: 'Saisie des scores par terrain' },
  { criterion: 'Sponsors et marque', excel: 'Aucun', generic: 'Limité', cupgenerator: 'Logos et couleurs personnalisés' },
  { criterion: 'Prise en main', excel: 'Familier mais laborieux', generic: 'Courbe d’apprentissage variable', cupgenerator: 'Pensé pour les organisateurs' },
]

export type Testimonial = { quote: string; name: string; role: string; org: string }

// PLACEHOLDERS : témoignages fictifs à remplacer par de vrais avis avant le lancement
// (produit en pré-lancement, aucun client réel à ce jour).
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Le planning des terrains, qui me prenait une soirée entière sur Excel, était prêt en quelques minutes. Un vrai soulagement.',
    name: 'Julien Lemmens',
    role: 'Responsable du tournoi',
    org: 'FC Sporting Wavre',
  },
  {
    quote:
      'Le tirage animé sur grand écran a impressionné les capitaines. Notre tournoi a tout de suite eu un côté professionnel.',
    name: 'Sophie Delvaux',
    role: 'Membre du comité des fêtes',
    org: 'Comité des fêtes de Gembloux',
  },
  {
    quote:
      'Les classements se mettaient à jour tout seuls. Plus de calculs de dernière minute, la remise des prix a été immédiate.',
    name: 'Thomas Bauwens',
    role: 'Coordinateur jeunes',
    org: 'Académie de Jodoigne',
  },
]

export const PRICING = [
  {
    name: 'Lancement',
    price: 'Gratuit',
    tagline: 'Pour vos premiers tournois',
    features: [
      'Toutes les fonctionnalités',
      'Mise en place accompagnée',
      'Page publique + affichage TV',
      'Support par email',
    ],
    highlighted: true,
  },
  {
    name: 'Club',
    price: 'Sur devis',
    tagline: 'Pour les organisateurs réguliers',
    features: [
      'Tournois illimités',
      'Marque et domaine personnalisés',
      'Gestion des sponsors',
      'Accompagnement prioritaire',
    ],
    highlighted: false,
  },
  {
    name: 'Sur mesure',
    price: 'Contact',
    tagline: 'Fédérations, salles, événements',
    features: [
      'Volume et besoins spécifiques',
      'Intégrations dédiées',
      'Formation des équipes',
      'Accord cadre',
    ],
    highlighted: false,
  },
]
