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
    h1: 'Votre tournoi de football, organisé sans Excel',
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
      'Des poules à la phase finale, Cup Generator répartit les matchs sur vos terrains, calcule les classements et affiche tout en direct sur place.',
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
    a: 'Vous payez un petit montant par équipe inscrite : pas d’abonnement, pas de frais d’installation, et vous ne payez que si votre tournoi a lieu. Contactez-nous pour une estimation adaptée à votre tournoi.',
  },
  {
    q: 'Les équipes et le public peuvent-ils suivre en direct ?',
    a: 'Oui. Chaque tournoi a une page publique avec scores et classements en temps réel, et un mode TV pour l’affichage sur place.',
  },
  {
    q: 'Mes données sont-elles en sécurité ?',
    a: 'Les données de votre tournoi vous appartiennent et sont isolées par organisateur. Nous ne les revendons pas et respectons le RGPD.',
  },
]

export type ComparisonRow = { criterion: string; excel: string; generic: string; cupgenerator: string }

export const COMPARISON_INTRO =
  'Beaucoup d’organisateurs gèrent encore leur tournoi sur Excel et papier, ou avec un outil généraliste. Voici comment ces approches se comparent à Cup Generator sur les tâches qui comptent vraiment.'

export const COMPARISON: ComparisonRow[] = [
  { criterion: 'Inscriptions en ligne', excel: 'Saisie manuelle, erreurs fréquentes', generic: 'Formulaire de base', cupgenerator: 'Formulaire dédié, liste centralisée' },
  { criterion: 'Tirage au sort', excel: 'À faire à la main', generic: 'Rarement intégré', cupgenerator: 'Tirage animé, affiché en direct' },
  { criterion: 'Planning multi-terrains', excel: 'Très long à construire', generic: 'Souvent limité', cupgenerator: 'Généré automatiquement' },
  { criterion: 'Recalcul après retard', excel: 'Tout reprendre à la main', generic: 'Variable selon l’outil', cupgenerator: 'Horaires recalés en un clic' },
  { criterion: 'Scores et classements', excel: 'Formules fragiles, erreurs de calcul', generic: 'Mise à jour manuelle', cupgenerator: 'Classements en direct, automatiques' },
  { criterion: 'Affichage sur place', excel: 'Non prévu', generic: 'Rarement disponible', cupgenerator: 'Écran TV et tableau live' },
  { criterion: 'Gestion des arbitres', excel: 'Sur papier', generic: 'Peu adapté', cupgenerator: 'Saisie des scores par terrain' },
  { criterion: 'Sponsors et marque', excel: 'Aucun', generic: 'Limité', cupgenerator: 'Logos et couleurs personnalisés' },
  { criterion: 'Prise en main', excel: 'Familier mais laborieux', generic: 'Courbe d’apprentissage variable', cupgenerator: 'Pensé pour les organisateurs' },
  { criterion: 'Coût', excel: 'Gratuit mais chronophage', generic: 'Souvent un abonnement', cupgenerator: 'Par équipe, sans abonnement' },
]

export type Testimonial = { quote: string; name: string; role: string; org: string }

// Empty until real reviews are collected (pre-launch). While empty, the
// Testimonials section shows an honest "premiers organisateurs" offer instead.
export const TESTIMONIALS: Testimonial[] = []

// Public contact address: lead-form fallback + footer. TODO: confirm the real inbox.
export const CONTACT_EMAIL = 'contact@cupgenerator.be'

// Pricing model: pay-per-team (no subscription, no upfront). No hard rate is shown
// here yet; it is intentionally left to a quote until the exact amount is fixed.
export const PRICING_POINTS = [
  { title: 'Sans abonnement', desc: 'Aucun frais mensuel, aucun engagement dans la durée.' },
  { title: 'Sans frais d’installation', desc: 'Créer et configurer votre tournoi est gratuit.' },
  { title: 'Vous payez à l’usage', desc: 'Un montant par équipe inscrite, uniquement si votre tournoi a lieu.' },
]

export const PRICING_STEPS = [
  { title: 'Créez votre tournoi', desc: 'Configuration, format et page publique : gratuit, sans carte bancaire.' },
  { title: 'Les équipes s’inscrivent', desc: 'Vous suivez les inscriptions et validez les équipes en temps réel.' },
  { title: 'Vous payez par équipe', desc: 'Un montant par équipe confirmée, dégressif selon le volume.' },
]

// Pay-per-team, degressive (marginal rate per bracket). The total is always
// shown up front (see the estimator) so there is no "meter" anxiety.
export const PRICE_TIERS: { from: number; to: number | null; rate: number }[] = [
  { from: 1, to: 8, rate: 5 },
  { from: 9, to: 16, rate: 4 },
  { from: 17, to: 32, rate: 3 },
  { from: 33, to: null, rate: 2 },
]

/** Lifetime discount for the first "founding" organizers. */
export const FOUNDER_DISCOUNT = 0.3

/** Total price for a tournament of `teams` teams (degressive per-team). */
export function priceForTeams(teams: number): number {
  let total = 0
  let prev = 0
  for (const t of PRICE_TIERS) {
    const cap = t.to ?? teams
    if (teams <= prev) break
    total += (Math.min(teams, cap) - prev) * t.rate
    prev = cap
  }
  return total
}
