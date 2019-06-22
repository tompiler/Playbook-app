import React from 'react'

import AgeDonut from './AgeDonut'
import GenderDonut from './GenderDonut'
import Totals from './Totals'
import ChartTitle from '../ChartTitle'

import DimensionDefaultPanel from '../DimensionDefaultPanel'
import ControlChoicePanel from '../ControlChoicePanel'

import { swap } from '../Utils/utils'
import omit from 'lodash.omit'
import isEqual from 'lodash.isequal'

import customerStats_map from '/customerStats_map.json'

class Container extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      storeMap: swap(customerStats_map[customerStats_map['primary_key_label']])
    }
  }

  onChartClick = key => {
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

  updateData() {
    this.props.customerStats.query()
  }

  componentDidMount() {
    // console.log('Container Mounted')
    this.updateData()
  }

  stopPropagation = event => {
    if (!this.props.controls.panel.on) {
      event.stopPropagation()
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const controlChange = !isEqual(this.props.controls, nextProps.controls)
    const dimensionChange =
      !isEqual(nextProps.dimensions, this.props.dimensions) &&
      this.props.customerStats.loaded // if the dimensions of the container change and the container has loaded
    const optsChange = !isEqual(
      this.props.customerStats,
      nextProps.customerStats
    )
    // nextProps.newCustomers.opts.target !== null // don't update linechart just because controlPanel is exited
    const legendChange =
      this.props.customerStats.legend !== nextProps.customerStats.legend
    const noDataChange =
      this.props.customerStats.nodata !== nextProps.customerStats.nodata
    if (
      controlChange ||
      dimensionChange ||
      optsChange ||
      legendChange || // if the legend is toggled
      noDataChange
    ) {
      // console.log('            Container ComponentShouldUpdate')
      return true
    } else {
      // console.log('            Container NOT ComponentShouldUpdate')
      return false
    }
  }

  render() {
    const { client } = this.props
    const other = omit(this.props, ['onControlItemClick', 'hotkeyMap'])

    const height = parseInt(this.props.height)
    const width = parseInt(this.props.width)

    const totalsHeight = height * 0.3 > 150 ? 150 : height * 0.3
    // const titleHeight = 40
    const title = this.props.customerStats.data
      ? 'Customers - ' +
        this.state.storeMap[
          this.props.customerStats.data[0][customerStats_map['primary_key']]
        ]
      : ' '

    const titleHeight = Math.min(
      40,
      Math.max(25, parseInt(this.props.width) / 17)
    )
    const titleFontSize = Math.min(
      22,
      Math.max(16, parseInt(this.props.width) / 40)
    )

    const donutHeight =
      height > 700 || width < height
        ? (height - totalsHeight - titleHeight) / 2
        : height - totalsHeight - titleHeight

    // console.log(height, totalsHeight, donutHeight)

    // console.log('Width:', width)

    const toBlock = height > 700 || width < height ? true : false

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
    } else if (
      this.props.item === 'Customer Stats' &&
      this.props.customerStats.data
    ) {
      return (
        <div onClick={this.onChartClick.bind(this)}>
          <ChartTitle
            title={title}
            titleHeight={titleHeight}
            fontSize={titleFontSize}
          />
          <AgeDonut
            {...other}
            containerHeight={height}
            containerWidth={width}
            height={donutHeight}
            width={width * 0.5}
            data={this.props.customerStats.data}
            loaded={this.props.customerStats.loaded}
            toBlock={toBlock}
          />
          <GenderDonut
            {...other}
            containerHeight={height}
            containerWidth={width}
            height={donutHeight}
            width={width * 0.5}
            data={this.props.customerStats.data}
            loaded={this.props.customerStats.loaded}
            toBlock={toBlock}
          />

          <Totals
            {...other}
            height={totalsHeight}
            width={width}
            margin={{ top: 25 }}
            data={this.props.customerStats.data}
            loaded={this.props.customerStats.loaded}
          />
        </div>
      )
    } else {
      return (
        <div>
          <div onClick={this.onChartClick.bind(this)}>
            <DimensionDefaultPanel {...other} panel={this.props.item} />
          </div>
        </div>
      )
    }
  }
}

export default Container
