import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DesignNav } from '../design-nav'

// Isolated direction gallery: many distinct design DIRECTIONS for the public
// tournament view, generated from ui-ux-pro-max styles and framed with
// taste-skill's "Design Read" discipline. Each card has its own palette, fonts,
// radius, borders, shadows and effect — structure, not just color. Palettes are
// scoped per card via inline CSS vars; nothing here touches globals.css or the
// per-tenant theme. Kept out of search indexes.
export const metadata: Metadata = {
  title: 'Design directions',
  robots: { index: false, follow: false },
}

const STAND = [
  { r: 1, n: 'Real Futsal', p: 9, q: true },
  { r: 2, n: 'AS Tonnerre', p: 6, q: true },
  { r: 3, n: 'Les Lynx', p: 3, q: false },
]

type Effect = 'none' | 'glass' | 'aurora' | 'neu' | 'y2k' | 'skeu'
type Dir = {
  key: string
  name: string
  read: string // taste-skill "Design Read"
  vars: CSSProperties
  border: 'hair' | 'normal' | 'thick' | 'thickInk'
  shadow: 'none' | 'soft' | 'hard' | 'glow'
  caps?: boolean
  serifTitle?: boolean
  rotate?: boolean
  dashed?: boolean
  titleSize?: string
  effect?: Effect
  surface?: string // outer screen background classes (gradients etc.)
  surfaceStyle?: CSSProperties // inline overlay (scanlines, dot grid, …)
}

const v = (o: Record<string, string>) => o as CSSProperties

const DIRS: Dir[] = [
  {
    key: 'navy',
    name: 'Vibrant Bloc (actuel)',
    read: 'app sport grand public, langage énergique en blocs, Barlow condensé + bleu franc.',
    border: 'normal',
    shadow: 'soft',
    caps: true,
    vars: v({
      '--background': '#F1F5F9', '--foreground': '#020617', '--card': '#FFFFFF', '--card-foreground': '#0F172A',
      '--primary': '#0369A1', '--primary-foreground': '#FFFFFF', '--muted': '#EEF2F7', '--muted-foreground': '#64748B',
      '--accent': '#0369A1', '--accent-foreground': '#FFFFFF', '--border': '#E2E8F0', '--ring': '#0369A1',
      '--radius': '0.9rem', '--font-heading': "'Barlow Condensed', sans-serif", '--font-body': "'Barlow', sans-serif",
    }),
  },
  {
    key: 'editorial',
    name: 'Éditorial',
    read: 'magazine sportif, langage presse raffiné, grand serif + filets fins, noir & rose.',
    border: 'hair',
    shadow: 'none',
    caps: true,
    serifTitle: true,
    vars: v({
      '--background': '#FAFAFA', '--foreground': '#09090B', '--card': '#FFFFFF', '--card-foreground': '#09090B',
      '--primary': '#18181B', '--primary-foreground': '#FFFFFF', '--muted': '#E8ECF0', '--muted-foreground': '#52525B',
      '--accent': '#EC4899', '--accent-foreground': '#FFFFFF', '--border': '#D4D4D8', '--ring': '#18181B',
      '--radius': '0.125rem', '--font-heading': "'Libre Bodoni', serif", '--font-body': "'Public Sans', sans-serif",
    }),
  },
  {
    key: 'broadcast',
    name: 'Broadcast (sombre)',
    read: 'diffusion TV/ESPN, langage dense & cinétique, surface sombre + rouge live.',
    border: 'normal',
    shadow: 'glow',
    caps: true,
    vars: v({
      '--background': '#0B1220', '--foreground': '#F8FAFC', '--card': '#131C2B', '--card-foreground': '#F8FAFC',
      '--primary': '#DC2626', '--primary-foreground': '#FFFFFF', '--muted': '#1E293B', '--muted-foreground': '#94A3B8',
      '--accent': '#DC2626', '--accent-foreground': '#FFFFFF', '--border': 'rgba(255,255,255,0.10)', '--ring': '#DC2626',
      '--radius': '0.375rem', '--font-heading': "'Inter', sans-serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'clay',
    name: 'Clay ludique',
    read: 'tournoi communautaire/jeunes, langage doux & chunky, indigo + orange, Fredoka.',
    border: 'thick',
    shadow: 'soft',
    vars: v({
      '--background': '#EEF2FF', '--foreground': '#1E1B4B', '--card': '#FFFFFF', '--card-foreground': '#1E1B4B',
      '--primary': '#4F46E5', '--primary-foreground': '#FFFFFF', '--muted': '#E0E7FF', '--muted-foreground': '#6366F1',
      '--accent': '#EA580C', '--accent-foreground': '#FFFFFF', '--border': '#C7D2FE', '--ring': '#4F46E5',
      '--radius': '1.5rem', '--font-heading': "'Fredoka', sans-serif", '--font-body': "'Nunito', sans-serif",
    }),
  },
  {
    key: 'swiss',
    name: 'Swiss Modernism',
    read: 'institutionnel/fédération, langage grille suisse, noir & blanc + 1 accent, 0 arrondi.',
    border: 'hair',
    shadow: 'none',
    caps: true,
    vars: v({
      '--background': '#FFFFFF', '--foreground': '#000000', '--card': '#FFFFFF', '--card-foreground': '#000000',
      '--primary': '#FF3B00', '--primary-foreground': '#FFFFFF', '--muted': '#F5F5F5', '--muted-foreground': '#525252',
      '--accent': '#FF3B00', '--accent-foreground': '#FFFFFF', '--border': '#111111', '--ring': '#FF3B00',
      '--radius': '0rem', '--font-heading': "'Inter', sans-serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'brutalism',
    name: 'Brutalisme',
    read: 'contre-culture/portfolio, langage brut, bordures noires épaisses, ombres dures, 0 transition.',
    border: 'thickInk',
    shadow: 'hard',
    caps: true,
    vars: v({
      '--background': '#FFFFFF', '--foreground': '#000000', '--card': '#FFFFFF', '--card-foreground': '#000000',
      '--primary': '#0000FF', '--primary-foreground': '#FFFFFF', '--muted': '#FFFF00', '--muted-foreground': '#000000',
      '--accent': '#FF0000', '--accent-foreground': '#FFFFFF', '--border': '#000000', '--ring': '#000000',
      '--radius': '0rem', '--font-heading': "'Archivo Black', sans-serif", '--font-body': "'Space Mono', monospace",
    }),
  },
  {
    key: 'neo',
    name: 'Neo-Brutalisme',
    read: 'marque Gen Z, langage sticker-book, crème + rouge/jaune, cartes inclinées, ombres dures.',
    border: 'thickInk',
    shadow: 'hard',
    caps: true,
    vars: v({
      '--background': '#FFFDF5', '--foreground': '#1A1A1A', '--card': '#FFFFFF', '--card-foreground': '#1A1A1A',
      '--primary': '#FF5470', '--primary-foreground': '#FFFFFF', '--muted': '#FFF3D6', '--muted-foreground': '#6B6B6B',
      '--accent': '#FFD93D', '--accent-foreground': '#1A1A1A', '--border': '#1A1A1A', '--ring': '#1A1A1A',
      '--radius': '0.7rem', '--font-heading': "'Space Grotesk', sans-serif", '--font-body': "'Space Grotesk', sans-serif",
    }),
  },
  {
    key: 'glass',
    name: 'Glassmorphism',
    read: 'app lifestyle premium, langage verre dépoli sur dégradé vibrant, profondeur.',
    border: 'normal',
    shadow: 'none',
    effect: 'glass',
    surface: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500',
    vars: v({
      '--background': 'transparent', '--foreground': '#FFFFFF', '--card': 'rgba(255,255,255,0.15)', '--card-foreground': '#FFFFFF',
      '--primary': '#FFFFFF', '--primary-foreground': '#3B0764', '--muted': 'rgba(255,255,255,0.15)', '--muted-foreground': 'rgba(255,255,255,0.75)',
      '--accent': '#FFFFFF', '--accent-foreground': '#3B0764', '--border': 'rgba(255,255,255,0.30)', '--ring': '#FFFFFF',
      '--radius': '1rem', '--font-heading': "'Inter', sans-serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'neu',
    name: 'Soft UI (Neumorphism)',
    read: 'app bien-être/sport doux, langage relief tactile, monochrome bleuté, ombres doubles.',
    border: 'normal',
    shadow: 'none',
    effect: 'neu',
    vars: v({
      '--background': '#E4E9F0', '--foreground': '#31435A', '--card': '#E4E9F0', '--card-foreground': '#31435A',
      '--primary': '#5B7CFA', '--primary-foreground': '#FFFFFF', '--muted': '#E4E9F0', '--muted-foreground': '#7B89A0',
      '--accent': '#5B7CFA', '--accent-foreground': '#FFFFFF', '--border': '#E4E9F0', '--ring': '#5B7CFA',
      '--radius': '1.25rem', '--font-heading': "'Nunito', sans-serif", '--font-body': "'Nunito', sans-serif",
    }),
  },
  {
    key: 'y2k',
    name: 'Y2K / Chrome',
    read: 'marque jeunesse/nostalgie, langage chrome glossy, rose néon + cyan, Orbitron.',
    border: 'normal',
    shadow: 'soft',
    caps: true,
    effect: 'y2k',
    surface: 'bg-gradient-to-b from-zinc-200 to-zinc-400',
    vars: v({
      '--background': 'transparent', '--foreground': '#1A1A2E', '--card': 'rgba(255,255,255,0.8)', '--card-foreground': '#1A1A2E',
      '--primary': '#FF1493', '--primary-foreground': '#FFFFFF', '--muted': '#E2E8F0', '--muted-foreground': '#475569',
      '--accent': '#06B6D4', '--accent-foreground': '#06243A', '--border': '#C0C0C0', '--ring': '#FF1493',
      '--radius': '0.9rem', '--font-heading': "'Orbitron', sans-serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'oled',
    name: 'Luxe OLED',
    read: 'tournoi premium/finale de gala, langage sombre élégant, noir absolu + or, serif.',
    border: 'hair',
    shadow: 'glow',
    serifTitle: true,
    vars: v({
      '--background': '#000000', '--foreground': '#FFFFFF', '--card': '#0E0E10', '--card-foreground': '#FFFFFF',
      '--primary': '#D4AF37', '--primary-foreground': '#1A1A1A', '--muted': '#161616', '--muted-foreground': '#A1A1AA',
      '--accent': '#D4AF37', '--accent-foreground': '#1A1A1A', '--border': 'rgba(255,255,255,0.10)', '--ring': '#D4AF37',
      '--radius': '0.5rem', '--font-heading': "'Cormorant Garamond', serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'aurora',
    name: 'Aurora UI',
    read: 'app premium lifestyle, langage dégradés fluides + profondeur, magenta/cyan.',
    border: 'normal', shadow: 'none', effect: 'aurora',
    surface: 'bg-gradient-to-br from-[#0080FF] via-[#7C3AED] to-[#FF1493]',
    vars: v({
      '--background': 'transparent', '--foreground': '#FFFFFF', '--card': 'rgba(255,255,255,0.12)', '--card-foreground': '#FFFFFF',
      '--primary': '#FF1493', '--primary-foreground': '#FFFFFF', '--muted': 'rgba(255,255,255,0.15)', '--muted-foreground': 'rgba(255,255,255,0.8)',
      '--accent': '#00FFFF', '--accent-foreground': '#06243A', '--border': 'rgba(255,255,255,0.30)', '--ring': '#FFFFFF',
      '--radius': '1.25rem', '--font-heading': "'Outfit', sans-serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'vaporwave',
    name: 'Vaporwave',
    read: 'marque jeunesse/musique, langage néon rétro, rose/cyan sur dégradé, Orbitron.',
    border: 'normal', shadow: 'none', caps: true, effect: 'glass',
    surface: 'bg-gradient-to-br from-[#B967FF] via-[#FF71CE] to-[#01CDFE]',
    vars: v({
      '--background': 'transparent', '--foreground': '#FFFFFF', '--card': 'rgba(255,255,255,0.10)', '--card-foreground': '#FFFFFF',
      '--primary': '#FF71CE', '--primary-foreground': '#2A0A3A', '--muted': 'rgba(255,255,255,0.12)', '--muted-foreground': '#F0D9FF',
      '--accent': '#01CDFE', '--accent-foreground': '#04243A', '--border': 'rgba(255,255,255,0.25)', '--ring': '#FF71CE',
      '--radius': '0.5rem', '--font-heading': "'Orbitron', sans-serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'cyberpunk',
    name: 'Cyberpunk',
    read: 'gaming/tech edgy, langage néon + glitch + scanlines, magenta/cyan sur noir.',
    border: 'normal', shadow: 'glow', caps: true,
    surfaceStyle: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,255,0.07) 0 1px, transparent 1px 3px)' },
    vars: v({
      '--background': '#0D0D0D', '--foreground': '#00FF9C', '--card': '#0A0A0A', '--card-foreground': '#00FF9C',
      '--primary': '#FF00FF', '--primary-foreground': '#0D0D0D', '--muted': '#111111', '--muted-foreground': '#39D0D0',
      '--accent': '#00FFFF', '--accent-foreground': '#0D0D0D', '--border': 'rgba(0,255,255,0.30)', '--ring': '#FF00FF',
      '--radius': '0.25rem', '--font-heading': "'JetBrains Mono', monospace", '--font-body': "'JetBrains Mono', monospace",
    }),
  },
  {
    key: 'hud',
    name: 'HUD / Sci-Fi FUI',
    read: 'tableau de bord live futuriste, langage holographique, cyan + alerte rouge.',
    border: 'normal', shadow: 'glow', caps: true,
    surfaceStyle: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,255,0.06) 0 1px, transparent 1px 4px)' },
    vars: v({
      '--background': '#03121A', '--foreground': '#B6F2FF', '--card': '#06202B', '--card-foreground': '#CFFFFF',
      '--primary': '#00FFFF', '--primary-foreground': '#03121A', '--muted': '#0A2A38', '--muted-foreground': '#5FD6E6',
      '--accent': '#FF3B3B', '--accent-foreground': '#FFFFFF', '--border': 'rgba(0,255,255,0.25)', '--ring': '#00FFFF',
      '--radius': '0.2rem', '--font-heading': "'JetBrains Mono', monospace", '--font-body': "'JetBrains Mono', monospace",
    }),
  },
  {
    key: 'terminal',
    name: 'Terminal CLI',
    read: 'public dev/hacker, langage console matrix, vert phosphore sur noir OLED.',
    border: 'normal', shadow: 'glow', caps: true,
    surfaceStyle: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(51,255,0,0.08) 0 1px, transparent 1px 3px)' },
    vars: v({
      '--background': '#050505', '--foreground': '#33FF00', '--card': '#0A0A0A', '--card-foreground': '#33FF00',
      '--primary': '#33FF00', '--primary-foreground': '#050505', '--muted': '#0F0F0F', '--muted-foreground': '#1F9E1F',
      '--accent': '#33FF00', '--accent-foreground': '#050505', '--border': 'rgba(51,255,0,0.25)', '--ring': '#33FF00',
      '--radius': '0rem', '--font-heading': "'JetBrains Mono', monospace", '--font-body': "'JetBrains Mono', monospace",
    }),
  },
  {
    key: 'pixel',
    name: 'Pixel Art',
    read: 'gaming rétro 8-bit, langage NES, palette limitée, bords nets, Press Start.',
    border: 'thickInk', shadow: 'hard', caps: true, titleSize: 'text-sm',
    vars: v({
      '--background': '#5C94FC', '--foreground': '#FFFFFF', '--card': '#212121', '--card-foreground': '#FFFFFF',
      '--primary': '#FCD000', '--primary-foreground': '#000000', '--muted': '#3A3A3A', '--muted-foreground': '#BCBCBC',
      '--accent': '#00B800', '--accent-foreground': '#000000', '--border': '#000000', '--ring': '#FCD000',
      '--radius': '0rem', '--font-heading': "'Press Start 2P', monospace", '--font-body': "'Space Mono', monospace",
    }),
  },
  {
    key: 'memphis',
    name: 'Memphis 80s',
    read: 'marque fun/créative, langage formes audacieuses + rotations, pastels pop.',
    border: 'thickInk', shadow: 'hard', caps: true, rotate: true,
    vars: v({
      '--background': '#FFF9F0', '--foreground': '#2A2A2A', '--card': '#FFFFFF', '--card-foreground': '#2A2A2A',
      '--primary': '#FF71CE', '--primary-foreground': '#2A2A2A', '--muted': '#FFF1C9', '--muted-foreground': '#6A6A6A',
      '--accent': '#86CCCA', '--accent-foreground': '#1A1A1A', '--border': '#2A2A2A', '--ring': '#2A2A2A',
      '--radius': '0.6rem', '--font-heading': "'Poppins', sans-serif", '--font-body': "'Poppins', sans-serif",
    }),
  },
  {
    key: 'bauhaus',
    name: 'Bauhaus',
    read: 'institutionnel/culturel, langage géométrique primaire, rouge/bleu/jaune, grille de points.',
    border: 'thickInk', shadow: 'hard', caps: true,
    surfaceStyle: { backgroundImage: 'radial-gradient(rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '14px 14px' },
    vars: v({
      '--background': '#EFE9DE', '--foreground': '#1A1A1A', '--card': '#FFFFFF', '--card-foreground': '#1A1A1A',
      '--primary': '#1040C0', '--primary-foreground': '#FFFFFF', '--muted': '#F0C020', '--muted-foreground': '#1A1A1A',
      '--accent': '#D02020', '--accent-foreground': '#FFFFFF', '--border': '#1A1A1A', '--ring': '#1A1A1A',
      '--radius': '0rem', '--font-heading': "'Archivo Black', sans-serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'bento',
    name: 'Bento (Apple)',
    read: 'SaaS/produit premium, langage cartes bento épurées, off-white + bleu Apple.',
    border: 'normal', shadow: 'soft',
    vars: v({
      '--background': '#F5F5F7', '--foreground': '#1D1D1F', '--card': '#FFFFFF', '--card-foreground': '#1D1D1F',
      '--primary': '#0071E3', '--primary-foreground': '#FFFFFF', '--muted': '#ECECEF', '--muted-foreground': '#6E6E73',
      '--accent': '#0071E3', '--accent-foreground': '#FFFFFF', '--border': '#E3E3E6', '--ring': '#0071E3',
      '--radius': '1.25rem', '--font-heading': "'Inter', sans-serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'materialyou',
    name: 'Material You (MD3)',
    read: 'app Android moderne, langage tonal + pilules, violet MD3, élévation douce.',
    border: 'normal', shadow: 'soft',
    vars: v({
      '--background': '#FEF7FF', '--foreground': '#1D1B20', '--card': '#F7F2FA', '--card-foreground': '#1D1B20',
      '--primary': '#6750A4', '--primary-foreground': '#FFFFFF', '--muted': '#E8DEF8', '--muted-foreground': '#49454F',
      '--accent': '#7D5260', '--accent-foreground': '#FFFFFF', '--border': '#E7E0EC', '--ring': '#6750A4',
      '--radius': '1.75rem', '--font-heading': "'Outfit', sans-serif", '--font-body': "'Outfit', sans-serif",
    }),
  },
  {
    key: 'organic',
    name: 'Organic / Biophilic',
    read: 'marque nature/écolo, langage courbes organiques, verts forêt + beige.',
    border: 'normal', shadow: 'soft',
    vars: v({
      '--background': '#F5F5DC', '--foreground': '#2F3A24', '--card': '#FFFFFF', '--card-foreground': '#2F3A24',
      '--primary': '#228B22', '--primary-foreground': '#FFFFFF', '--muted': '#E7E9D8', '--muted-foreground': '#6B7257',
      '--accent': '#8B4513', '--accent-foreground': '#FFFFFF', '--border': '#DADEC9', '--ring': '#228B22',
      '--radius': '1.75rem', '--font-heading': "'Quicksand', sans-serif", '--font-body': "'Nunito', sans-serif",
    }),
  },
  {
    key: 'skeuomorphism',
    name: 'Skeuomorphism',
    read: 'nostalgie réaliste, langage matières/relief, cuir + boutons glossy.',
    border: 'normal', shadow: 'soft', effect: 'skeu',
    vars: v({
      '--background': '#BFA98E', '--foreground': '#2B2118', '--card': '#FFFFFF', '--card-foreground': '#2B2118',
      '--primary': '#1F6FEB', '--primary-foreground': '#FFFFFF', '--muted': '#D8CBB3', '--muted-foreground': '#6B5B43',
      '--accent': '#B8860B', '--accent-foreground': '#FFFFFF', '--border': 'rgba(0,0,0,0.2)', '--ring': '#1F6FEB',
      '--radius': '0.75rem', '--font-heading': "'Poppins', sans-serif", '--font-body': "'Poppins', sans-serif",
    }),
  },
  {
    key: 'eink',
    name: 'E-Ink / Paper',
    read: 'lecture calme/liseuse, langage papier encré, monochrome, zéro animation.',
    border: 'hair', shadow: 'none', serifTitle: true,
    vars: v({
      '--background': '#FDFBF7', '--foreground': '#1A1A1A', '--card': '#F5F5F0', '--card-foreground': '#1A1A1A',
      '--primary': '#1A1A1A', '--primary-foreground': '#FDFBF7', '--muted': '#ECE8DF', '--muted-foreground': '#5A5A52',
      '--accent': '#1A1A1A', '--accent-foreground': '#FDFBF7', '--border': '#D8D2C4', '--ring': '#1A1A1A',
      '--radius': '0.125rem', '--font-heading': "'Lora', serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'mono',
    name: 'Minimalist Monochrome',
    read: 'portfolio/agence, langage strict noir & blanc, filets francs, zéro couleur.',
    border: 'normal', shadow: 'none', caps: true,
    vars: v({
      '--background': '#FFFFFF', '--foreground': '#000000', '--card': '#FFFFFF', '--card-foreground': '#000000',
      '--primary': '#000000', '--primary-foreground': '#FFFFFF', '--muted': '#F2F2F2', '--muted-foreground': '#6B6B6B',
      '--accent': '#000000', '--accent-foreground': '#FFFFFF', '--border': '#000000', '--ring': '#000000',
      '--radius': '0rem', '--font-heading': "'Space Grotesk', sans-serif", '--font-body': "'Inter', sans-serif",
    }),
  },
  {
    key: 'academia',
    name: 'Academia / Gala',
    read: 'finale prestige/gala, langage acajou + laiton, serif Cinzel, vignettes.',
    border: 'hair', shadow: 'soft', caps: true, serifTitle: true, titleSize: 'text-2xl',
    vars: v({
      '--background': '#1C1714', '--foreground': '#EAD9C2', '--card': '#251E19', '--card-foreground': '#EAD9C2',
      '--primary': '#B5832E', '--primary-foreground': '#1C1714', '--muted': '#2E251F', '--muted-foreground': '#B09A82',
      '--accent': '#B5832E', '--accent-foreground': '#1C1714', '--border': 'rgba(255,255,255,0.08)', '--ring': '#B5832E',
      '--radius': '0.375rem', '--font-heading': "'Cinzel', serif", '--font-body': "'Lora', serif",
    }),
  },
  {
    key: 'sketch',
    name: 'Sketch / Hand-Drawn',
    read: 'app créative/notes, langage croquis, bordures dashed + rotation, polices manuscrites.',
    border: 'thickInk', shadow: 'hard', dashed: true, rotate: true,
    vars: v({
      '--background': '#FFFDF8', '--foreground': '#2D2D2D', '--card': '#FFFFFF', '--card-foreground': '#2D2D2D',
      '--primary': '#FF4D4D', '--primary-foreground': '#FFFFFF', '--muted': '#F3F0E8', '--muted-foreground': '#6B6B6B',
      '--accent': '#2D2D2D', '--accent-foreground': '#FFFFFF', '--border': '#2D2D2D', '--ring': '#2D2D2D',
      '--radius': '1rem', '--font-heading': "'Kalam', cursive", '--font-body': "'Patrick Hand', cursive",
    }),
  },
]

function DirectionCard({ d }: { d: Dir }) {
  const glass = d.effect === 'glass' || d.effect === 'aurora'
  const neu = d.effect === 'neu'
  const y2k = d.effect === 'y2k'
  const skeu = d.effect === 'skeu'

  const borderCls = d.dashed
    ? 'border-2 border-dashed border-foreground'
    : d.border === 'thickInk' ? 'border-[3px] border-foreground'
      : d.border === 'thick' ? 'border-2 border-border'
        : 'border border-border'
  const shadowCls =
    d.shadow === 'soft' ? 'shadow-lg'
      : d.shadow === 'hard' ? 'shadow-[5px_5px_0_0_var(--foreground)]'
        : d.shadow === 'glow' ? 'shadow-[0_0_22px_-4px_var(--primary)]'
          : ''

  const cardChrome = glass
    ? 'border border-white/30 bg-white/15 backdrop-blur-md'
    : neu
      ? 'bg-[var(--background)] shadow-[7px_7px_14px_rgba(148,163,184,0.55),-7px_-7px_14px_rgba(255,255,255,0.9)]'
      : skeu
        ? 'border border-black/15 bg-gradient-to-b from-white to-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_3px_6px_rgba(0,0,0,0.25)]'
        : cn(borderCls, shadowCls, y2k ? 'bg-white/80 backdrop-blur-sm' : 'bg-card')

  const rounded: CSSProperties = { borderRadius: 'var(--radius)' }
  const cap = d.caps ? 'uppercase tracking-tight' : ''
  const mech =
    d.shadow === 'hard'
      ? 'transition active:translate-x-[5px] active:translate-y-[5px] active:shadow-none'
      : 'transition'

  return (
    <div
      className={cn('flex min-h-full flex-col p-5 text-foreground', d.surface ?? 'bg-background')}
      style={{ ...d.vars, ...(d.surfaceStyle ?? {}), fontFamily: 'var(--font-body)' }}
    >
      <div className="flex items-center justify-between text-[10px] font-semibold tracking-wide text-muted-foreground">
        <span className={cn('truncate', d.caps && 'uppercase')}>Coupe de Futsal 2026</span>
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ ...rounded, background: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> Live
        </span>
      </div>

      <h1 className={cn('mt-3 leading-[1.05]', d.titleSize ?? 'text-3xl', cap)} style={{ fontFamily: 'var(--font-heading)' }}>
        Real Futsal
      </h1>

      <div className="mt-4 space-y-2">
        {STAND.map((row, i) => (
          <div
            key={row.r}
            className={cn('flex items-center gap-3 px-3 py-2', cardChrome, d.rotate && (i % 2 ? 'rotate-1' : '-rotate-1'))}
            style={rounded}
          >
            <span
              className="grid h-7 w-7 shrink-0 place-items-center text-xs font-bold tabular-nums"
              style={{
                ...rounded,
                background: row.q ? 'var(--primary)' : 'var(--muted)',
                color: row.q ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}
            >
              {row.r}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.n}</span>
            <span className="text-lg font-bold tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>
              {row.p}
            </span>
          </div>
        ))}
      </div>

      <button
        className={cn('mt-4 w-full py-2.5 text-sm font-bold', cap, mech, d.rotate && 'rotate-1', glass && 'backdrop-blur-md')}
        style={{ ...rounded, background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        Suivre mon équipe
      </button>
    </div>
  )
}

// ============================================================================
// CATEGORY: taste-skill (anti-slop discipline)
// taste-skill scopes ITSELF out of data-views (Section 13: "not dashboards, not
// data tables"), so we apply its DISCIPLINE, not a landing template: neutral base
// + ONE locked accent <80% sat, off-black/off-white (never #000/#fff), divide-y
// grouping instead of cards, font-mono tabular numbers, real states (live /
// loading / empty), tactile active feedback, zero decorative dots (the single
// live indicator is real semantic state), zero em-dash. Each example varies only
// along taste-skill's real axes (neutral × accent × dials × mode).
// ============================================================================
type TasteMode = 'live' | 'loading' | 'empty' | 'dark'
type Density = 'airy' | 'default' | 'cockpit'
type Group = 'divide' | 'plain' | 'card'
type Taste = {
  key: string
  name: string
  read: string // taste-skill "Design Read"
  dials: string
  mode: TasteMode
  density: Density
  group: Group
  monoTitle?: boolean
  vars: CSSProperties
}

// 8 directions taste-skill would actually endorse: each a distinct Design Read /
// legit aesthetic family (Linear-clean, editorial-utility, dark-tech, Swiss
// cockpit, warm-minimal, Radix-clean, amber-pitch, mono-ink). All share the
// anti-slop discipline (ONE locked accent <80% sat, off-black/off-white, mono
// tabular numbers, non-Inter display, real states, tactile, no em-dash). They
// vary only along taste-skill's REAL axes: neutral × accent × density × grouping
// × radius × display font — not on trend styles.
const TASTE: Taste[] = [
  {
    key: 'linear', name: 'Linear-clean', dials: 'VAR 3 · MOT 2 · DENS 4', mode: 'live', density: 'default', group: 'divide',
    read: 'B2B-clean façon Linear : slate froid, bleu électrique unique, Geist, filets divide-y, retenue.',
    vars: v({
      '--bg': '#FAFAFA', '--fg': '#18181B', '--sub': '#71717A', '--line': '#E4E4E7',
      '--accent': '#2563EB', '--on-accent': '#FFFFFF', '--soft': '#E8EEFC', '--rad': '0.5rem',
      '--disp': "'Geist', sans-serif", '--num': "'JetBrains Mono', monospace",
    }),
  },
  {
    key: 'editorial', name: 'Editorial-utility', dials: 'VAR 4 · MOT 2 · DENS 4', mode: 'live', density: 'airy', group: 'plain',
    read: 'éditorial aéré : stone chaud, orange brûlé, Space Grotesk display, beaucoup d’air, sans cartes.',
    vars: v({
      '--bg': '#FAF9F7', '--fg': '#1F1B17', '--sub': '#78716C', '--line': '#E7E5E1',
      '--accent': '#C2410C', '--on-accent': '#FFFFFF', '--soft': '#F6E7DD', '--rad': '0.375rem',
      '--disp': "'Space Grotesk', sans-serif", '--num': "'JetBrains Mono', monospace",
    }),
  },
  {
    key: 'darktech', name: 'Dark-tech', dials: 'VAR 3 · MOT 3 · DENS 6', mode: 'dark', density: 'cockpit', group: 'divide',
    read: 'hacker/dev sobre : off-black #0E0E10 (jamais #000), émeraude, mono partout, dense, zéro glow.',
    vars: v({
      '--bg': '#0E0E10', '--fg': '#F4F4F5', '--sub': '#9CA3AF', '--line': 'rgba(255,255,255,0.09)',
      '--accent': '#10B981', '--on-accent': '#04130D', '--soft': 'rgba(16,185,129,0.14)', '--rad': '0.375rem',
      '--disp': "'Geist', sans-serif", '--num': "'JetBrains Mono', monospace",
    }),
  },
  {
    key: 'swiss', name: 'Swiss cockpit', dials: 'VAR 2 · MOT 1 · DENS 8', mode: 'loading', density: 'cockpit', group: 'divide', monoTitle: true,
    read: 'grille suisse dense : zinc, accent cramoisi unique, titre mono, filets fins, rayon 0. (état chargement)',
    vars: v({
      '--bg': '#FFFFFF', '--fg': '#0A0A0A', '--sub': '#6B6B6B', '--line': '#E5E5E5',
      '--accent': '#DC2626', '--on-accent': '#FFFFFF', '--soft': '#FBE8E8', '--rad': '0rem',
      '--disp': "'IBM Plex Mono', monospace", '--num': "'IBM Plex Mono', monospace",
    }),
  },
  {
    key: 'warm', name: 'Warm minimal', dials: 'VAR 3 · MOT 2 · DENS 3', mode: 'empty', density: 'airy', group: 'plain',
    read: 'minimal chaud très aéré : zinc, rose profond, Outfit, espace négatif. (état vide composé)',
    vars: v({
      '--bg': '#FBFAFA', '--fg': '#1C1917', '--sub': '#78716C', '--line': '#EAE7E4',
      '--accent': '#BE123C', '--on-accent': '#FFFFFF', '--soft': '#FBE7EC', '--rad': '0.75rem',
      '--disp': "'Outfit', sans-serif", '--num': "'JetBrains Mono', monospace",
    }),
  },
  {
    key: 'radix', name: 'Radix-clean', dials: 'VAR 4 · MOT 3 · DENS 5', mode: 'live', density: 'default', group: 'card',
    read: 'façon Radix Themes : neutre, indigo retenu (pas de glow IA), cartes douces tintées, rayon 12.',
    vars: v({
      '--bg': '#FBFBFB', '--fg': '#1A1A1A', '--sub': '#717179', '--line': '#E8E8EC',
      '--accent': '#4F46E5', '--on-accent': '#FFFFFF', '--soft': '#ECEBFD', '--rad': '0.75rem',
      '--disp': "'Outfit', sans-serif", '--num': "'JetBrains Mono', monospace",
    }),
  },
  {
    key: 'amber', name: 'Amber pitch', dials: 'VAR 3 · MOT 2 · DENS 5', mode: 'live', density: 'default', group: 'divide',
    read: 'sport-clean tiède : slate, ambre unique, Sora display, divide-y, chiffres mono.',
    vars: v({
      '--bg': '#FAFAF9', '--fg': '#1C1917', '--sub': '#78716C', '--line': '#E7E5E4',
      '--accent': '#D97706', '--on-accent': '#1C1207', '--soft': '#FBEFD9', '--rad': '0.5rem',
      '--disp': "'Sora', sans-serif", '--num': "'JetBrains Mono', monospace",
    }),
  },
  {
    key: 'monoink', name: 'Mono ink', dials: 'VAR 3 · MOT 1 · DENS 5', mode: 'live', density: 'default', group: 'plain',
    read: 'monochrome assumé (taste valide §4.2) : off-white + off-black, zéro couleur, hiérarchie par poids/filet.',
    vars: v({
      '--bg': '#FAFAFA', '--fg': '#101010', '--sub': '#737373', '--line': '#E2E2E2',
      '--accent': '#101010', '--on-accent': '#FAFAFA', '--soft': '#ECECEC', '--rad': '0.25rem',
      '--disp': "'Space Grotesk', sans-serif", '--num': "'JetBrains Mono', monospace",
    }),
  },
]

const TASTE_STAND = [
  { r: 1, n: 'Real Futsal', j: 3, dg: 7, p: 9, q: true },
  { r: 2, n: 'AS Tonnerre', j: 3, dg: 2, p: 6, q: true },
  { r: 3, n: 'Les Lynx', j: 3, dg: -1, p: 3, q: false },
  { r: 4, n: 'FC Comète', j: 3, dg: -8, p: 0, q: false },
]

const DENS: Record<Density, { pad: string; title: string; row: string; gap: string; name: string }> = {
  airy: { pad: 'px-6 pt-5 pb-6', title: 'text-[28px]', row: 'py-4', gap: 'gap-3.5', name: 'text-[15px]' },
  default: { pad: 'px-5 pt-4 pb-5', title: 'text-[26px]', row: 'py-3', gap: 'gap-3', name: 'text-[14px]' },
  cockpit: { pad: 'px-4 pt-3 pb-4', title: 'text-[19px]', row: 'py-2', gap: 'gap-2.5', name: 'text-[13px]' },
}

function TasteScreen({ t }: { t: Taste }) {
  const disp: CSSProperties = { fontFamily: 'var(--disp)' }
  const num: CSSProperties = { fontFamily: 'var(--num)' }
  const rad: CSSProperties = { borderRadius: 'var(--rad)' }
  const d = DENS[t.density]
  const dense = t.density === 'cockpit'

  // One row of the standings, treated per the chosen grouping (divide / plain / card).
  const Row = ({ row }: { row: (typeof TASTE_STAND)[number] }) => (
    <div
      className={cn('flex items-center', d.gap, d.row, t.group === 'card' && 'px-3')}
      style={t.group === 'card' ? { ...rad, background: row.q ? 'var(--soft)' : 'transparent' } : undefined}
    >
      <span
        className="grid h-6 w-6 shrink-0 place-items-center text-[12px] font-semibold"
        style={row.q ? { ...rad, background: 'var(--accent)', color: 'var(--on-accent)', ...num } : { ...rad, background: 'var(--soft)', color: 'var(--sub)', ...num }}
      >
        {row.r}
      </span>
      <span className={cn('min-w-0 flex-1 truncate font-medium', d.name)}>{row.n}</span>
      {dense && (
        <span className="w-5 text-center text-[12px]" style={{ color: 'var(--sub)', ...num }}>{row.j}</span>
      )}
      <span className="w-7 text-right text-[12px]" style={{ color: 'var(--sub)', ...num }}>
        {row.dg > 0 ? `+${row.dg}` : row.dg}
      </span>
      <span className="w-7 text-right text-[15px] font-semibold" style={num}>{row.p}</span>
    </div>
  )

  const listWrap =
    t.group === 'divide' ? 'divide-y' : t.group === 'card' ? 'space-y-1.5' : 'space-y-0.5'

  return (
    <div
      className={cn('flex min-h-full flex-col', d.pad)}
      style={{ ...t.vars, background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--disp)' }}
    >
      {/* Header: brand line + ONE live indicator (real semantic state, not decoration) */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color: 'var(--sub)' }}>Coupe de Futsal 2026</span>
        {t.mode !== 'empty' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: 'var(--accent)', opacity: 0.7 }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            </span>
            En direct
          </span>
        )}
      </div>

      {/* Title: hierarchy via weight + color, not raw scale */}
      <h1 className={cn('mt-3 font-semibold leading-[1.1] tracking-tight', d.title, t.monoTitle && 'uppercase tracking-tight')} style={t.monoTitle ? num : disp}>
        Poule A
      </h1>
      <p className="mt-0.5 text-[13px]" style={{ color: 'var(--sub)' }}>Journée 3 sur 3 · 2 qualifiés</p>

      <div className="mt-4 flex-1">
        {t.mode === 'loading' ? (
          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn('flex items-center', d.gap, d.row)}>
                <span className="h-6 w-6 shrink-0 animate-pulse" style={{ ...rad, background: 'var(--line)' }} />
                <span className="h-3.5 flex-1 animate-pulse rounded" style={{ background: 'var(--line)', maxWidth: `${70 - i * 9}%` }} />
                <span className="h-3.5 w-6 animate-pulse rounded" style={{ background: 'var(--line)' }} />
              </div>
            ))}
          </div>
        ) : t.mode === 'empty' ? (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <span className="grid h-12 w-12 place-items-center" style={{ ...rad, background: 'var(--soft)', color: 'var(--accent)' }}>
              <Hourglass className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <p className="mt-3 text-[15px] font-semibold" style={disp}>Le tirage n&apos;est pas encore fait</p>
            <p className="mt-1 max-w-[15rem] text-[13px]" style={{ color: 'var(--sub)' }}>
              Les poules apparaîtront ici dès que l&apos;organisateur aura lancé le tirage.
            </p>
            <button className="mt-4 px-4 py-2 text-[13px] font-semibold transition active:scale-[0.98]" style={{ ...rad, background: 'var(--accent)', color: 'var(--on-accent)' }}>
              Voir les équipes inscrites
            </button>
          </div>
        ) : (
          <div className={listWrap} style={t.group === 'divide' ? { borderColor: 'var(--line)' } : undefined}>
            {TASTE_STAND.map((row) => (
              <Row key={row.r} row={row} />
            ))}
          </div>
        )}
      </div>

      {t.mode !== 'empty' && (
        <button className="mt-4 w-full py-2.5 text-[14px] font-semibold transition active:scale-[0.98]" style={{ ...rad, background: 'var(--accent)', color: 'var(--on-accent)' }}>
          Suivre mon équipe
        </button>
      )}
    </div>
  )
}

export default function DesignDirectionsPage() {
  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600;700&family=Libre+Bodoni:wght@500;600;700&family=Public+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Archivo+Black&family=Space+Mono:wght@400;700&family=Orbitron:wght@600;700;800&family=Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&family=Press+Start+2P&family=Poppins:wght@500;600;700&family=Quicksand:wght@500;600;700&family=Lora:wght@500;600;700&family=Cinzel:wght@500;600;700&family=Kalam:wght@400;700&family=Patrick+Hand&family=Geist:wght@400;500;600;700&family=Sora:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
      />

      <DesignNav current="/design-directions" />

      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            ui-ux-pro-max + taste-skill · directions
          </p>
          <h1 className="mt-1 text-2xl font-bold">{DIRS.length} directions pour la vue tournoi</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            Le même écran décliné en {DIRS.length} langages distincts (styles ui-ux-pro-max, cadrés par le
            « Design Read » de taste-skill). Chacun a sa palette, ses fontes, son rayon, ses bordures, ses ombres et
            ses effets — <strong>la structure change, pas que la couleur</strong>. Tout est scopé par carte via
            variables CSS : <strong>aucun impact</strong> sur <code>globals.css</code> ni sur le thème par tenant.
          </p>
        </header>

        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-lg font-bold">Catalogue ui-ux-pro-max</h2>
          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {DIRS.length} styles
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {DIRS.map((d) => (
            <div key={d.key} className="flex flex-col">
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{d.name}</span>
                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {d.key}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-snug text-neutral-500 dark:text-neutral-400">
                  <span className="font-semibold">Design Read :</span> {d.read}
                </p>
              </div>
              <div className="flex-1 overflow-hidden rounded-2xl border border-neutral-300 shadow-sm dark:border-neutral-700">
                <DirectionCard d={d} />
              </div>
            </div>
          ))}
        </div>

        {/* CATEGORY: taste-skill */}
        <div className="mt-14 border-t border-neutral-200 pt-10 dark:border-neutral-800">
          <div className="mb-1 flex items-center gap-3">
            <h2 className="text-lg font-bold">Direction taste-skill</h2>
            <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-medium text-white dark:bg-white dark:text-neutral-900">
              anti-slop
            </span>
          </div>
          <p className="max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">Design Read :</span> data-view de
            tournoi en direct, pour joueurs + proches sur mobile, langage utilitaire/sport-clean, base neutre + un
            seul accent verrouillé, regroupement <code>divide-y</code> plutôt que cartes, chiffres mono tabulaires.
            Explicitement <strong>pas</strong> le défaut IA Inter+slate+violet.
          </p>
          <p className="mt-2 max-w-3xl text-xs text-neutral-500 dark:text-neutral-400">
            Note d&apos;honnêteté : taste-skill se déclare <em>hors-scope</em> pour les data-views (§13 « not
            dashboards, not data tables »). On applique donc sa <strong>discipline</strong> (couleur, matérialité,
            états réels, anti-tells), pas un template de landing. Chaque exemple ne varie que sur ses vrais axes :
            neutre × accent × dials × mode.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {TASTE.map((t) => (
              <div key={t.key} className="flex flex-col">
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{t.name}</span>
                    <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-mono font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {t.dials}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-snug text-neutral-500 dark:text-neutral-400">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-200">Design Read :</span> {t.read}
                  </p>
                </div>
                <div className="flex-1 overflow-hidden rounded-2xl border border-neutral-300 shadow-sm dark:border-neutral-700">
                  <TasteScreen t={t} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
