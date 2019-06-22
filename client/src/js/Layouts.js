export const allLayouts = {
  store: {
    lg: [
      { i: 'Transactions', x: 0, y: 0, w: 18, h: 11, hotkey: 'q' },
      { i: 'NewCustomers', x: 0, y: 6, w: 18, h: 11, hotkey: 'z' },
      // { i: 'ProductSunburst', x: 15, y: 0, w: 15, h: 11, hotkey: 'p' },
      { i: 'CustomerStats', x: 18, y: 6, w: 12, h: 22, hotkey: 'm' }
    ],
    md: [
      { i: 'Transactions', x: 0, y: 0, w: 13, h: 11, hotkey: 'q' },
      { i: 'NewCustomers', x: 0, y: 6, w: 13, h: 11, hotkey: 'z' },
      // { i: 'ProductSunburst', x: 11, y: 0, w: 11, h: 11, hotkey: 'p' },
      { i: 'CustomerStats', x: 13, y: 6, w: 9, h: 22, hotkey: 'm' }
    ],
    sm: [
      { i: 'Transactions', x: 0, y: 0, w: 9, h: 11, hotkey: 'q' },
      { i: 'NewCustomers', x: 0, y: 6, w: 9, h: 11, hotkey: 'z' },
      // { i: 'ProductSunburst', x: 8, y: 0, w: 8, h: 11, hotkey: 'p' },
      { i: 'CustomerStats', x: 9, y: 6, w: 7, h: 22, hotkey: 'm' }
    ],
    xs: [
      {
        i: 'Transactions',
        x: 0,
        y: 0,
        w: 2,
        h: 11,
        isDraggable: false,
        hotkey: 'q'
      },
      {
        i: 'NewCustomers',
        x: 0,
        y: 11,
        w: 2,
        h: 11,
        isDraggable: false,
        hotkey: 'z'
      },
      // { i: 'ProductSunburst', x: 0, y: 22, w: 2, h: 11, hotkey: 'p' },
      { i: 'CustomerStats', x: 0, y: 33, w: 2, h: 14, hotkey: 'm' }
    ],
    xxs: [
      {
        i: 'Transactions',
        x: 0,
        y: 0,
        w: 2,
        h: 11,
        isDraggable: false,
        hotkey: 'q'
      },
      {
        i: 'NewCustomers',
        x: 0,
        y: 11,
        w: 2,
        h: 11,
        isDraggable: false,
        hotkey: 'z'
      },
      // { i: 'ProductSunburst', x: 0, y: 22, w: 2, h: 11, hotkey: 'p' },
      { i: 'CustomerStats', x: 0, y: 33, w: 2, h: 14, hotkey: 'm' }
    ]
  },
  sport: {
    lg: [
      { i: 'SportMap', x: 0, y: 0, w: 15, h: 22, hotkey: 'q' },
      { i: 'CrossSelling', x: 15, y: 0, w: 15, h: 22, hotkey: 'p' }
    ],
    md: [
      { i: 'SportMap', x: 0, y: 0, w: 11, h: 22, hotkey: 'q' },
      { i: 'CrossSelling', x: 11, y: 0, w: 11, h: 22, hotkey: 'p' }
    ],
    sm: [
      { i: 'SportMap', x: 0, y: 0, w: 8, h: 22, hotkey: 'q' },
      { i: 'CrossSelling', x: 8, y: 0, w: 8, h: 22, hotkey: 'p' }
    ],
    xs: [
      {
        i: 'SportMap',
        x: 0,
        y: 0,
        w: 2,
        h: 22,
        isDraggable: false,
        hotkey: 'q'
      },
      {
        i: 'CrossSelling',
        x: 2,
        y: 22,
        w: 2,
        h: 22,
        isDraggable: false,
        hotkey: 'p'
      }
    ],
    xxs: [
      {
        i: 'SportMap',
        x: 0,
        y: 0,
        w: 2,
        h: 22,
        isDraggable: false,
        hotkey: 'q'
      },
      {
        i: 'CrossSelling',
        x: 2,
        y: 22,
        w: 2,
        h: 22,
        isDraggable: false,
        hotkey: 'p'
      }
    ]
  }
}

// export const defaultLayouts = {
//   lg: [
//     { i: 'TL', x: 0, y: 0, w: 15, h: 11 },
//     { i: 'TR', x: 15, y: 0, w: 15, h: 11 },
//     { i: 'BL', x: 0, y: 6, w: 15, h: 11 },
//     { i: 'BR', x: 15, y: 6, w: 15, h: 11 }
//   ],
//   md: [
//     { i: 'TL', x: 0, y: 0, w: 11, h: 11 },
//     { i: 'TR', x: 11, y: 0, w: 11, h: 11 },
//     { i: 'BL', x: 0, y: 6, w: 11, h: 11 },
//     { i: 'BR', x: 11, y: 6, w: 11, h: 11 }
//   ],
//   sm: [
//     { i: 'TL', x: 0, y: 0, w: 8, h: 11 },
//     { i: 'TR', x: 8, y: 0, w: 8, h: 11 },
//     { i: 'BL', x: 0, y: 6, w: 8, h: 11 },
//     { i: 'BR', x: 8, y: 6, w: 8, h: 11 }
//   ],
//   xs: [
//     { i: 'TL', x: 0, y: 0, w: 2, h: 11 },
//     { i: 'TR', x: 0, y: 8, w: 2, h: 11 },
//     { i: 'BL', x: 0, y: 16, w: 2, h: 11 },
//     { i: 'BR', x: 0, y: 24, w: 2, h: 11 }
//   ],
//   xxs: [
//     { i: 'TL', x: 0, y: 0, w: 2, h: 11 },
//     { i: 'TR', x: 0, y: 8, w: 2, h: 11 },
//     { i: 'BL', x: 0, y: 16, w: 2, h: 11 },
//     { i: 'BR', x: 0, y: 24, w: 2, h: 11 }
//   ]
// }
