import React from 'react'
import NavBar from './NavBar/NavBar'
import SideBar from './SideBar/SideBar'

import { allLayouts } from './Layouts'

import { deque, arrayRemove } from './Utils/utils'
import { defaultDateRange } from './defaultDateRange'

import '/css/Master.css'

import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

import { schemeCategory10 } from 'd3-scale-chromatic'
import { scaleOrdinal } from 'd3-scale'
import { geoAlbers } from 'd3-geo'

import Query from './Queries'
import transactions_map from '/transactions_map.json'
import newCustomers_map from '/newCustomers_map.json'
import sportMap_map from '/sportMap_map.json'

import { PlaybookContext } from './Context/Context'
import omit from 'lodash.omit'

class Master extends React.Component {
  static contextType = PlaybookContext

  constructor(props) {
    super(props)
    const colours = scaleOrdinal(schemeCategory10)
    const range = [...Array(50).keys()]
    const allColours = range.map(d => colours(d))
    const defaultLayouts = allLayouts[this.props.match.path.substr(1)]
    const keys = defaultLayouts['lg'].map(e => e['i']) // chart names
    const hotkeys = defaultLayouts['lg'].map(e => e['hotkey']) // hotkeys
    const hotkeyMap = hotkeys.reduce((o, k, i) => ({ ...o, [k]: keys[i] }), {}) // hotkey : chart mapping
    const transactionsLastUpdate = new Date(transactions_map['last_updated'])
    const newCustomersLastUpdate = new Date(newCustomers_map['last_updated'])
    const sportMapLastUpdate = new Date(sportMap_map['last_updated'])

    const rootElement = document.getElementById('root')
    rootElement.style.height = 'auto'

    this.state = {
      layouts: defaultLayouts,
      previousLayouts: [defaultLayouts],
      currentLayout: defaultLayouts['lg'],
      currentBreakpoint: 'lg',
      cols: { lg: 30, md: 22, sm: 16, xs: 1, xxs: 1 },
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
      keys: keys,
      hotkeys: hotkeys,
      hotkeyMap: hotkeyMap,
      rowHeight: (window.innerHeight - 23 * 10 - 50) / 22, // https://github.com/STRML/react-grid-layout/issues/233#issuecomment-319995357
      horizontalGridItems: defaultLayouts['lg'].filter(el => {
        return el.y == 0
      }).length,
      controls: {
        on: true, // if control mode is on
        panel: {
          on: false, // if the control panel mode is currently on
          target: null // the panel currently under control
        },
        prev: {
          panel: {}
        }
      },
      allColours: allColours,
      transactionOptions: {
        nodata: false,
        dateRange: defaultDateRange('Week', transactionsLastUpdate),
        dateRangeAggLevel: 'Week',
        target: null,
        yMap: {
          'Average Basket': 'avgBasket',
          'Total Revenue': 'total_revenue',
          'Total Transactions': 'total_transactions'
        },
        yMapInv: {
          avgBasket: 'Average Basket',
          total_revenue: 'Total Revenue',
          total_transactions: 'Total Transactions'
        },
        yAxisVar: 'avgBasket',
        yAxisVars: ['Average Basket', 'Total Revenue', 'Total Transactions'],
        channels: [],
        currentStores: [33815, 33805],
        currentSports: [],
        colourMap: [33815, 33805].reduce(
          (o, k, i) => ({ ...o, [k]: allColours[i] }),
          {}
        ),
        identified: [],
        toggles: {
          dateRange: this.onCalendarChange,
          currentStores: this.onSidebarStoreChange,
          currentSports: this.onSidebarSportChange,
          channels: this.onSideBarChannelChange,
          identified: this.onSideBarIdentifiedChange,
          yAxisVars: this.onSidebarVarChange,
          calendarAggregation: this.onCalendarAggregationChange
        },
        lastUpdate: transactionsLastUpdate
      },
      newCustomerOptions: {
        toggles: {
          yAxisVars: this.onSidebarVarChange,
          currentStores: this.onSidebarStoreChange,
          dateRange: this.onCalendarChange,
          calendarAggregation: this.onCalendarAggregationChange
        },
        nodata: false,
        dateRange: defaultDateRange('Week', newCustomersLastUpdate),
        dateRangeAggLevel: 'Week',
        target: null,
        yMap: {
          'All Routes': 'nb_total',
          Online: 'nb_online',
          'Mobile In Store': 'nb_cube_in_store',
          Tills: 'nb_adhesion_light'
        },
        yMapInv: {
          nb_total: 'All Routes',
          nb_online: 'Online',
          nb_cube_in_store: 'Mobile In Store',
          nb_adhesion_light: 'Tills'
        },
        yAxisVar: 'nb_total',
        yAxisVars: ['All Routes', 'Online', 'Mobile In Store', 'Tills'],
        currentStores: [33815, 33805],
        colourMap: [33815, 33805].reduce(
          (o, k, i) => ({ ...o, [k]: allColours[i] }),
          {}
        ),
        channelType: [0, 1],
        lastUpdate: newCustomersLastUpdate
      },
      sportMapOptions: {
        toggles: {
          currentSports: this.onSidebarVarChange,
          dateRange: this.onSidebarSliderChange
        },
        onZoom: this.onSportMapZoom,
        projection: geoAlbers()
          .center([-4, 57.8])
          .rotate([-2, 0])
          .parallels([45, 65])
          .scale(4150),
        scale: 4150,
        draggable: false,
        dateRange: defaultDateRange('Month', sportMapLastUpdate),
        currentSport: 35,
        lastUpdate: sportMapLastUpdate
      },
      crossSellingOptions: {
        currentSports: [35],
        target: null,
        skip: 0,
        limit: 20,
        onFetch: this.onCrossSellingFetchData,
        toggles: {
          currentSports: this.onSidebarSportChangeSingle
        }
      },
      customerStatOptions: {
        currentStore: 33805,
        target: null,
        toggles: {
          currentStore: this.onSidebarVarChange
        }
      },
      productSunburstOptions: {
        currentStore: [318631],
        currentSport: [5],
        currentDepartment: [458, 127],
        currentSubDepartment: [2232, 2227, 1908, 1925],
        currentFamily: [12091, 12071, 3075, 3716]
      }
    }

    this.sidebar = React.createRef()
    this.onControlItemClick = this.onControlItemClick.bind(this)
    this.onBreakpointChange = this.onBreakpointChange.bind(this)
    this.onLayoutChange = this.onLayoutChange.bind(this)
    this.handleResize = this.handleResize.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.onLogoClick = this.onLogoClick.bind(this)
    this.onSidebarStoreChange = this.onSidebarStoreChange.bind(this)
    this.onSidebarStateChange = this.onSidebarStateChange.bind(this)
    this.onCalendarChange = this.onCalendarChange.bind(this)
    this.onCrossSellingFetchData = this.onCrossSellingFetchData.bind(this)
  }

  onLogoClick() {
    console.log('Clicked the logo!')
  }

  handleResize() {
    this.setState({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      colWidth: (
        (window.innerWidth - 4 * this.state.horizontalGridItems) /
        this.state.cols[this.state.currentBreakpoint]
      ).toFixed(2),
      rowHeight: (window.innerHeight - 23 * 10 - 50) / 22
    })
  }

  // when the current breakpoint of React Grid Layout change
  onBreakpointChange = breakpoint => {
    console.log('In master:', breakpoint)
    this.setState({
      colWidth: (window.innerWidth / this.state.cols[breakpoint]).toFixed(2),
      currentBreakpoint: breakpoint
    })
  }

  onLayoutChange = (layout, layouts) => {
    if (layout !== this.state.currentLayout) {
      this.setState(prevState => ({
        currentLayout: layout,
        horizontalGridItems: layout.filter(el => {
          return el.y == 0
        }).length,
        previousLayouts: prevState.controls.panel.on
          ? prevState.previousLayouts
          : deque(prevState.previousLayouts, layouts)
      }))
    }
  }

  getControlPanelKey(clickedKey, breakpoint) {
    const controlLayout = []
    const x = this.state.cols[breakpoint] / 2
    this.state.keys.forEach(key => {
      if (key === clickedKey) {
        controlLayout.push({ i: key, x: x, y: 0, w: x, h: 22, static: true })
      } else {
        controlLayout.push({ i: key, x: x, y: 0, w: x, h: 0, minH: 0 })
      }
    })
    return controlLayout
  }

  // Get layouts when this.state.controlPanel changed from 0 to 1
  getControlPanelLayouts(key) {
    var layoutObj = {}
    Object.keys(this.state.breakpoints).forEach(breakpoint => {
      layoutObj[breakpoint] = this.getControlPanelKey(key, breakpoint)
    })
    return layoutObj
  }

  // if the control button at the top right is clicked
  onControlClick = () => {
    // if the state not showing the control panel

    if (this.state.controls.panel.on) {
      this.setState(({ previousLayouts, controls }) => ({
        controls: {
          ...controls,
          on: !controls.on,
          panel: {
            on: false,
            target: null
          },
          prev: omit(controls, ['prev'])
        },
        layouts: previousLayouts[0]
      }))
    } else {
      this.setState(({ previousLayouts, controls }) => ({
        controls: {
          ...controls,
          on: !controls.on,
          panel: {
            on: controls.panel.on ? !controls.panel.on : false,
            target: null
          },
          prev: omit(controls, ['prev'])
        },
        layouts: previousLayouts[1]
      }))
    }
  }

  // if a control item gets clicked
  onControlItemClick = key => {
    // log which element is now being 'controlled'
    // console.log('onControlItemClick')
    if (this.state.controls.panel.on) {
      this.setState(({ previousLayouts, controls, transactionOptions }) => ({
        controls: {
          ...controls,
          on: !controls.on,
          panel: {
            on: !controls.panel.on,
            target: controls.panel.target === key ? null : key
          },
          prev: omit(controls, ['prev'])
        },
        layouts: previousLayouts[0]
      }))
    } else {
      this.setState(
        ({
          controls,
          horizontalGridItems,
          currentBreakpoint,
          cols,
          previousLayouts
        }) => ({
          controls: {
            ...controls,
            panel: {
              on: !controls.panel.on,
              target: controls.panel.target === key ? null : key
            },
            prev: omit(controls, ['prev'])
          },
          layouts:
            currentBreakpoint !== 'xs' && currentBreakpoint !== 'xxs'
              ? this.getControlPanelLayouts(key)
              : previousLayouts[1],
          colWidth: (
            (window.innerWidth - 6 * horizontalGridItems) /
            cols[currentBreakpoint]
          ).toFixed(2)
        })
      )
    }
  }

  onCalendarChange = (dateRange, panel) => {
    const panelToOpts = {
      transactions: 'transactionOptions',
      newCustomers: 'newCustomerOptions'
    }

    this.setState(prevState => ({
      [panelToOpts[panel]]: {
        ...prevState[panelToOpts[panel]],
        dateRange: dateRange,
        target: 'dateRange'
      }
    }))
  }

  onCalendarAggregationChange = (level, panel) => {
    const panelToOpts = {
      transactions: 'transactionOptions',
      newCustomers: 'newCustomerOptions'
    }

    this.setState(prevState => ({
      [panelToOpts[panel]]: {
        ...prevState[panelToOpts[panel]],
        dateRangeAggLevel: level,
        dateRange: defaultDateRange(
          level,
          prevState[panelToOpts[panel]].lastUpdate
        ),
        target: 'dateRangeAggLevel'
      }
    }))
  }

  onSideBarChannelChange = (id, key, panel) => {
    const panelToOpts = {
      transactions: 'transactionOptions'
    }

    id = parseInt(id)
    const {
      [panelToOpts[panel]]: { channels }
    } = this.state

    if (channels.includes(id)) {
      this.setState(prevState => ({
        [panelToOpts[panel]]: {
          ...prevState[panelToOpts[panel]],
          channels: arrayRemove(channels, id),
          target: 'channels'
        }
      }))
    } else {
      this.setState(prevState => ({
        [panelToOpts[panel]]: {
          ...prevState[panelToOpts[panel]],
          channels: channels.concat([id]),
          target: 'channels'
        }
      }))
    }
  }

  onSidebarSportChangeSingle = (id, key, panel) => {
    const panelToOpts = {
      crossSelling: 'crossSellingOptions'
    }

    id = parseInt(id)

    const {
      [panelToOpts[panel]]: { curentSports }
    } = this.state

    // fix this awful code please
    var extraCrossSellingState = {}
    if (panelToOpts[panel] === 'crossSellingOptions') {
      extraCrossSellingState['currentSports'] = [id]
      extraCrossSellingState['target'] = 'currentSports'
    }

    this.setState(prevState => ({
      [panelToOpts[panel]]: {
        ...prevState[panelToOpts[panel]],
        ...extraCrossSellingState
      }
    }))
  }

  onSidebarSportChange = (id, key, panel) => {
    const panelToOpts = {
      transactions: 'transactionOptions',
      newCustomers: 'newCustomerOptions',
      crossSelling: 'crossSellingOptions'
    }

    id = parseInt(id)
    const {
      [panelToOpts[panel]]: { currentSports }
    } = this.state

    if (currentSports.includes(id)) {
      this.setState(prevState => ({
        [panelToOpts[panel]]: {
          ...prevState[panelToOpts[panel]],
          currentSports: arrayRemove(currentSports, id),
          target: 'sports'
        }
      }))
    } else {
      this.setState(prevState => ({
        [panelToOpts[panel]]: {
          ...prevState[panelToOpts[panel]],
          currentSports: currentSports.concat([id]),
          target: 'sports'
        }
      }))
    }
  }

  onSideBarIdentifiedChange = (id, key, panel) => {
    const panelToOpts = {
      transactions: 'transactionOptions'
    }
    id = parseInt(id)
    const {
      [panelToOpts[panel]]: { identified, yMap, yAxisVars }
    } = this.state

    if (identified.includes(id)) {
      this.setState(prevState => ({
        [panelToOpts[panel]]: {
          ...prevState[panelToOpts[panel]],
          identified: arrayRemove(identified, id),
          target: 'identified'
        }
      }))
    } else {
      this.setState(prevState => ({
        [panelToOpts[panel]]: {
          ...prevState[panelToOpts[panel]],
          identified: identified.concat([id]),
          target: 'identified'
        }
      }))
    }
  }

  onSidebarVarChange = (id, key, panel) => {
    const panelToOpts = {
      transactions: 'transactionOptions',
      newCustomers: 'newCustomerOptions',
      sportMap: 'sportMapOptions',
      customerStat: 'customerStatOptions'
    }
    id = parseInt(id)

    const {
      [panelToOpts[panel]]: { yAxisVars, yMap }
    } = this.state

    // fix this awful code please
    var extraTransactionState = {}
    if (panelToOpts[panel] === 'transactionOptions') {
      extraTransactionState['yAxisVar'] = yMap[yAxisVars[id]]
      extraTransactionState['target'] = 'yAxisVar'
    }

    var extraNewCustomerState = {}
    if (panelToOpts[panel] === 'newCustomerOptions') {
      extraNewCustomerState['yAxisVar'] = yMap[yAxisVars[id]]
      extraNewCustomerState['target'] = 'yAxisVar'
    }

    var extraSportMapState = {}
    if (panelToOpts[panel] === 'sportMapOptions') {
      extraSportMapState['currentSport'] = id
    }

    var extraCustomerStatState = {}
    if (panelToOpts[panel] === 'customerStatOptions') {
      extraCustomerStatState['currentStore'] = id
      extraCustomerStatState['target'] = 'currentStore'
    }

    this.setState(prevState => ({
      [panelToOpts[panel]]: {
        ...prevState[panelToOpts[panel]],
        ...extraTransactionState,
        ...extraNewCustomerState,
        ...extraSportMapState,
        ...extraCustomerStatState
      }
    }))
  }

  // when the Store is changed  via the sidebar
  onSidebarStoreChange = (id, key, panel) => {
    // [panelToOpts[panel]] is e.g. transactionOptions / newCustomerOptions
    const panelToOpts = {
      transactions: 'transactionOptions',
      newCustomers: 'newCustomerOptions'
    }

    id = parseInt(id)
    const {
      allColours,
      [panelToOpts[panel]]: { currentStores, colourMap }
    } = this.state

    const currentColours = Object.values(colourMap)

    const nextColour = allColours.find(ele => {
      return (
        currentColours
          .slice(Math.max(currentColours.length - 9, 0))
          .indexOf(ele) < 0
      )
    })

    const position = currentStores.indexOf(id)
    if (position === -1) {
      colourMap[id] = nextColour // need to know what next colour is
    } else {
      delete colourMap[id]
    }

    if (currentStores.includes(id)) {
      this.setState(prevState => ({
        [panelToOpts[panel]]: {
          ...prevState[panelToOpts[panel]],
          currentStores: arrayRemove(currentStores, id),
          storeTarget: id,
          sportTarget: undefined,
          colourMap: colourMap,
          nextColour: nextColour,
          target: 'stores'
        }
      }))
    } else {
      this.setState(prevState => ({
        [panelToOpts[panel]]: {
          ...prevState[panelToOpts[panel]],
          currentStores: currentStores.concat([id]),
          storeTarget: id,
          sportTarget: undefined,
          colourMap: colourMap,
          nextColour: nextColour,
          target: 'stores'
        }
      }))
    }
  }

  /* If the Control Panel is closed because the user
     closes the sidebar using the X, the control panel 
     is switched off */
  onSidebarStateChange = state => {
    console.log('onSideBarStateChange')

    if (!state.isOpen && this.state.controls.panel.on) {
      this.setState(({ controls }) => ({
        controls: {
          ...controls,
          on: !controls.on,
          panel: {
            on: !controls.panel.on,
            target: null
          },
          prev: omit(controls, ['prev'])
        },
        layouts: allLayouts[this.props.match.path.substr(1)]
      }))
    }
  }

  onSidebarSliderChange = dateRange => {
    this.setState(({ sportMapOptions }) => ({
      sportMapOptions: {
        ...sportMapOptions,
        dateRange: dateRange
      }
    }))
  }

  onSportMapZoom = (projection, transform) => {
    this.setState(({ sportMapOptions }) => ({
      sportMapOptions: {
        ...sportMapOptions,
        projection: projection,
        transform: transform
      }
    }))
  }

  onCrossSellingFetchData = (state, instance) => {
    this.setState(({ crossSellingOptions }) => ({
      crossSellingOptions: {
        ...crossSellingOptions,
        limit: state.pageSize,
        skip: state.page * state.pageSize,
        sorted: state.sorted,
        filtered: state.filtered
      }
    }))
  }

  handleKeyDown(event) {
    // Key Bindings for App.

    // To open Controls - Ctrl + ↑
    // Once controls are open:
    // q -> Opens/closes top left panel
    // p -> Opens/closes top right panel
    // z --> Opens/closes bottom left panel
    // m --> Opens/closes bottom right panel

    // for Ctrl + ↑
    if (event.keyCode === 38 && event.ctrlKey) {
      this.setState(({ previousLayouts, controls }) => ({
        controls: {
          ...controls,
          on: !controls.on,
          panel: {
            on: controls.panel.on ? !controls.panel.on : false,
            target: null
          },
          prev: omit(controls, ['prev'])
        },
        layouts: controls.panel.on ? previousLayouts[0] : previousLayouts[1]
      }))
    }
    // for opening the control panel ["q", "p", "z", "m"]
    if (this.state.hotkeys.includes(event.key) && this.state.controls.on) {
      this.setState(({ previousLayouts, controls }) => ({
        controls: {
          ...controls,
          panel: {
            on: !controls.panel.on,
            target: this.state.hotkeyMap[event.key]
          },
          prev: omit(controls, ['prev'])
        },
        layouts: controls.panel.on
          ? previousLayouts[0]
          : this.getControlPanelLayouts(this.state.hotkeyMap[event.key])
      }))
    }

    if (event.shiftKey && this.props.match.path.substr(1) === 'sport') {
      this.setState(({ sportMapOptions }) => ({
        sportMapOptions: {
          ...sportMapOptions,
          draggable: true
        }
      }))
    }
  }

  handleKeyUp() {
    if (this.props.match.path.substr(1) === 'sport') {
      this.setState(({ sportMapOptions }) => ({
        sportMapOptions: {
          ...sportMapOptions,
          draggable: false
        }
      }))
    }
  }

  componentDidMount() {
    const server =
      process.env.NODE_ENV === 'production'
        ? 'http://108.128.166.141/graphql'
        : process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001/graphql'
        : null
    const cache = new InMemoryCache()
    const link = new HttpLink({
      uri: server // remember to change to https for prod
    })
    const client = new ApolloClient({
      cache,
      link
    })

    this.setState({
      colWidth: (
        window.innerWidth / this.state.cols[this.state.currentBreakpoint]
      ).toFixed(2),
      client: client
    })

    // to account for onLayoutChange not firing on initial render if only 1 grid item is called
    // if (this.state.currentLayout.length === 1) {
    const layout = this.state.layouts[this.state.currentBreakpoint]
    this.setState(prevState => ({
      currentLayout: layout,
      horizontalGridItems: layout.filter(el => {
        return el.y == 0
      }).length,
      previousLayouts: prevState.controls.panel.on
        ? prevState.previousLayouts
        : deque(prevState.previousLayouts, this.state.layouts)
    }))
    // }

    // window.addEventListener('click', this.handler)
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('keydown', this.handleKeyDown, false)
    window.addEventListener('keyup', this.handleKeyUp, false)
  }

  componentWillUnmount() {
    // window.removeEventListener('click', this.handler)
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('keydown', this.handleKeyDown, false)
    window.removeEventListener('keyup', this.handleKeyUp, false)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      const defaultLayouts = allLayouts[nextProps.match.path.substr(1)]
      const layouts = defaultLayouts
      const keys = defaultLayouts['lg'].map(e => e['i'])
      const hotkeys = defaultLayouts['lg'].map(e => e['hotkey'])
      const hotkeyMap = hotkeys.reduce(
        (o, k, i) => ({ ...o, [k]: keys[i] }),
        {}
      )
      this.setState(prevState => ({
        layouts: layouts,
        previousLayouts: [defaultLayouts],
        currentLayout: defaultLayouts['lg'],
        keys: keys,
        hotkeys: hotkeys,
        hotkeyMap: hotkeyMap,
        controls: {
          ...prevState.controls,
          on: prevState.controls.on,
          panel: {
            on: false,
            target: null
          }
        }
      }))
      return false
    }
    return true
  }

  sideBarWidth = () => {
    if (!this.state.controls.panel.on) {
      return -100
    } else {
      if (
        this.state.currentBreakpoint === 'xs' ||
        this.state.currentBreakpoint === 'xxs'
      ) {
        return (
          this.state.colWidth * this.state.cols[this.state.currentBreakpoint]
        )
      } else {
        return (
          this.state.colWidth *
          (this.state.cols[this.state.currentBreakpoint] / 2)
        )
      }
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   console.log(prevState.crossSellingOptions, this.state.crossSellingOptions)
  // }

  render() {
    return (
      <PlaybookContext.Provider value={this.state.transactionOptions}>
        <div className="Master">
          <NavBar
            onControlClick={this.onControlClick}
            onLogoClick={this.onLogoClick}
            controls={this.state.controls}
          />
          <SideBar
            width={this.sideBarWidth()}
            customBurgerIcon={false}
            noOverlay
            keys={this.state.keys}
            controls={this.state.controls}
            isOpen={this.state.controls.panel.on}
            toggles={this.state.toggles}
            onSidebarStateChange={this.onSidebarStateChange}
            colWidth={this.state.colWidth}
            transactionOptions={this.state.transactionOptions}
            newCustomerOptions={this.state.newCustomerOptions}
            sportMapOptions={this.state.sportMapOptions}
            crossSellingOptions={this.state.crossSellingOptions}
            customerStatOptions={this.state.customerStatOptions}
            productSunburstOptions={this.state.productSunburstOptions}
            ref={this.sidebar}
            url={this.props.match.path.substr(1)}
          />

          {this.state.client && (
            <Query
              client={this.state.client}
              controls={this.state.controls}
              url={this.props.match.path.substr(1)}
              onControlItemClick={this.onControlItemClick}
              layouts={this.state.layouts}
              cols={this.state.cols}
              breakpoints={this.state.breakpoints}
              onBreakpointChange={this.onBreakpointChange}
              onLayoutChange={this.onLayoutChange}
              colWidth={this.state.colWidth}
              currentBreakpoint={this.state.currentBreakpoint}
              currentLayout={this.state.currentLayout}
              keys={this.state.keys}
              hotkeyMap={this.state.hotkeyMap}
              rowHeight={this.state.rowHeight}
              transactionOptions={this.state.transactionOptions}
              newCustomerOptions={this.state.newCustomerOptions}
              sportMapOptions={this.state.sportMapOptions}
              crossSellingOptions={this.state.crossSellingOptions}
              customerStatOptions={this.state.customerStatOptions}
              productSunburstOptions={this.state.productSunburstOptions}
            />
          )}
        </div>
      </PlaybookContext.Provider>
    )
  }
}

export default Master
