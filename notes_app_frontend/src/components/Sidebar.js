import Blits from '@lightningjs/blits'

function truncate(text, len = 42) {
  const t = String(text || '')
  return t.length > len ? `${t.slice(0, len - 1)}…` : t
}

export default Blits.Component('Sidebar', {
  props: ['notes', 'activeId', 'onSelect', 'onSearch', 'onNew', 'query'],

  template: `
    <Element :w="$w" :h="$h" :color="$bg">
      <!-- Search bar -->
      <Element x="20" y="20" w="480" h="64" :color="$surface" radius="16">
        <Text x="20" y="18" content="Search..." :textColor="$placeholder" fontSize="24" />
        <Text x="160" y="18" :content="$queryText" :textColor="$text" fontSize="24" />
      </Element>

      <!-- New note button -->
      <Element x="20" y="100" w="200" h="56" :color="$primary" radius="16" @enter="$newNote">
        <Text x="20" y="10" content="+ New" textColor="0xFFFFFFFF" fontSize="28" />
      </Element>

      <!-- Notes list -->
      <Element x="0" y="172" :w="$w" :h="$h - 172" color="0x00FFFFFF">
        <Element
          :for="(item, index) in $notes"
          :key="$item.id"
          :x="0"
          :y="$index * 88"
          w="520"
          h="84"
          :color="$item.id === $activeId ? $activeBg : $rowBg"
          @enter="$select($item.id)"
        >
          <Element x="20" y="12" w="480" h="60" color="0x00FFFFFF">
            <Text x="0" y="0" :content="$formatTitle($item.title)" :textColor="$titleColor($item.id)" fontSize="26" />
            <Text x="0" y="30" :content="$formatPreview($item.content)" :textColor="$muted" fontSize="20" />
          </Element>
        </Element>
      </Element>
    </Element>
  `,

  state() {
    return {
      bg: 0xF3F4F6, // gray-100
      surface: 0xFFFFFF,
      rowBg: 0x00FFFFFF,
      activeBg: 0xDBEAFE, // blue-100
      text: 0x111827,
      muted: 0x6B7280,
      placeholder: 0x9CA3AF,
      primary: 0x2563EB,
      _lastQuery: '',
    }
  },

  computed: {
    notesSafe() {
      return this.notes || []
    },
    queryText() {
      return String(this.query || '')
    }
  },

  methods: {
    $formatTitle(t) {
      return truncate(t || 'Untitled note', 32)
    },
    $formatPreview(c) {
      return truncate(c || '', 40)
    },
    $titleColor(id) {
      return id === this.activeId ? 0x1F2937 : this.text
    },
    $select(id) {
      if (typeof this.onSelect === 'function') this.onSelect(id)
    },
    $newNote() {
      if (typeof this.onNew === 'function') this.onNew()
    }
  },

  // Simulate input field for search: left/right modifies query minimally for demo,
  // In real app, integrate text input plugin; here we keep simple with keyboard.
  input: {
    left() {
      const q = String(this.query || '')
      if (q.length > 0 && typeof this.onSearch === 'function') {
        this.onSearch(q.slice(0, -1))
      }
    },
    right() {
      // No-op
    },
    up() {
      // Move selection up
      const items = this.notes || []
      if (!items.length) return
      const idx = Math.max(0, items.findIndex(n => n.id === this.activeId))
      const next = idx > 0 ? items[idx - 1] : items[0]
      if (next && typeof this.onSelect === 'function') this.onSelect(next.id)
    },
    down() {
      const items = this.notes || []
      if (!items.length) return
      const idx = Math.max(0, items.findIndex(n => n.id === this.activeId))
      const next = idx < items.length - 1 ? items[idx + 1] : items[items.length - 1]
      if (next && typeof this.onSelect === 'function') this.onSelect(next.id)
    },
    enter() {
      // Enter handled by row @enter
    }
  }
})
