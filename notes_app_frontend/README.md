# Ocean Notes - LightningJS Frontend

A modern personal notes manager built with LightningJS (Blits), featuring a sidebar, editor, and localStorage persistence. Styled with the Ocean Professional theme.

Features:
- Two-pane layout: Sidebar (search, new note, list) + Main editor
- Create, select, edit, and delete notes
- Autosave (500ms debounce) and manual save (Ctrl/Cmd+S)
- Keyboard shortcut for new note (Ctrl/Cmd+N)
- Notes persisted in localStorage under key `notes_v1`
- Search filters notes by title and content
- Modern theme with rounded corners and subtle shadows
- Accessible labels and focus outlines
- No external services or environment variables required

Run locally:
1. Install dependencies
   - npm install
2. Start dev server (port 3000)
   - npm run dev
3. Open http://localhost:3000

Data model:
- Note: { id: string, title: string, content: string, updatedAt: number } stored in localStorage.

Notes:
- LightningJS renders via WebGL; UI is defined in Blits components (no DOM manipulation).
- The root element is #app and the app entry is src/index.js.
