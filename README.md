# Not Notes

Not Notes is a fast, installable notes app inspired by the simplicity of native desktop notes software. It supports rich-text editing, folders, checklists, dark mode, offline use, and optional cross-device sync through Supabase.

![Not Notes desktop interface](docs/noest-desktop.png)

## Features

- Rich-text notes with headings, hyphen lists (including nested lists), checklists, quotes, links, and formatting; pressing Enter on an empty hyphen item removes the bullet
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
git clone https://github.com/harvestwalukow/not-notes.git
cd not-notes
npm install
cp .env.example .env.local
npm run dev
```

Not Notes works locally without Supabase. To enable accounts and cloud sync, fill in `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then run [`supabase/migrations/001_noest_documents.sql`](supabase/migrations/001_noest_documents.sql) and [`supabase/migrations/002_rename_noest_documents.sql`](supabase/migrations/002_rename_noest_documents.sql) in your Supabase project's SQL editor. The migrations enable row-level security so authenticated users can access only their own document. The table is named `not_notes_documents`; the second migration preserves data from existing Noest databases.

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

Not Notes is an independent project and is not affiliated with or endorsed by Apple Inc. The custom apple-shaped mark is an original app symbol, not an Apple logo.
