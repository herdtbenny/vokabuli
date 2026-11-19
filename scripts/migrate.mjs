// Legt das Datenbank-Schema an: node --env-file=.env.local scripts/migrate.mjs
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL fehlt – erst `vercel env pull` ausführen.')
  process.exit(1)
}

const sql = neon(url)
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
  .split('\n')
  .map((line) => line.replace(/--.*$/, '')) // Kommentare entfernen
  .join('\n')

for (const statement of schema.split(';').map((s) => s.trim()).filter(Boolean)) {
  await sql(statement)
}

const rows = await sql`
  select column_name, data_type from information_schema.columns
  where table_name = 'user_state' order by ordinal_position`
console.log('Tabelle user_state:', rows.map((r) => `${r.column_name} (${r.data_type})`).join(', '))
