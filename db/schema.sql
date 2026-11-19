-- Vokabuli: ein Lernstand-Dokument pro Clerk-Benutzer.
-- data enthält Profil (Name, Farbe, Serie, Statistik), Fortschritt je Karte,
-- eigene Kategorien und Einstellungen – genau das, was bisher im localStorage lag.
create table if not exists user_state (
  user_id    text primary key,              -- Clerk User-ID (z.B. "user_2abc…")
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
