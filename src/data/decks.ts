import type { Category, Deck } from '../types'
import { toCards } from './raw'
import { law } from './law'
import { business } from './business'
import { daily } from './daily'
import { sport } from './sport'
import { finance } from './finance'
import { food } from './food'
import { travel } from './travel'

// Farben & Icons der eingebauten Kategorien (Icon-Schlüssel siehe src/icons.tsx)
export const categories: Category[] = [
  { id: 'law', title: 'Jura & Legal English', icon: 'scale', color: '#8b5cf6' },
  { id: 'business', title: 'Business & Office', icon: 'briefcase', color: '#3b82f6' },
  { id: 'daily', title: 'Alltag & Umgangssprache', icon: 'shopping-bag', color: '#22c55e' },
  { id: 'sport', title: 'Sport', icon: 'dumbbell', color: '#f97316' },
  { id: 'finance', title: 'Wirtschaft & Finance', icon: 'coins', color: '#eab308' },
  { id: 'food', title: 'Essen & Restaurant', icon: 'utensils', color: '#ef4444' },
  { id: 'travel', title: 'Reisen', icon: 'plane', color: '#06b6d4' },
]

export const decks: Deck[] = [
  {
    id: 'law',
    categoryId: 'law',
    title: 'Legal English',
    icon: 'scale',
    description: 'Vertrags-, Prozess-, Straf-, Gesellschafts- & Arbeitsrecht, Datenschutz, Legal Latin · B2–C1',
    cards: toCards('law', law),
  },
  {
    id: 'business',
    categoryId: 'business',
    title: 'Business & Office',
    icon: 'briefcase',
    description: 'Meetings, E-Mails, Idiome, Strategie, Verhandlung & Startup-Sprech · B2–C1',
    cards: toCards('business', business),
  },
  {
    id: 'daily',
    categoryId: 'daily',
    title: 'Alltag & Umgangssprache',
    icon: 'shopping-bag',
    description: 'Phrasal Verbs, Redewendungen, Smalltalk, Haushalt, Gesundheit & Slang · B1–C1',
    cards: toCards('daily', daily),
  },
  {
    id: 'sport',
    categoryId: 'sport',
    title: 'Sport',
    icon: 'dumbbell',
    description: 'Fußball, Fitness, Training, Leichtathletik, Tennis, Fansprache & Sport-Idiome · B1–C1',
    cards: toCards('sport', sport),
  },
  {
    id: 'finance',
    categoryId: 'finance',
    title: 'Wirtschaft & Finance',
    icon: 'coins',
    description: 'Konjunktur, Börse, Banken, Bilanz, Steuern, Handel, Krypto & Geld-Idiome · B2–C1',
    cards: toCards('finance', finance),
  },
  {
    id: 'food',
    categoryId: 'food',
    title: 'Essen & Restaurant',
    icon: 'utensils',
    description: 'Bestellen, Kochtechniken, Geschmack, Zutaten, Bar & Food-Idiome · B1–C1',
    cards: toCards('food', food),
  },
  {
    id: 'travel',
    categoryId: 'travel',
    title: 'Reisen',
    icon: 'plane',
    description: 'Flughafen, Bahn, Auto, Hotel, Sightseeing, Pannen & Reise-Idiome · B1–C1',
    cards: toCards('travel', travel),
  },
]

export function getDeck(id: string): Deck | undefined {
  return decks.find((d) => d.id === id)
}

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}
