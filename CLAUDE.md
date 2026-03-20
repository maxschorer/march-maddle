# March Maddle

## Git

- Always push using the `maxschorer` GitHub account (personal), NOT `maxwellsfr3` (work).
- Before pushing, run: `gh auth switch --user maxschorer`
- If push fails with permission denied, that's the wrong account. Switch first.

## Dev server

- Run from `/Users/maxwellschorer/src/march-maddle` (not march-maddle-next)
- `npx next dev --port 3000`
- Running `npx next build` kills the dev server — restart after builds

## Supabase

- Project: `zbiazlsdwtemzyxigusp`
- Use `npx supabase db push` for migrations when possible
- Pooler connection: `postgresql://postgres.zbiazlsdwtemzyxigusp:PASSWORD@aws-0-us-west-2.pooler.supabase.com:6543/postgres`
