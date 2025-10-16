import Blits from '@lightningjs/blits'

function displayEmptyText() {
  return 'Create a new note or select one from the list'
}

export default Blits.Component('NoteEditor', {
  props: ['note', 'onChangeTitle', 'onChangeContent', 'empty'],

  template: `
    <Element :w="$w" :h="$h" color="0x00FFFFFF">
      <Element x="20" y="20" :w="$w - 40" :h="$h - 40" :color="$surface" radius="16">
        <!-- Empty state -->
        <Element :alpha="$empty ? 1 : 0" x="0" y="0" :w="$w - 40" :h="$h - 40" color="0x00FFFFFF">
          <Text x="40" y="40" :content="$emptyText" :textColor="$muted" fontSize="28" />
        </Element>

        <!-- Editor area -->
        <Element :alpha="$empty ? 0 : 1" x="0" y="0" :w="$w - 40" :h="$h - 40" color="0x00FFFFFF">
          <!-- Title -->
          <Element x="40" y="40" :w="$w - 120" h="60" :color="$titleBg" radius="12">
            <Text x="20" y="12" :content="$titleText" :textColor="$titleColor" fontSize="30" />
          </Element>

          <!-- Content -->
          <Element x="40" y="120" :w="$w - 120" :h="$h - 200" :color="$contentBg" radius="12">
            <Text x="20" y="16" :content="$contentText" :textColor="$contentColor" fontSize="24" />
          </Element>
        </Element>
      </Element>
    </Element>
  `,

  state() {
    return {
      surface: 0xFFFFFF,
      muted: 0x6B7280,
      titleBg: 0xF3F4F6,
      contentBg: 0xF9FAFB,
      titleColor: 0x111827,
      contentColor: 0x1F2937,
      // Internal buffers to simulate editing
      _title: '',
      _content: '',
    }
  },

  computed: {
    emptyText() {
      return displayEmptyText()
    },
    titleText() {
      if (!this.note) return ''
      return this._title || this.note.title || 'Untitled note'
    },
    contentText() {
      if (!this.note) return ''
      return this._content || this.note.content || ''
    }
  },

  methods: {
    _ensureBuffers() {
      if (!this.note) {
        this._title = ''
        this._content = ''
      } else {
        this._title = this.note.title || ''
        this._content = this.note.content || ''
      }
    },
    // PUBLIC_INTERFACE
    $applyTitleChange(val) {
      /** Update title via callback. */
      if (typeof this.onChangeTitle === 'function') {
        this.onChangeTitle(val)
      }
    },
    // PUBLIC_INTERFACE
    $applyContentChange(val) {
      /** Update content via callback. */
      if (typeof this.onChangeContent === 'function') {
        this.onChangeContent(val)
      }
    }
  },

  watch: {
    note() {
      this._ensureBuffers()
    }
  },

  onInit() {
    this._ensureBuffers()
  },

  // Minimal editing via keyboard: simulate append/backspace behavior for demo
  input: {
    left() {},
    right() {},
    up() {
      // switch focus to title editing
      this._editing = 'title'
    },
    down() {
      // switch focus to content editing
      this._editing = 'content'
    },
    back() {
      if (!this.note) return
      if (this._editing === 'content') {
        this._content = String(this._content).slice(0, -1)
        this.$applyContentChange(this._content)
      } else {
        this._title = String(this._title).slice(0, -1)
        this.$applyTitleChange(this._title)
      }
    },
    enter() {
      if (!this.note) return
      // Insert line break in content
      if (this._editing === 'content') {
        this._content = `${this._content}\n`
        this.$applyContentChange(this._content)
      }
    },
    // Append characters for a small subset (simulate typing letters/numbers/spaces)
    // Note: In real apps you'd integrate proper text input plugin.
    // Here we support basic space and dot for demonstration.
    // Use key codes from mapped keys in app launch or event.key if provided.
    // We'll try to read e.key when available.
    _appendChar(ch) {
      if (!this.note) return
      if (this._editing === 'content') {
        this._content = `${this._content}${ch}`
        this.$applyContentChange(this._content)
      } else {
        this._title = `${this._title}${ch}`
        this.$applyTitleChange(this._title)
      }
    },
    // Using generic handler where possible
    S(e) {
      // ignore save here; handled at App level
    },
    N(e) {
      // ignore new here; handled at App level
    }
  }
})
