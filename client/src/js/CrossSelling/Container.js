import React from 'react'

import Table from './Table'
import ChartTitle from '../ChartTitle'

import GridItemFramer from '../HOCs/GridItemFramer'
import DimensionDefaultPanel from '../DimensionDefaultPanel'
import ControlChoicePanel from '../ControlChoicePanel'

import { findWithAttr } from '../Utils/utils'
import omit from 'lodash.omit'
import isEqual from 'lodash.isequal'

import { format } from 'd3-format'
import { scaleTime } from 'd3-scale'
import { timeMonth, timeDay } from 'd3-time'
import { timeFormat } from 'd3-time-format'

import transactions_map from '/transactions_map.json'

class Container extends React.Component {
  constructor(props) {
    super(props)

    this.onTableClick = this.onTableClick.bind(this)
  }

  onTableClick = key => {
    if (
      this.props.controls.on &&
      this.props.controls.panel.on &&
      !this.props.isDragging &&
      !this.props.isResizing
    ) {
      this.props.onControlItemClick(this.props.item)
    } else if (
      !this.props.controls.on &&
      !this.props.controls.panel.on &&
      !this.props.isDragging &&
      !this.props.isResizing
    ) {
      console.log('T CHART CLICK KEY:', key, this.props)
    }
  }

  onLegendClick = e => {
    // console.log('T LEGEND CLICK KEY:', e, this.props)
  }

  // updateData() {
  //   this.props.crossSelling.query()
  // }

  shouldComponentUpdate(nextProps, nextState) {
    // Object.keys(this.props.transactions).forEach(key => {
    //   if (
    //     !isEqual(this.props.transactions[key], nextProps.transactions[key]) &&
    //     key !== 'children'
    //   ) {
    //     console.log(key)
    //   }
    // })
    // const controlChange = !isEqual(this.props.controls, nextProps.controls)
    // const dimensionChange =
    //   !isEqual(nextProps.dimensions, this.props.dimensions) &&
    //   this.props.crossSelling.loaded // if the dimensions of the container change and the container has loaded
    // const optsChange = !isEqual(this.props.crossSelling, nextProps.crossSelling)
    // // nextProps.transactions.opts.target !== null // don't update linechart just because controlPanel is exited
    // const legendChange =
    //   this.props.crossSelling.legend !== nextProps.crossSelling.legend
    // const noDataChange =
    //   this.props.crossSelling.nodata !== nextProps.crossSelling.nodata
    // if (
    //   controlChange ||
    //   dimensionChange ||
    //   optsChange ||
    //   legendChange || // if the legend is toggled
    //   noDataChange
    // ) {
    //   console.log('            Container ComponentShouldUpdate')
    //   return true
    // } else {
    //   console.log('            Container NOT ComponentShouldUpdate')
    //   return false
    // }
    return true
  }

  // componentDidMount() {
  //   // console.log('Container Mounted')
  //   this.updateData()
  // }

  stopPropagation = event => {
    if (!this.props.controls.panel.on) {
      event.stopPropagation()
    }
  }

  render() {
    const { client } = this.props
    const other = omit(this.props, [
      'onControlItemClick',
      'hotkeyMap',
      'currentBreakpoint',
      'crossSelling'
    ])

    // const {
    //   opts: { currentStores, yAxisVar, dateRange, dateRangeAggLevel },
    //   legend
    // } = this.props.transactions
    // console.log(this.props)

    const title = 'Cross Selling'
    const titleHeight = Math.min(
      40,
      Math.max(25, parseInt(this.props.width) / 25)
    )
    const titleFontSize = Math.min(
      22,
      Math.max(16, parseInt(this.props.width) / 40)
    )
    if (this.props.controls.on && !this.props.controls.panel.on) {
      return (
        <ControlChoicePanel
          height={parseInt(this.props.height)}
          width={parseInt(this.props.width)}
          item={this.props.item}
          hotkeyMap={this.props.hotkeyMap}
          controls={this.props.controls}
        />
      )
    } else if (this.props.item === 'Cross Selling') {
      return (
        <div
          {...other}
          onMouseDown={this.stopPropagation}
          onTouchStart={this.stopPropagation}
        >
          {client && (
            <div
              // onClick={this.onChartClick.bind(this)}
              style={{ display: 'inline-block' }}
              onMouseDown={this.stopPropagation}
              onTouchStart={this.stopPropagation}
            >
              <ChartTitle
                title={title}
                titleHeight={titleHeight}
                fontSize={titleFontSize}
              />
              <Table
                loaded={this.props.crossSelling.loaded}
                data={this.props.crossSelling.data}
                width={parseInt(this.props.width, 10)}
                height={parseInt(this.props.height, 10) - titleHeight}
                crossSelling={this.props.crossSelling}
                item={this.props.item}
                onTableClick={this.onTableClick}
              />
            </div>
          )}
        </div>
      )
    } else {
      return (
        <div {...other}>
          <div onClick={this.onChartClick.bind(this)}>
            <DimensionDefaultPanel {...other} panel={this.props.item} />
          </div>
        </div>
      )
    }
  }
}

export default Container
