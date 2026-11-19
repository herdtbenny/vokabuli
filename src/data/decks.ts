import type { Category, Deck } from '../types'
import { toCards } from './raw'
import { law } from './law'
import { business } from './business'
import { daily } from './daily'
import { sport } from './sport'
import { finance } from './finance'
import { food } from './food'
import { travel } from './travel'

// Farben & Metadaten der eingebauten Kategorien
export const categories: Category[] = [
  { id: 'law', title: 'Jura & Legal English', emoji: '⚖️', color: '#8b5cf6' },
  { id: 'business', title: 'Business & Office Flex', emoji: '💼', color: '#3b82f6' },
  { id: 'daily', title: 'Alltag & Umgangssprache', emoji: '🛒', color: '#22c55e' },
  { id: 'sport', title: 'Sport', emoji: '⚽', color: '#f97316' },
  { id: 'finance', title: 'Wirtschaft & Finance', emoji: '💰', color: '#eab308' },
  { id: 'food', title: 'Essen & Restaurant', emoji: '🍽️', color: '#ef4444' },
  { id: 'travel', title: 'Reisen', emoji: '✈️', color: '#06b6d4' },
]

export const decks: Deck[] = [
  {
    id: 'law',
    categoryId: 'law',
    title: 'Legal English',
    emoji: '⚖️',
    description: 'Vertrags-, Prozess-, Straf-, Gesellschafts- & Arbeitsrecht, Datenschutz, Legal Latin · B2–C1',
    cards: toCards('law', law),
  },
  {
    id: 'business',
    categoryId: 'business',
    title: 'Business & Office Flex',
    emoji: '💼',
    description: 'Meetings, E-Mails, Idiome, Strategie, Verhandlung & Startup-Sprech · B2–C1',
    cards: toCards('business', business),
  },
  {
    id: 'daily',
    categoryId: 'daily',
    title: 'Alltag & Umgangssprache',
    emoji: '🛒',
    description: 'Phrasal Verbs, Redewendungen, Smalltalk, Haushalt, Gesundheit & Slang · B1–C1',
    cards: toCards('daily', daily),
  },
  {
    id: 'sport',
    categoryId: 'sport',
    title: 'Sport',
    emoji: '⚽',
    description: 'Fußball, Fitness, Training, Leichtathletik, Tennis, Fansprache & Sport-Idiome · B1–C1',
    cards: toCards('sport', sport),
  },
  {
    id: 'finance',
    categoryId: 'finance',
    title: 'Wirtschaft & Finance',
    emoji: '💰',
    description: 'Konjunktur, Börse, Banken, Bilanz, Steuern, Handel, Krypto & Geld-Idiome · B2–C1',
    cards: toCards('finance', finance),
  },
  {
    id: 'food',
    categoryId: 'food',
    title: 'Essen & Restaurant',
    emoji: '🍽️',
    description: 'Bestellen, Kochtechniken, Geschmack, Zutaten, Bar & Food-Idiome · B1–C1',
    cards: toCards('food', food),
  },
  {
    id: 'travel',
    categoryId: 'travel',
    title: 'Reisen',
    emoji: '✈️',
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
