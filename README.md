# 📚 Vokabuli

Englisch-Vokabeln spielend lernen – als mobile Web-App für die ganze Familie.
Karteikarten, Spaced Repetition und Gamification, komplett ohne Server: alle Daten
liegen lokal im Browser (localStorage).

> Der Name steckt zentral in [`src/brand.ts`](src/brand.ts) – dort umbenennen, fertig.

## Features

- **Profile ohne Anmeldung** (Netflix-Stil) – jede Person hat eigenen Fortschritt, Level & Serie
- **7 Kategorien** mit über 240 vorbefüllten Vokabeln:
  ⚖️ Jura · 💼 Business & Office Flex · 🛒 Alltag · ⚽ Sport · 💰 Wirtschaft · 🍽️ Essen · ✈️ Reisen
- **4 Lernmodi:** Karteikarten (umdrehen), Multiple Choice, Schreiben, Hören
- **Spaced Repetition** (SM-2) – Karten kommen wieder, wenn du sie fast vergisst
- **Aussprache** per Text-to-Speech (im Browser eingebaut)
- **Beispielsätze** mit Übersetzung zu jeder Vokabel
- **Gamification:** XP, Level, Tages-Serie 🔥, Tagesziel, Erfolge/Badges, Konfetti & Sounds
- **Schnell-Review** – nur die fälligen Karten in wenigen Minuten
- **Eigene Decks & Karten** anlegen
- **KI-Deck-Generator** (optional) – erstellt Vokabeln zu einem Thema. Eigener API-Key,
  nur lokal gespeichert, OpenAI-kompatibel (siehe Einstellungen).

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
