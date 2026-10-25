# AmiApp ♡

A shared little space for husbands and wives. Responsive Next.js / React frontend, official shadcn/ui components, Tailwind CSS, Motion animations, and Supabase Auth + PostgreSQL. Blush, sage, and lavender themes.

Live app: https://amiapp-afifanshuri2.netlify.app/

Netlify project ID: `2e67f967-582f-4246-b01b-346f5e496cc4`. Deployed manually from the static export; continuous Git deployment is not configured. The sign-in page contains only the logo and form.

## Where things run

Netlify hosts the static Next.js export. Supabase hosts Auth, PostgreSQL, pairing/settings RPCs, and the `shortnote-push` Edge Function. Supabase Auth handles credentials and PostgreSQL enforces access. No SQLite remains.

## Connect your other Supabase account

Configured project: **Secondary → apopia company → AmiApp**, reference `cxvovxdmhgoyrnfxzkpi`. New local schema changes are not applied automatically; see the pending revision below. The primary Supabase account was not modified. Public client settings are included in `src/lib/supabase.ts`; `.env.local` can override them.

## Pending local feature revision

The earlier everyday-feature revision (`20261025064718_everyday_feature_updates.sql`) was released on October 25, 2026. The newer avatar/gesture revision is **local only**. Do not publish or apply it until the user asks for a release.

The local revision removes dashboard statistics, counts unfinished to-dos, previews two non-scrolling ShortNotes and the newest grocery list, and replaces the hero banner with customizable couple avatars. Each person can change their own skin tone, hairstyle, hair color, headwear (including hijab), glasses, and outfit color. Poke, Nudge, and Kiss go only to the paired partner. Incoming gestures remain in their inbox until acknowledged; notifications and app badges include gestures and ShortNotes. No personal content is included in push payloads.

Pending release order:
1. Apply `supabase/migrations/20261025071846_couple_avatars_and_gestures.sql` to the existing **Secondary / AmiApp** project. It adds own-editable partner-visible avatars, couple-scoped gesture inboxes, a private identity-checking send broker, and a private push trigger. No existing entries are removed. Sends have a database-enforced 10-second cooldown and 60-per-24-hour cap per sender; clients cannot pick another recipient or forge timestamps.
2. Publish the updated `supabase/functions/shortnote-push/index.ts` with its existing JWT/webhook authentication settings. It supports both notification types and combines unread counts. Existing subscriptions and server-only VAPID keys are reused.
3. Build and publish `out/` on the existing Netlify project. The updated service worker uses fixed safe gesture text and opens the dashboard for gestures. iOS closed-app delivery still needs a physical Home Screen installation with notification permission.

Until that release, shared avatar saves, sending gestures, and live push delivery for gestures are unavailable against the hosted database. UI flows are checked with an isolated in-memory preview, not writes to real couple data. PGlite tests cover avatar ownership, couple isolation, recipient-only acknowledgement, immutable fields, cooldown/daily limits, and rejected direct inserts; local push tests cover webhook authentication, recipient routing, safe alert text, badge totals, and same-origin navigation.

The combined Goals & ambitions view includes existing `Goals` and `Ambitions` entries without deleting or rewriting them. Reminders live below Together for, food uses cuisine icons, places use pinned emoji notes, and the dashboard countdown always offers four slots. Dedicated countdown pages retain all records. Preview fixtures are kept outside application routes; no sample data is inserted into Supabase.

1. Sign into your preferred account at https://supabase.com/dashboard and create a **dedicated new project** for AmiApp.
2. For a fresh project, run all SQL files in `supabase/migrations/` in filename order once. Do not rerun them on the configured AmiApp project. Keep `private`, `vault`, and `net` out of the Data API exposed schemas; expose only `public` for this app. The push webhook URL in the migration and the production CORS/VAPID URL in the Edge Function must be changed for a different project/site. Deploy `supabase/functions/shortnote-push/index.ts` with its handler authentication (`verify_jwt=false` in `supabase/config.toml`). Confirm the project reference before applying anything.
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

## Relationship date, food, and iOS installation

After pairing, onboarding asks for an optional **Together since** date. Skip creates an empty settings row so it does not ask again. A late skip cannot overwrite a partner's already saved date. Either spouse can edit/remove it in **Settings**. The dashboard shows calendar years, months, and days only when a date is set; it refreshes at midnight without elapsed-millisecond/DST drift.

**Food to try** supports a dish, cuisine category, restaurant/place name, location/address, optional notes, and a tried checkbox. Category suggestions include Western, Malay, Kampung, Chinese, Indian, Japanese, Korean, Thai, Indonesian, Middle Eastern, Seafood, and Desserts. Custom categories are accepted; the list can be filtered by category. These records use the same couple RLS as other entries.

The app includes a standalone web manifest, 192/512 px maskable icons, and an opaque 180 px Apple touch icon. In Safari, use Share → Add to Home Screen. Re-add an old shortcut if iOS still shows a cached older icon. Actual home-screen installation must be verified on an iPhone; desktop checks validate the generated assets and metadata.

## Partner ShortNote notifications

Open **Settings → Enable notifications** from the installed app. iOS requires an installed Home Screen web app, iOS 16.4+, and permission granted after tapping the enable button. Enabling/disabling applies to the current device. Signing out unsubscribes that device and clears its badge. This does not enable push alarms for ordinary to-dos.

Every new ShortNote creates a partner-only unread record. A database trigger queues an authenticated pg_net webhook after commit; the Edge Function sends encrypted Web Push using VAPID. It always displays a generic alert, never note contents. The icon badge reflects unread ShortNotes and clears when those notes are opened. A notification tap opens ShortNotes. The service worker does not cache app pages or private data. Expired subscriptions are removed after 404/410 push responses. Delivery remains subject to OS notification settings, connectivity, and push-provider availability.

The Edge Function checks Supabase user tokens for public-key requests and a private, fixed-length webhook token for dispatch. Only paired users can subscribe. Endpoints are limited to Apple, Google FCM, and Mozilla push services to avoid arbitrary outbound URLs. Subscriptions are visible only to their owner. VAPID private keys and the webhook token are initialized on the server and stored in Supabase Vault; they never reach the browser or repository. Only a service-role-only RPC can retrieve them. No Apple Developer membership is required for standards-based Web Push.

Live checks cover the authenticated database webhook (HTTP 200), recipient-only unread records, key initialization/access restrictions, and the user API. Service-worker tests check visible private alerts, badge updates, and same-origin navigation. Actual closed-app iOS delivery requires a physical device test after permission is enabled. Supabase currently flags disabled leaked-password protection; review Auth password-security settings if your plan supports that feature.

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
