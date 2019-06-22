import React from 'react'
import TransactionsContainer from './Transactions/Container'
import NewCustomersContainer from './NewCustomers/Container'
import SportMapContainer from './SportMap/Container'
import CrossSellingContainer from './CrossSelling/Container'
import ProductSunburstContainer from './ProductSunburst/Container'
import CustomerStatsContainer from './CustomerStats/Container'

import { Responsive, WidthProvider } from 'react-grid-layout'

const ResponsiveGridLayout = WidthProvider(Responsive)
import AddDimensionWrapper from './HOCs/AddDimensionWrapper'

import DimensionDefaultPanel from './DimensionDefaultPanel'

class Main extends React.Component {
  constructor(props) {
    super(props)
    this.onControlItemClick = this.onControlItemClick.bind(this)
  }

  stopPropagation = event => {
    if (!this.props.controls.panel.on) {
      event.stopPropagation()
    }
  }

  onControlItemClick = (event, key) => {
    if (
      this.props.controls.on &&
      !this.props.controls.panel.on &&
      !this.isDragging &&
      !this.isResizing
    ) {
      // console.log('ITEMCLICK KEY:', key, this.props)
      this.stopPropagation(event)
      this.props.onControlItemClick(key)
    }
  }

  // Next 4 functions are essential to record
  // click events on grid items
  onDrag = e => {
    // console.log('onDrag', e.MouseEvent)
    this.isDragging = true
  }

  onDragStop = e => {
    // console.log(this.isDragging)
    this.isDragging = false
    // HACK: add some delay otherwise a click event is sent
    // setTimeout(
    //   obj => {
    //     obj.isDragging = false
    //     console.log(this.isDragging)
    //   },
    //   200,
    //   this
    // )
  }

  onResizeStart = e => {
    this.isResizing = true
  }

  onResizeStop = e => {
    // HACK: add some delay otherwise a click event is sent
    setTimeout(
      obj => {
        obj.isResizing = false
      },
      200,
      this
    )
  }

  shouldComponentUpdate(nextProps) {
    // console.log(
    //   '                 Main:',
    //   this.props.controls,
    //   nextProps.controls
    // )
    return true
  }
  render() {
    const { controls } = this.props
    const containers = {
      Transactions: (
        <TransactionsContainer
          client={this.props.client}
          onControlItemClick={this.props.onControlItemClick}
          controls={this.props.controls}
          transactions={this.props.transactions}
          item={'Transactions'}
          panel={'transactions'}
          key={0}
          hotkeyMap={this.props.hotkeyMap}
          currentBreakpoint={this.props.currentBreakpoint}
        />
      ),
      NewCustomers: (
        <NewCustomersContainer
          client={this.props.client}
          onControlItemClick={this.props.onControlItemClick}
          controls={this.props.controls}
          newCustomers={this.props.newCustomers}
          item={'New Customers'}
          panel={'newCustomers'}
          key={1}
          hotkeyMap={this.props.hotkeyMap}
          currentBreakpoint={this.props.currentBreakpoint}
        />
      ),
      SportMap: (
        <SportMapContainer
          client={this.props.client}
          onControlItemClick={this.props.onControlItemClick}
          controls={this.props.controls}
          sportMap={this.props.sportMap}
          item={'Sport Map'}
          panel={'sportMap'}
          key={0}
          hotkeyMap={this.props.hotkeyMap}
          currentBreakpoint={this.props.currentBreakpoint}
        />
      ),
      CrossSelling: (
        <CrossSellingContainer
          client={this.props.client}
          onControlItemClick={this.props.onControlItemClick}
          controls={this.props.controls}
          crossSelling={this.props.crossSelling}
          item={'Cross Selling'}
          panel={'crossSelling'}
          key={2}
          hotkeyMap={this.props.hotkeyMap}
          currentBreakpoint={this.props.currentBreakpoint}
        />
      ),
      ProductSunburst: (
        <ProductSunburstContainer
          client={this.props.client}
          onControlItemClick={this.props.onControlItemClick}
          controls={this.props.controls}
          productSunburst={this.props.productSunburst}
          item={'Product Sunburst'}
          panel={'productSunburst'}
          key={3}
          hotkeyMap={this.props.hotkeyMap}
          currentBreakpoint={this.props.currentBreakpoint}
        />
      ),
      CustomerStats: (
        <CustomerStatsContainer
          client={this.props.client}
          onControlItemClick={this.props.onControlItemClick}
          controls={this.props.controls}
          customerStats={this.props.customerStats}
          item={'Customer Stats'}
          panel={'customerStats'}
          key={4}
          hotkeyMap={this.props.hotkeyMap}
          currentBreakpoint={this.props.currentBreakpoint}
        />
      )
    }

    const items = this.props.keys.map((item, i) => {
      // const items = Object.keys(containers).map((item, i) => {
      // if (this.props.keys.includes(item)) {

      const isSelected = controls.panel.target === item
      const className =
        !isSelected && controls.panel.on ? 'control-hidden' : null

      return (
        <AddDimensionWrapper
          className="dimensionWrapper"
          key={item}
          controls={controls}
          onClick={event => {
            this.onControlItemClick(event, item)
          }}
          show={className}
          transactions={this.props.transactions}
          newCustomers={this.props.newCustomers}
          sportMap={this.props.sportMap}
          crossSelling={this.props.crossSelling}
          customerStats={this.props.customerStats}
          productSunburst={this.props.productSunburst}
          url={this.props.url}
        >
          {containers[item]}
        </AddDimensionWrapper>
      )
    })

    // console.log('Main rerender:', this.props.sportMap)
    return (
      <ResponsiveGridLayout
        {...this.props}
        className="layout"
        rowHeight={this.props.rowHeight}
        layouts={this.props.layouts}
        onBreakpointChange={this.props.onBreakpointChange}
        onLayoutChange={this.props.onLayoutChange}
        onDrag={this.onDrag}
        onDragStop={this.onDragStop}
        onResizeStart={this.onResizeStart}
        onResizeStop={this.onResizeStop}
      >
        {items}
      </ResponsiveGridLayout>
    )
  }
}

export default Main
