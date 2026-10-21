# AmiApp ♡

A shared little space for husbands and wives. Responsive Next.js / React frontend, shadcn-style Radix Button, Tailwind CSS, Motion animations, and Supabase Auth + PostgreSQL. Blush, sage, and lavender themes.

## Where things run

Netlify hosts the static Next.js export. Supabase hosts Auth, PostgreSQL, and the database pairing RPCs. No Edge Function is needed: Supabase Auth handles credentials and PostgreSQL enforces all access. No SQLite remains.

## Connect your other Supabase account

Configured project: **Secondary → apopia company → AmiApp**, reference `cxvovxdmhgoyrnfxzkpi`. Both migrations have been applied. The primary Supabase account was not modified. Public client settings are included in `src/lib/supabase.ts`; `.env.local` can override them.

1. Sign into your preferred account at https://supabase.com/dashboard and create a **dedicated new project** for AmiApp.
2. For a fresh project, run both SQL files in `supabase/migrations/` in filename order once. Do not rerun them on the configured AmiApp project. Keep `private` out of the Data API exposed schemas; expose only `public` for this app. Alternatively, use the Supabase CLI with a separate profile after checking `npx supabase login --help`, `link --help`, and `db push --help`. Confirm the project reference before applying anything.
3. Enable Email/Password auth. **Disable Confirm Email**: usernames map to internal `username@users.amiapp.invalid` identities; the app never asks for or sends email. Disable anonymous sign-ins and unused providers. In Password Security set minimum password length to **12** and configure password strength / leaked password protection if available on your plan. Frontend limits are not a substitute for server auth settings.
4. Set your production site URL in Auth URL Configuration. Review Auth rate limits. For a public signup launch, enable Supabase-supported CAPTCHA and add its token flow to the form before opening unrestricted registration; pairing has a per-account database limit but automated account creation still needs abuse protection at signup.
5. Copy `.env.example` to `.env.local`, then add your **project URL and publishable key**. These two values are intentionally public. Never add a service-role key, secret key, database password, or personal access token.
6. Run `npm ci` and `npm run dev`. Open http://localhost:3000.

The default public configuration connects to the configured AmiApp project. It never falls back to pretend accounts or stores couple content locally. A cloned project should override both public environment values to use its own backend.

## Features

- Choose husband/wife before registration, then create a unique username and password (case-insensitive usernames: 3–24 letters, digits, underscores).
- Generate or enter a six-digit invitation. Either spouse can initiate. Keys expire after 15 minutes, are single-use, and are hashed in a private table. Ten generation/join attempts per account per 15 minutes. Share privately: possession of a valid code allows an opposite-role account to join. Only two people can join a couple. Generating a new key replaces the old one.
- Pairing is required for both partners before any shared records can be created. The creator clicks **My person has joined · Check again** after the other joins.
- ShortNotes, tickable goals, ambitions with percent progress and year-end default deadline, to-dos with optional dates, grocery post-its, places with notes, and countdowns.
- Create, edit, complete, and delete shared items. Countdown cards are omitted from the dashboard when none exist; use Counting down in the navigation to create one.
- Shared data refreshes every 20 seconds while the tab is visible, with cleanup on unmount. The dashboard has manual refresh too. Mutations refresh immediately.
- Reminders are an in-app dated list, not push notifications or background alarms.

## Passwords and privacy

Passwords are hashed and verified by Supabase Auth; the application never saves passwords in its own tables. Username uniqueness is enforced by both the Auth identity and a database unique constraint; there is no public username directory. Login uses generic auth failures. Because email/phone are deliberately absent, there is no self-service password recovery: the project owner must provide a verified manual recovery process.

RLS protects every table. Only own and paired-partner profiles are readable. Shared entries require the authenticated user's couple, and the author cannot be forged. Column grants prevent editing couple membership or reassigning entry ownership. Pairing transactions lock profiles and invitations, reject same-role/self/third-member joins, and consume invitations atomically. Private functions use a fixed empty search path and explicit identity checks; public RPC wrappers use invoker privileges. Do not expose the `private` schema or relax the grants.

Only the theme and Supabase's session tokens are browser-persisted. Couple entries are not cached in localStorage. Treat the device as private and log out on shared devices. There are no uploads, third-party trackers, user HTML rendering, or service-role credentials. Markdown/HTML in notes is rendered as plain text.

## Publish on Netlify

`netlify.toml` configures Node 24, `npm run build`, and the `out` publish directory. The site runs at the domain root; no GitHub Pages base path is used.

1. In Netlify, import the source repository for continuous deployment, or manually deploy the contents of `out/` after running `npm run build`.
2. For Git imports, the build and publish settings are read from `netlify.toml` automatically. The default public Supabase settings already point to the configured AmiApp project; optionally override `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Netlify environment settings.
3. For manual deploys, upload the generated deploy ZIP containing `index.html` and `_next/` at the ZIP root. Manual deployments do not run the build for you.
4. Add the final Netlify HTTPS URL to Supabase's Auth Site URL setting. Username/password auth does not use email redirects, but the configured URL should still match the deployed app.

Public config changes require a rebuild. Never add a service-role key to Netlify's frontend environment. The empty `afifanshuri2/AmiApp` GitHub repository was created before the hosting choice changed; no source has been pushed there and GitHub Pages has not been enabled.

## Validation

`npm test` runs actual PostgreSQL WASM (PGlite) against the unchanged migration, with mocked Supabase `auth.users` / `auth.uid()` interfaces. It checks matching, key expiry and replacement, committed rate limits, uniqueness, anonymous access, membership tampering, author spoofing, partner sharing, and cross-couple read/write isolation. `npm run build` validates TypeScript and creates `out/`; `npm run typecheck` is also available.

Live checks also passed against the configured project: real Auth signup/session creation, single-use pairing, all seven record types, partner edits/deletion, and outsider isolation. Temporary test accounts were signed out and removed after verification. Supabase Security Advisor returned no findings. Authentication and mobile registration layout were checked in the browser; the full dashboard browser flow should also be checked with your own accounts.

## Structure

`src/components/auth.tsx` and `pair.tsx` own onboarding. `dashboard.tsx` renders reusable collections. `entry-editor.tsx` is the shared form. `ui/button.tsx` uses the shadcn/ui Radix/CVA composition pattern. `src/lib` holds shared types and the singleton Supabase client. The SQL migration is the authoritative data/security layer. No service credentials or business authorization live in React.
