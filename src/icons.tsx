import {
  BookOpen,
  Briefcase,
  Car,
  Coins,
  Dumbbell,
  Film,
  FlaskConical,
  Globe,
  GraduationCap,
  Heart,
  Laptop,
  Music,
  Palette,
  Plane,
  Scale,
  ShoppingBag,
  Stethoscope,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'

// Zentrale Icon-Auswahl für Kategorien (eingebaut + eigene). Keine Emojis in der App.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  scale: Scale,
  briefcase: Briefcase,
  'shopping-bag': ShoppingBag,
  dumbbell: Dumbbell,
  coins: Coins,
  utensils: UtensilsCrossed,
  plane: Plane,
  laptop: Laptop,
  'graduation-cap': GraduationCap,
  stethoscope: Stethoscope,
  globe: Globe,
  car: Car,
  film: Film,
  music: Music,
  palette: Palette,
  flask: FlaskConical,
  heart: Heart,
}

export const PICKABLE_ICONS = Object.keys(CATEGORY_ICONS)
export const DEFAULT_ICON = 'book-open'

export function CategoryIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = CATEGORY_ICONS[name] ?? BookOpen
  return <Icon size={size} strokeWidth={2} aria-hidden />
}
