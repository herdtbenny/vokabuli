# 📚 Vokabuli

Englisch-Vokabeln spielend lernen – als mobile Web-App für die ganze Familie.
Karteikarten, Spaced Repetition und Gamification, komplett ohne Server: alle Daten
liegen lokal im Browser (localStorage).

> Der Name steckt zentral in [`src/brand.ts`](src/brand.ts) – dort umbenennen, fertig.

## Features

- **Profile ohne Anmeldung** (Netflix-Stil) – jede Person hat eigenen Fortschritt, Level & Serie
- **7 Kategorien mit rund 2.450 Vokabeln** (je ~350, Niveau B1–C1), jede mit Beispielsatz + Übersetzung:
  ⚖️ Jura · 💼 Business & Office Flex · 🛒 Alltag & Umgangssprache · ⚽ Sport · 💰 Wirtschaft · 🍽️ Essen · ✈️ Reisen
- **4 Lernarten, frei kombinierbar:** Karteikarten, Multiple Choice, Schreiben, Hören –
  einzeln, mehrere oder „Alle" (dann wird pro Karte gemischt)
- **Spaced Repetition** (SM-2) – beim Bewerten siehst du direkt, wann die Karte wiederkommt
- **Aussprache** per Text-to-Speech (im Browser eingebaut)
- **Gamification:** XP, Level, Tages-Serie 🔥, Tagesziel, Erfolge, Konfetti & Sounds
- **Schnell-Review** – nur die fälligen Wiederholungen
- **Eigene Kategorien** mit eigenen Karten anlegen

## Vokabeln ergänzen

Jede Kategorie liegt als eigene Datei in [`src/data/`](src/data/) im kompakten Format
`[englisch, deutsch, Beispielsatz, Übersetzung, Hinweis?]`. Karten-IDs werden aus dem
englischen Begriff abgeleitet – neue Einträge verschieben also keinen bestehenden Lernfortschritt.

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # Produktion -> dist/
npm run preview  # Build lokal ansehen
```

## Technik

Vite · React · TypeScript · reines CSS. Keine Datenbank, kein Backend.
Da alles im `localStorage` liegt, ist der Fortschritt pro Gerät/Browser getrennt
(ideal, weil jede Person ihr eigenes Handy nutzt).

## Deployment

Statisches Bundle – läuft auf Vercel, Netlify oder GitHub Pages.
`npm run build` erzeugt `dist/`, das direkt ausgeliefert werden kann.

## Lizenz

Privates Familienprojekt. Nutzung auf eigene Verantwortung.
