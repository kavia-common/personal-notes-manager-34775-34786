import Blits from '@lightningjs/blits'
import App from './App.js'

// Launch the LightningJS (Blits) application.
// Note: Lightning renders via WebGL, not DOM. The container's index.html has a #app mount.
Blits.Launch(App, 'app', {
  w: 1920,
  h: 1080,
  debug: false,
  deviceLogicalPixelRatio: 1,
  keys: {
    // Basic key mappings including common shortcuts
    13: 'Enter',
    8: 'Back',
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down',
    78: 'N', // N
    83: 'S', // S
  },
})
