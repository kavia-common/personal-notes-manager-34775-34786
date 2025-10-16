import Blits from '@lightningjs/blits'

export default Blits.Component('Header', {
  props: ['title', 'noteCount', 'onNew', 'onDelete', 'canDelete'],

  template: `
    <Element :w="$w" :h="$h" color="0x00FFFFFF">
      <!-- Title -->
      <Text
        x="0"
        y="0"
        :content="$titleText"
        :textColor="$textColor"
        fontSize="36"
        fontFace="Regular"
      />

      <!-- Actions container -->
      <Element :x="$w - 320" y="-6" w="320" h="60" color="0x00FFFFFF">
        <Element
          x="0"
          y="0"
          w="150"
          h="56"
          :color="$primaryColor"
          radius="16"
          @enter="$createNote"
        >
          <Text x="20" y="10" content="+ New" textColor="0xFFFFFFFF" fontSize="28" />
        </Element>

        <Element
          x="170"
          y="0"
          w="150"
          h="56"
          :color="$deleteColor"
          radius="16"
          :alpha="$deleteAlpha"
          @enter="$deleteNote"
        >
          <Text x="20" y="10" content="Delete" :textColor="$deleteTextColor" fontSize="28" />
        </Element>
      </Element>

      <!-- Subtitle/meta -->
      <Text
        x="0"
        y="44"
        :content="$subtitle"
        :textColor="$mutedText"
        fontSize="22"
        fontFace="Regular"
      />
    </Element>
  `,

  state() {
    return {
      textColor: 0x111827,
      mutedText: 0x6B7280,
      primaryColor: 0x2563EB,
      deleteColor: 0xEF4444,
    }
  },

  computed: {
    titleText() {
      return this.title || 'Ocean Notes'
    },
    subtitle() {
      const count = this.noteCount || 0
      return `${count} note${count === 1 ? '' : 's'}`
    },
    deleteAlpha() {
      return this.canDelete ? 1 : 0.5
    },
    deleteTextColor() {
      return this.canDelete ? 0xFFFFFFFF : 0xFFEEEEEE
    }
  },

  methods: {
    $createNote() {
      if (typeof this.onNew === 'function') this.onNew()
    },
    $deleteNote() {
      if (!this.canDelete) return
      if (typeof this.onDelete === 'function') this.onDelete()
    }
  }
})
