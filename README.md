# Noest

Noest is a fast, installable notes app inspired by the simplicity of native desktop notes software. It supports rich-text editing, folders, checklists, dark mode, offline use, and optional cross-device sync through Supabase.

![Noest desktop interface](docs/noest-desktop.png)

## Features

- Rich-text notes with headings, hyphen lists (including nested lists created with `-` + Space and Tab), checklists, quotes, links, and formatting
- Folder creation, renaming, and deletion
- Search, sorting, pinning, and list or grid views
- Local persistence with restoration of the last-opened note
- Optional authenticated Supabase live sync across devices, with note-level conflict protection
- Persistent sign-in sessions
- Responsive mobile interface and dark mode
- Progressive Web App support for home-screen installation and offline loading
- Apple Notes checklist preservation when pasting compatible rich text

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/harvestwalukow/noest.git
cd noest
npm install
cp .env.example .env.local
npm run dev
```

Noest works locally without Supabase. To enable accounts and cloud sync, fill in `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then run [`supabase/migrations/001_noest_documents.sql`](supabase/migrations/001_noest_documents.sql) in your Supabase project's SQL editor. The migration enables row-level security so authenticated users can access only their own document.

When signed in, edits are written to Supabase shortly after typing and delivered to other open devices through Supabase Realtime. Each note carries a local edit timestamp so a stale device cannot overwrite a newer note while it is hydrating.

## Build

```bash
npm run build
npm run preview
```

The production output is written to `dist/`. The included `vercel.json` supports direct deployment as a single-page app.

## Contributing

Issues and pull requests are welcome. Keep interface changes responsive, accessible, and consistent with the project's single-font Inter design system.

## License

[MIT](LICENSE)

Noest is an independent project and is not affiliated with or endorsed by Apple Inc.
