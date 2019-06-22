import React from 'react'

export const PlaybookContext = React.createContext({
  example: ['this', 'is', 'an', 'example', 'of', 'a', 'context'],
  example2: 'gee, if this works its gonna be great',
  example3: { like: 'really great' },
  controls: {
    on: false, // if control mode is on
    panel: {
      on: false, // if the control panel mode is currently on
      target: null // the panel currently under control
    },
    prev: {
      panel: {}
    }
  },
  setControls: controls => {
    this.setState({ controls })
  }
})
