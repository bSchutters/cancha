export type GuideSection = { heading: string; body: string[] }
export type Guide = {
  slug: string
  title: string
  excerpt: string
  metaDescription: string
  readingMinutes: number
  sections: GuideSection[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'organiser-tournoi-futsal',
    title: 'Comment organiser un tournoi de futsal en 7 étapes',
    excerpt:
      'Un plan clair en 7 étapes pour organiser votre tournoi de futsal, des inscriptions au classement final, sans stress.',
    metaDescription:
      'Organisez votre tournoi de futsal en 7 étapes : inscriptions, format, terrains, planning, scores et remise des prix. Guide pratique pour organisateurs.',
    readingMinutes: 7,
    sections: [
      {
        heading: '1. Fixez le cadre avant tout le reste',
        body: [
          'Avant de penser aux matchs, posez les bases. Choisissez une date, réservez le lieu et définissez le nombre d’équipes que vous pouvez accueillir selon le nombre de terrains disponibles.',
          'Décidez aussi du public visé (jeunes, adultes, mixte, entreprises) et du prix d’inscription. Ces décisions conditionnent tout le reste de l’organisation.',
        ],
      },
      {
        heading: '2. Ouvrez les inscriptions',
        body: [
          'Une feuille de calcul partagée fonctionne, mais elle se remplit vite d’erreurs : doublons, noms manquants, paiements non suivis.',
          'Un formulaire d’inscription en ligne récupère directement les noms d’équipe, les contacts et la composition. Vous gardez une liste propre et vous savez en un coup d’œil combien d’équipes sont confirmées.',
        ],
      },
      {
        heading: '3. Choisissez le format de jeu',
        body: [
          'Pour le futsal, le format poules puis phase finale est le plus courant. Il garantit à chaque équipe plusieurs matchs, même en cas de défaite rapide.',
          'Comptez le temps disponible : avec des matchs courts (par exemple 2 fois 10 minutes), vous pouvez enchaîner beaucoup de rencontres dans une journée. Adaptez le nombre de poules au nombre d’équipes inscrites.',
        ],
      },
      {
        heading: '4. Préparez le tirage au sort',
        body: [
          'Un tirage transparent évite les contestations. Répartissez les équipes dans les poules de façon équilibrée, en séparant si besoin les favoris connus.',
          'Un tirage animé à l’écran, visible par tous, donne un côté officiel à l’événement et rassure les capitaines. Cancha gère cette étape automatiquement et affiche le résultat en direct.',
        ],
      },
      {
        heading: '5. Construisez le planning des terrains',
        body: [
          'C’est l’étape la plus chronophage à la main. Vous devez répartir les matchs sur plusieurs terrains, éviter qu’une équipe joue deux fois de suite et prévoir des temps de repos.',
          'Un générateur de planning calcule tout cela en quelques secondes et recale les horaires si un match prend du retard. Vous gagnez un temps considérable le jour J.',
        ],
      },
      {
        heading: '6. Suivez les scores et les classements en direct',
        body: [
          'Pendant le tournoi, l’encodage des scores doit être rapide. Désignez une personne par terrain ou laissez les arbitres saisir les résultats.',
          'Les classements de poule se mettent alors à jour automatiquement, avec le calcul des points et de la différence de buts. Plus besoin de recalculer un tableau entre chaque match.',
        ],
      },
      {
        heading: '7. Soignez la fin de journée',
        body: [
          'Affichez le tableau final sur un écran sur place pour que tout le monde suive la phase à élimination directe. L’ambiance monte d’un cran.',
          'Préparez la remise des prix à l’avance : le classement final est prêt dès le dernier coup de sifflet. Vous terminez la journée sur une note professionnelle, sans calcul de dernière minute.',
        ],
      },
    ],
  },
  {
    slug: 'formats-de-tournoi',
    title: 'Choisir le bon format de tournoi : poules, élimination directe ou mixte',
    excerpt:
      'Poules, élimination directe ou format mixte : comprenez les avantages de chaque option pour choisir celle qui convient à votre tournoi.',
    metaDescription:
      'Poules, élimination directe ou mixte : comparez les formats de tournoi selon le nombre d’équipes et le temps disponible. Guide clair pour bien choisir.',
    readingMinutes: 6,
    sections: [
      {
        heading: 'Pourquoi le format change tout',
        body: [
          'Le format détermine le nombre de matchs, la durée de la journée et l’expérience des participants. Un mauvais choix peut éliminer la moitié des équipes après un seul match, ou au contraire allonger l’événement jusqu’au soir.',
          'Trois grandes familles existent : les poules, l’élimination directe et le format mixte qui combine les deux. Le bon choix dépend surtout du nombre d’équipes et du temps dont vous disposez.',
        ],
      },
      {
        heading: 'L’élimination directe : rapide mais sec',
        body: [
          'Chaque équipe perdante quitte le tournoi. C’est le format le plus court et le plus facile à comprendre, idéal quand le temps est très limité.',
          'Son défaut : une équipe peut faire des centaines de kilomètres pour jouer dix minutes. Pour un tournoi convivial, c’est souvent frustrant. Réservez-le aux phases finales ou aux événements très serrés en temps.',
        ],
      },
      {
        heading: 'Les poules : tout le monde joue plusieurs fois',
        body: [
          'Chaque équipe rencontre toutes les autres de sa poule. C’est le format le plus équitable : un mauvais début ne condamne pas la journée.',
          'En contrepartie, il génère beaucoup de matchs. Avec de nombreuses équipes, prévoyez plusieurs poules en parallèle et assez de terrains pour tenir le rythme.',
        ],
      },
      {
        heading: 'Le format mixte : le meilleur des deux',
        body: [
          'On commence par des poules pour garantir plusieurs matchs à chacun, puis les mieux classés disputent une phase à élimination directe. C’est le format le plus répandu pour les tournois d’une journée.',
          'Il offre un bon équilibre entre équité et suspense : la phase finale crée de l’enjeu, sans pénaliser ceux qui démarrent mal.',
        ],
      },
      {
        heading: 'Comment décider concrètement',
        body: [
          'Partez du nombre d’équipes et du temps total disponible. Divisez le temps par la durée d’un match et le nombre de terrains pour estimer combien de rencontres tiennent dans la journée.',
          'Si le calcul devient compliqué, un outil comme Cancha simule le planning selon le format choisi et vous montre tout de suite si la journée tient dans les horaires. Vous ajustez avant l’événement, pas pendant.',
        ],
      },
    ],
  },
  {
    slug: 'checklist-jour-j',
    title: 'Réussir le jour J de votre tournoi : checklist de l’organisateur',
    excerpt:
      'La checklist complète de l’organisateur pour gérer le jour J sereinement, de l’accueil des équipes à la remise des prix.',
    metaDescription:
      'Checklist du jour J pour organiser un tournoi : accueil, terrains, scores, communication et imprévus. Le guide pratique de l’organisateur serein.',
    readingMinutes: 6,
    sections: [
      {
        heading: 'La veille : tout préparer à froid',
        body: [
          'Le calme de la veille vaut mieux que l’improvisation du matin. Vérifiez que le planning est complet, que le tirage est fait et que la liste des équipes est à jour.',
          'Préparez le matériel : ballons, chasubles, sifflets, affiches de poules, feuilles de match et le matériel d’affichage (écran ou projecteur). Chargez les appareils qui serviront à encoder les scores.',
        ],
      },
      {
        heading: 'L’accueil des équipes',
        body: [
          'Prévoyez un point d’accueil clair dès l’entrée. Cochez les présences, remettez le programme et indiquez les vestiaires et le terrain du premier match.',
          'Un accueil fluide donne le ton de la journée. Affichez le planning et les poules à un endroit visible pour que personne ne vienne vous demander son prochain match.',
        ],
      },
      {
        heading: 'Le rôle de chacun',
        body: [
          'Répartissez les tâches à l’avance : arbitres, responsable des scores, accueil, buvette. Chacun doit savoir ce qu’il fait sans venir vous le demander.',
          'Désignez une personne par terrain pour encoder les résultats. Si les scores remontent au fur et à mesure, les classements restent justes toute la journée.',
        ],
      },
      {
        heading: 'Garder le tournoi sur les rails',
        body: [
          'Le retard est l’ennemi principal. Surveillez les horaires et n’hésitez pas à raccourcir les pauses si un terrain prend du retard.',
          'Avec un planning numérique, vous voyez d’un coup d’œil quels matchs sont joués et lesquels suivent. Un écran affichant le planning et les scores en direct réduit fortement les questions et les flottements.',
        ],
      },
      {
        heading: 'Gérer les imprévus',
        body: [
          'Une équipe absente, une blessure, un terrain indisponible : prévoyez un plan B simple. Gardez quelques minutes de marge dans le planning pour absorber ces aléas.',
          'Notez les décisions importantes au moment où vous les prenez, pour rester cohérent si une situation similaire se représente plus tard dans la journée.',
        ],
      },
      {
        heading: 'La clôture',
        body: [
          'Dès le dernier match, le classement final doit être prêt. Si les scores ont été encodés au fil de l’eau, il n’y a plus rien à recalculer.',
          'Enchaînez avec la remise des prix tant que tout le monde est encore là. Pensez aussi à remercier les bénévoles et les sponsors : ce sont eux qui rendront possible la prochaine édition.',
        ],
      },
    ],
  },
]
