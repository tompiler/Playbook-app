import React from 'react'
import LineChart from './LineChart'

import GridItemFramer from '../HOCs/GridItemFramer'
import DimensionDefaultPanel from '../DimensionDefaultPanel'
import ControlChoicePanel from '../ControlChoicePanel'
import Legend from './Legend'
import ChartTitle from '../ChartTitle'

import { findWithAttr } from '../Utils/utils'
import omit from 'lodash.omit'
import isEqual from 'lodash.isequal'

import { format } from 'd3-format'
import { scaleTime } from 'd3-scale'
import { timeMonth, timeDay, timeWeek } from 'd3-time'
import { timeFormat } from 'd3-time-format'

import newCustomers_map from '/newCustomers_map.json'

const line = props => <LineChart {...props} />
const properties = {
  top: 0,
  right: 20,
  bottom: 50,
  left: 45
}
const FramedChart = GridItemFramer(properties)(line)

class Container extends React.Component {
  constructor(props) {
    super(props)

    this.updateData = this.updateData.bind(this)
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
      // console.log('T CHART CLICK KEY:', key, this.props)
    }
  }

  onLegendClick = e => {
    // console.log('T LEGEND CLICK KEY:', e, this.props)
  }

  updateData() {
    this.props.newCustomers.query()
  }

  shouldComponentUpdate(nextProps, nextState) {
    const controlChange = !isEqual(this.props.controls, nextProps.controls)
    const dimensionChange =
      !isEqual(nextProps.dimensions, this.props.dimensions) &&
      this.props.newCustomers.loaded // if the dimensions of the container change and the container has loaded
    const optsChange = !isEqual(this.props.newCustomers, nextProps.newCustomers)
    // nextProps.newCustomers.opts.target !== null // don't update linechart just because controlPanel is exited
    const legendChange =
      this.props.newCustomers.legend !== nextProps.newCustomers.legend
    const noDataChange =
      this.props.newCustomers.nodata !== nextProps.newCustomers.nodata
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

  componentDidMount() {
    // console.log('Container Mounted')
    this.updateData()
  }

  render() {
    const { client } = this.props

    const other = omit(this.props, [
      'onControlItemClick',
      'hotkeyMap',
      'currentBreakpoint',
      'newCustomers'
    ])

    const {
      opts: { currentStores, dateRange, dateRangeAggLevel },
      legend
    } = this.props.newCustomers

    const legendSelectHeight = Math.min(
      35,
      Math.max(28, parseInt(this.props.width) / 22)
    )
    const legendItemHeight = 10
    const legendBodyPadding = 10

    const legendHeightFunc = () => {
      if (currentStores.length <= 10) {
        if (legend === 'open') {
          if (currentStores.length % 2 !== 0) {
            // if legend is not divisible by 2
            return (
              legendSelectHeight +
              (currentStores.length + 1) * legendItemHeight +
              legendBodyPadding
            )
          } else {
            return (
              legendSelectHeight +
              currentStores.length * legendItemHeight +
              legendBodyPadding
            )
          }
        } else {
          // if legend is closed
          return legendSelectHeight
        }
      } else {
        // if more than 10 stores are selected
        return legendSelectHeight
      }
    }

    const title = 'New Customers'
    const titleHeight = Math.min(
      40,
      Math.max(25, parseInt(this.props.width) / 25)
    )
    const titleFontSize = Math.min(
      22,
      Math.max(16, parseInt(this.props.width) / 40)
    )

    const legendHeight = legendHeightFunc()

    const chartHeight = parseInt(this.props.height) - legendHeight - titleHeight

    const dataPositions = this.props.newCustomers.data
      ? currentStores.reduce(
          (o, k, i) => ({
            ...o,
            [k]: findWithAttr(
              this.props.newCustomers.data,
              newCustomers_map['primary_key'],
              currentStores[i]
            )
          }),
          {}
        )
      : {}

    var bandDomain

    this.xScaleTimeDate = scaleTime().domain(dateRange)
    const formatTimeDate = timeFormat('%d-%b-%y')
    const formatTimeWeek = timeFormat('Week %V-%Y')
    const formatTimeMonth = timeFormat('%b-%Y')

    if (dateRangeAggLevel === 'Month') {
      bandDomain = this.xScaleTimeDate
        .ticks(timeMonth.every(1))
        .map(formatTimeMonth)
        .map(d => d.replace('-', ' '))
    } else if (dateRangeAggLevel === 'Week') {
      bandDomain = this.xScaleTimeDate
        .ticks(timeWeek.every(1))
        .map(formatTimeWeek)
        .map(d => d.replace(/-/g, ' '))
        .map(d => d.replace(/ 0/g, ' '))
    } else if (dateRangeAggLevel === 'Day') {
      bandDomain = this.xScaleTimeDate
        .ticks(timeDay.every(1))
        .map(formatTimeDate)
        .map(d => d.replace(/-/g, ' '))
    }

    const dataFormat = d => format(',')(d)

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
    } else if (this.props.item === 'New Customers') {
      return (
        <div {...other}>
          {client && (
            <React.Fragment>
              <div onClick={this.onChartClick.bind(this)}>
                <ChartTitle
                  title={title}
                  titleHeight={titleHeight}
                  fontSize={titleFontSize}
                />
                <FramedChart
                  {...other}
                  loaded={this.props.newCustomers.loaded}
                  data={this.props.newCustomers.data}
                  dataPositions={dataPositions}
                  dataFormat={dataFormat}
                  bandDomain={bandDomain}
                  nodata={this.props.newCustomers.nodata}
                  width={parseInt(this.props.width, 10)}
                  height={chartHeight}
                  newCustomers={this.props.newCustomers}
                  legendStatus={this.props.newCustomers.legend}
                />
              </div>
              <div onClick={this.onLegendClick.bind(this)}>
                <Legend
                  {...other}
                  loaded={this.props.newCustomers.loaded}
                  data={this.props.newCustomers.data}
                  dataPositions={dataPositions}
                  dataFormat={dataFormat}
                  bandDomain={bandDomain}
                  width={parseInt(this.props.width, 10)}
                  height={legendHeight}
                  left={properties.left}
                  right={properties.right}
                  newCustomers={this.props.newCustomers}
                  toggle={this.props.newCustomers.toggleLegend}
                  status={this.props.newCustomers.legend}
                  buttonHeight={legendSelectHeight}
                  itemHeight={legendItemHeight}
                  bodyPadding={legendBodyPadding}
                />
              </div>
            </React.Fragment>
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
