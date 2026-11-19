# Vokabuli

Englisch-Vokabeln lernen – als mobile Web-App für die ganze Familie.
Karteikarten und Spaced Repetition, komplett ohne Server: alle Daten liegen
lokal im Browser (localStorage).

> Der Name steckt zentral in [`src/brand.ts`](src/brand.ts) – dort umbenennen, fertig.

## Features

- **Profile ohne Anmeldung** – jede Person hat ihren eigenen Lernfortschritt und ihre Tages-Serie
- **7 Kategorien mit rund 2.450 Vokabeln** (je ~350, Niveau B1–C1), jede mit Beispielsatz und Übersetzung:
  Jura · Business & Office · Alltag & Umgangssprache · Sport · Wirtschaft & Finance · Essen & Restaurant · Reisen
- **4 Lernarten, frei kombinierbar:** Karteikarten, Multiple Choice, Schreiben, Hören –
  einzeln, mehrere oder „Alle“ (dann wird pro Karte gemischt)
- **Spaced Repetition** (SM-2) – beim Bewerten siehst du direkt, wann die Karte wiederkommt
- **Aussprache** per Text-to-Speech (im Browser eingebaut)
- **Schnell-Review** – nur die fälligen Wiederholungen
- **Eigene Kategorien** mit eigenen Karten anlegen
- **Statistik:** Trefferquote, Tages-Serie, gemeisterte Karten
- Bewusst schlicht: keine Punkte, Level, Ziele oder Abzeichen – und keine Emojis, nur Icons ([Lucide](https://lucide.dev))

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

Vite · React · TypeScript · reines CSS · Lucide-Icons. Aktuell keine Datenbank und kein Backend:
Der Fortschritt liegt pro Gerät/Browser im `localStorage`.

## Deployment

Statisches Bundle – läuft auf Vercel, Netlify oder GitHub Pages.
`npm run build` erzeugt `dist/`, das direkt ausgeliefert werden kann.

## Lizenz

Privates Familienprojekt. Nutzung auf eigene Verantwortung.
