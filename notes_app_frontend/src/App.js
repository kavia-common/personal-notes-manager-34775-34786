import Blits from '@lightningjs/blits'
import Header from './components/Header.js'
import Sidebar from './components/Sidebar.js'
import NoteEditor from './components/NoteEditor.js'

// Local storage key constant
const STORAGE_KEY = 'notes_v1'

// Simple debounce helper for autosave
function debounce(fn, wait = 500) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

// PUBLIC_INTERFACE
function loadNotes() {
  /** Load notes array from localStorage. */
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch (e) {
    console.warn('Failed to parse notes from localStorage', e)
    return []
  }
}

// PUBLIC_INTERFACE
function saveNotes(notes) {
  /** Save notes array to localStorage. */
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes || []))
  } catch (e) {
    console.warn('Failed to save notes', e)
  }
}

// PUBLIC_INTERFACE
function createNote() {
  /** Create a new note object. */
  const now = Date.now()
  return {
    id: `note_${now}_${Math.random().toString(36).slice(2)}`,
    title: 'Untitled note',
    content: '',
    updatedAt: now,
  }
}

// PUBLIC_INTERFACE
function deleteNoteById(notes, id) {
  /** Delete a note by id and return new notes array. */
  return (notes || []).filter(n => n.id !== id)
}

// PUBLIC_INTERFACE
function updateNote(notes, updated) {
  /** Update a note in array by id and return new notes array. */
  const idx = (notes || []).findIndex(n => n.id === updated.id)
  if (idx === -1) return notes
  const newArr = notes.slice()
  newArr[idx] = { ...updated, updatedAt: Date.now() }
  return newArr
}

// PUBLIC_INTERFACE
function sortNotesByUpdatedAtDesc(notes) {
  /** Return new array sorted by updatedAt desc. */
  return (notes || []).slice().sort((a, b) => b.updatedAt - a.updatedAt)
}

export default Blits.Application({
  name: 'NotesApp',
  components: { Header, Sidebar, NoteEditor },

  // Main Template: 2-pane layout with header
  template: `
    <Element color="0x00FFFFFF" w="1920" h="1080">
      <Element w="1920" h="1080" :color="$bgColor">
        <!-- Subtle top header -->
        <Header
          x="40"
          y="24"
          w="1840"
          h="80"
          :title="$appTitle"
          :noteCount="$filteredNotes.length"
          :onNew="$handleNewNote"
          :onDelete="$handleDeleteNote"
          :canDelete="$selectedNote != null"
        />

        <!-- Content area card -->
        <Element x="40" y="120" w="1840" h="920" :color="$surfaceColor" radius="24" :alpha="$surfaceAlpha" :shader="$shadowShader">
          <!-- Sidebar -->
          <Sidebar
            x="0"
            y="0"
            w="520"
            h="920"
            :notes="$filteredNotes"
            :activeId="$selectedId"
            :query="$query"
            :onSelect="$handleSelect"
            :onSearch="$handleSearch"
            :onNew="$handleNewNote"
          />

          <!-- Divider -->
          <Element x="520" y="0" w="2" h="920" :color="$dividerColor" />

          <!-- Editor -->
          <NoteEditor
            x="540"
            y="0"
            w="1280"
            h="920"
            :note="$selectedNote"
            :onChangeTitle="$handleChangeTitle"
            :onChangeContent="$handleChangeContent"
            :empty="$emptyState"
          />
        </Element>
      </Element>
    </Element>
  `,

  state() {
    const notes = sortNotesByUpdatedAtDesc(loadNotes())
    const selectedId = notes[0]?.id ?? null
    return {
      appTitle: 'Ocean Notes',
      notes,
      selectedId,
      query: '',
      // Theme colors using integer ARGB (0xAARRGGBB-like) - but Lightning uses 0xRRGGBB (alpha separate)
      bgColor: 0xf9fafb, // background
      surfaceColor: 0xffffff,
      surfaceAlpha: 1,
      dividerColor: 0xE5E7EB, // gray-200
      // Simple drop shadow via shader (fake using alpha rectangles fallback)
      shadowShader: null,
    }
  },

  computed: {
    filteredNotes() {
      if (!this.query) return this.notes
      const q = this.query.toLowerCase()
      return this.notes.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q)
      )
    },
    selectedNote() {
      return this.notes.find(n => n.id === this.selectedId) || null
    },
    emptyState() {
      return !this.selectedNote
    }
  },

  methods: {
    // Keyboard shortcuts
    onInit() {
      // Debounced save function for autosave
      this._debouncedPersist = debounce(() => {
        saveNotes(this.notes)
      }, 500)
    },

    // PUBLIC_INTERFACE
    $handleNewNote() {
      /** Create a new note and select it. */
      const n = createNote()
      const updated = sortNotesByUpdatedAtDesc([n, ...this.notes])
      this.notes = updated
      this.selectedId = n.id
      saveNotes(updated)
    },

    // PUBLIC_INTERFACE
    $handleDeleteNote() {
      /** Delete currently selected note with confirmation. */
      if (!this.selectedNote) return
      const confirmed = confirm('Delete this note? This cannot be undone.')
      if (!confirmed) return
      const updated = deleteNoteById(this.notes, this.selectedId)
      this.notes = sortNotesByUpdatedAtDesc(updated)
      this.selectedId = this.notes[0]?.id ?? null
      saveNotes(this.notes)
    },

    // PUBLIC_INTERFACE
    $handleSelect(id) {
      /** Select a note by id. */
      this.selectedId = id
    },

    // PUBLIC_INTERFACE
    $handleSearch(q) {
      /** Update search query to filter notes. */
      this.query = q || ''
    },

    // PUBLIC_INTERFACE
    $handleChangeTitle(val) {
      /** Update title of selected note with autosave. */
      if (!this.selectedNote) return
      const updated = { ...this.selectedNote, title: val, updatedAt: Date.now() }
      this.notes = sortNotesByUpdatedAtDesc(updateNote(this.notes, updated))
      this._debouncedPersist()
    },

    // PUBLIC_INTERFACE
    $handleChangeContent(val) {
      /** Update content of selected note with autosave. */
      if (!this.selectedNote) return
      const updated = { ...this.selectedNote, content: val, updatedAt: Date.now() }
      this.notes = sortNotesByUpdatedAtDesc(updateNote(this.notes, updated))
      this._debouncedPersist()
    },
  },

  input: {
    // Navigation is minimal; capture shortcuts
    enter() {},

    // Ctrl/Cmd+N for new note and Ctrl/Cmd+S to save
    // Lightning key events provide key info via event if available
    // We simulate by mapping N and S and checking modifier presence via browser KeyboardEvent if supplied.
    N(e) {
      if (e && (e.ctrlKey || e.metaKey)) {
        this.$handleNewNote()
        if (e.preventDefault) e.preventDefault()
      }
    },
    S(e) {
      if (e && (e.ctrlKey || e.metaKey)) {
        // Manual save
        saveNotes(this.notes)
        if (e.preventDefault) e.preventDefault()
      }
    },
    back() {
      // Could add back navigation if router used
      return false
    }
  }
})
