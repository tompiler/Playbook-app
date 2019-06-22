import React from 'react'
import { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import sportMap_map from '/sportMap_map.json'

import { select } from 'd3-selection'
import { scaleTime } from 'd3-scale'
import { timeMonth } from 'd3-time'
import { timeFormat } from 'd3-time-format'
import { axisBottom } from 'd3-axis'

import { wrap } from '../Utils/utils'

class RangeSlider extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const lastUpdated = new Date(sportMap_map['last_updated'])
    const dateStart = new Date(
      lastUpdated.getFullYear() - 2,
      lastUpdated.getMonth() + 1,
      1
    )

    const dateEnd = new Date(
      lastUpdated.getFullYear(),
      lastUpdated.getMonth() - 1,
      1
    )

    this.formatTimeMonth = timeFormat('%b %y')
    this.scaleTimeMonth = scaleTime().domain([dateStart, dateEnd])
    this.xTicks = this.scaleTimeMonth.ticks(timeMonth.every(1))

    this.xScale = scaleTime()
      .domain([dateStart, dateEnd])
      .range([0, this.props.width])

    this.xAxis = axisBottom()
      .scale(this.xScale)
      .ticks(timeMonth.every(2))
      .tickFormat(this.formatTimeMonth)

    // const g = select('.sportMap-menu-svg-container')
    //   .append('g')
    //   .attr('class', '.sportMap-menu-g')
    //   .attr('width', this.props.width - 50)

    this.gX = select('.sportMap-menu-svg-container')
      .append('g')
      .attr('class', `sportMap-menu-x-axis`)
      .attr('transform', `translate(${this.props.margin.left},0)`)
      .call(this.xAxis)

    wrap(this.gX.selectAll(`.tick text`), this.props.width / 24)
  }

  componentDidUpdate() {
    this.xScale.range([0, this.props.width])
    select('.sportMap-menu-x-axis').call(this.xAxis)
    wrap(this.gX.selectAll(`.tick text`), this.props.width / 24)
  }

  onSliderChange = value => {
    const dateRange = [this.xTicks[value[0]], this.xTicks[value[1]]]
    this.props.onSidebarSliderChange(dateRange)
  }

  render() {
    const { dateRange } = this.props

    const lastUpdated = new Date(sportMap_map['last_updated'])
    const dateStart = new Date(
      lastUpdated.getFullYear() - 2,
      lastUpdated.getMonth() + 1,
      1
    )

    const dateEnd = new Date(
      lastUpdated.getFullYear(),
      lastUpdated.getMonth(),
      1
    )

    var dates
    if (!this.xTicks) {
      this.formatTimeMonth = timeFormat('%b %y')
      this.scaleTimeMonth = scaleTime().domain([dateStart, dateEnd])
      this.xTicks = this.scaleTimeMonth.ticks(timeMonth.every(1))
    }

    const xTicks = this.xTicks.map(this.formatTimeMonth)
    const defaultValue = this.xTicks
      ? [
          xTicks.indexOf(this.formatTimeMonth(dateRange[0])),
          xTicks.indexOf(this.formatTimeMonth(dateRange[1])) + 1
        ]
      : [13, 23]

    return (
      <React.Fragment>
        <div
          style={{
            width: this.props.width,
            marginLeft: this.props.margin.left
          }}
        >
          <Range
            min={this.props.min}
            max={this.props.max}
            defaultValue={defaultValue}
            onChange={this.onSliderChange}
            included={true}
          />
        </div>
        <div
          style={{
            marginTop: 10,
            marginLeft: 0
          }}
        >
          <svg
            className={'sportMap-menu-svg-container'}
            width={
              this.props.width +
              this.props.margin.left +
              this.props.margin.right
            }
            height={this.props.height}
          />
        </div>
      </React.Fragment>
    )
  }
}

export default RangeSlider
