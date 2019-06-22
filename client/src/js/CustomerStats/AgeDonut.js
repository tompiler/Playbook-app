import React from 'react'
import { withFauxDOM } from 'react-faux-dom'

import { select, selectAll, event } from 'd3-selection'

import { flatten } from '../Utils/utils'

import isEqual from 'lodash.isequal'

import { arc, pie } from 'd3-shape'
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { interpolate } from 'd3-interpolate'

import customerStats_map from '/customerStats_map.json'

class AgeDonut extends React.Component {
  constructor(props) {
    super(props)
    const fields = [
      'under_25',
      'btw_25_35',
      'btw_35_45',
      'btw_45_55',
      'over_55'
    ]
    this.state = {
      fields: fields,
      colours: scaleOrdinal(schemeCategory10)
    }
  }

  drawChart() {
    // connect to Faux Dom element
    // all D3 elements will be drawn as children of this node
    const faux = this.props.connectFauxDOM('div', 'chart')
    const svg = select(faux)
      .append('svg')
      .attr('class', `${this.props.panel}-age-donut-container`)
      .attr('width', '100%')
      .attr('height', this.props.height)

    const donut = svg
      .append('g')
      .attr('class', `${this.props.panel}-age-donut-chart-g`)
      .attr(
        'transform',
        `translate(${this.props.width / 2}
          , ${(this.props.height * 4) / 5 -
            (this.props.toBlock ? 3000 : 15000) / this.props.width})`
      )

    const legend = svg
      .append('g')
      .attr('class', `${this.props.panel}-age-donut-legend-g`)
      .attr(
        'transform',
        `translate(${
          this.props.toBlock ? (this.props.width * 3) / 2 : this.props.width / 2
        }, ${
          this.props.toBlock
            ? (this.props.height * 3) / 5 - 5000 / this.props.width
            : (this.props.height * 4) / 5 - 15000 / this.props.width
        })`
      )

    const filtered = Object.keys(this.props.data[0])
      .filter(key => this.state.fields.includes(key))
      .reduce((obj, key) => {
        obj[key] = this.props.data[0][key]
        return obj
      }, {})

    this.values = [
      ...this.state.fields.map(d => ({
        name: d,
        value: this.props.data[0][d]
      }))
    ]

    const allColours = [...Array(this.values.length).keys()].map(d =>
      this.state.colours(d)
    )

    var color = scaleOrdinal()
      .domain(filtered)
      .range(allColours)

    this.pieChart = this.updatePie()
    this.ageArc = this.updateArcs()

    this._current = []

    donut
      .selectAll('.arc')
      .data(this.pieChart)
      .enter()
      .append('path')
      .attr('class', `${this.props.panel}-age-donut-chart`)
      .attr('d', this.ageArc)
      .attr('fill', d => color(d.data.name))
      .style('opacity', 0.7)
      .each(d => this._current.push(d))

    donut
      .append('text')
      .attr('class', `${this.props.panel}-age-donut-legend-title`)
      .attr('width', 10)
      .attr('height', 10)
      .attr('x', 0)
      .attr('y', -65)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .style('font-family', 'Open Sans, sans-serif')
      .text('Age')

    this.LABEL_RECT_X = -48
    this.LABEL_NAME_X = 0
    this.LABEL_NUMBER_X = 40
    this.INIT_WIDTH = this.props.width

    this.state.fields.forEach((field, i) => {
      legend
        .append('rect')
        .attr('class', `${this.props.panel}-age-donut-legend-${field}`)
        .attr('width', 12)
        .attr('height', 12)
        .attr('x', this.LABEL_RECT_X)
        .attr('y', i * 22 - 49)
        .style('fill', color(field))
        .style('opacity', 0.7)
        .style('rx', '3px')

      legend
        .append('text')
        .attr('class', `${this.props.panel}-age-donut-legend-${field}-label`)
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', this.LABEL_NAME_X)
        .attr('y', i * 22 - 39)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .style('font-family', 'Open Sans, sans-serif')
        .text(customerStats_map['age'][field])

      legend
        .append('text')
        .attr('class', `${this.props.panel}-age-donut-legend-${field}-number`)
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', this.LABEL_NUMBER_X)
        .attr('y', i * 22 - 39)
        .attr('text-anchor', 'start')
        .attr('font-size', 12)
        .style('font-family', 'Open Sans, sans-serif')
        .text(this.values[i].value.toFixed(0) + '%')
    })
  }

  updatePie() {
    return pie()
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)
      .sort(null)
      .value(d => d.value)(this.values)
  }

  updateArcs() {
    const radius =
      Math.min(
        (this.props.width * 2 - this.props.width * 0.7) / 2,
        this.props.height
      ) / 1.4

    var ageArc = arc()
      .innerRadius(radius - radius * 0.25)
      .outerRadius(radius - radius * 0.1)
      .padAngle(Math.PI / 360)
      .cornerRadius(3)

    return ageArc
  }

  clampedScale = (start, end, param, constant) => {
    // ugly function but does work.
    // takes a start position, end position,
    // parameter on which changes (e.g. width, height)
    // and an initial constant
    const func1 = start < end ? Math.max : Math.min
    const func2 = start < end ? Math.min : Math.max
    const negate = start < end ? -1 : 1

    return func1(start, func2(end, negate * (param / constant)))
  }

  updateDim() {
    // console.log('Width:', this.props.width)
    // console.log('inside UpdateDim:', this.values)
    select(`.${this.props.panel}-age-donut-container`)
      .attr('width', '100%')
      .attr('height', this.props.height)

    select(`.${this.props.panel}-age-donut-chart-g`).attr(
      'transform',
      `translate(${this.props.width / 2}, ${(this.props.height * 4) / 5 -
        (this.props.toBlock ? 3000 : 15000) / this.props.width})`
    )

    select(`.${this.props.panel}-age-donut-legend-g`).attr(
      'transform',
      `translate(${
        this.props.toBlock ? (this.props.width * 3) / 2 : this.props.width / 2
      }, ${
        this.props.toBlock
          ? (this.props.height * 3) / 5 - 5000 / this.props.width
          : (this.props.height * 4) / 5 - 15000 / this.props.width
      })`
    )

    select(`.${this.props.panel}-age-donut-legend-title`).attr(
      'y',
      this.props.toBlock ? -15 : -65
    )

    this.state.fields.forEach((field, i) => {
      select(`.${this.props.panel}-age-donut-legend-${field}`)
        .attr(
          'x',
          this.clampedScale(
            this.LABEL_RECT_X,
            this.LABEL_RECT_X - 10,
            this.props.width,
            this.INIT_WIDTH / this.LABEL_RECT_X
          )
        )
        .attr('y', this.props.toBlock ? i * 16 - 39 : i * 22 - 49)
        .attr('alignment-baseline', 'top')

      selectAll(`.${this.props.panel}-age-donut-legend-${field}-label`)
        .attr('y', this.props.toBlock ? i * 16 - 29 : i * 22 - 39)
        .attr(
          'font-size',
          Math.min(12, Math.max(10, this.props.width / 30)) + 'px'
        )
        .attr('alignment-baseline', 'top')

      selectAll(`.${this.props.panel}-age-donut-legend-${field}-number`)
        .attr(
          'x',
          this.clampedScale(
            this.LABEL_NUMBER_X,
            this.LABEL_NUMBER_X + 10,
            this.props.width,
            this.INIT_WIDTH / this.LABEL_NUMBER_X
          )
        )
        .attr('y', this.props.toBlock ? i * 16 - 29 : i * 22 - 39)
        .attr(
          'font-size',
          Math.min(12, Math.max(10, this.props.width / 30)) + 'px'
        )
        .attr('alignment-baseline', 'top')
    })

    this.ageArc = this.updateArcs()
    this.pieChart = this.updatePie()

    selectAll(`.${this.props.panel}-age-donut-chart`)
      .data(this.pieChart)
      .attr('d', d => this.ageArc(d))
  }

  updateChart() {
    // WIP

    this.values = [
      ...this.state.fields.map(d => ({
        name: d,
        value: this.props.data[0][d]
      }))
    ]

    selectAll(`.${this.props.panel}-age-donut-chart`).data(this.pieChart)

    this.ageArc = this.updateArcs()
    this.pieChart = this.updatePie()

    selectAll(`.${this.props.panel}-age-donut-chart`)
      .data(this.pieChart)
      .transition()
      .duration(400)
      .attrTween('d', this.arcTween)

    this.state.fields.forEach((field, i) => {
      selectAll(`.${this.props.panel}-age-donut-legend-${field}-number`).text(
        this.values[i].value.toFixed(0) + '%'
      )
    })
  }

  // Returns a tween for a transition’s "d" attribute, transitioning any selected
  // arcs from their current angle to the specified new angle.
  arcTween = a => {
    var i = interpolate(this._current[a.index], a)
    this._current[a.index] = i(0)
    return t => {
      return this.ageArc(i(t))
    }
  }

  componentDidMount() {
    if (!this.props.data) {
      return
    }
    // console.log('Map Mounted')
    this.drawChart()
  }

  componentDidUpdate(prevProps, prevState) {
    // is chart drawn yet - becomes true when this.props.data is not null
    const notDrawn = select(`.${this.props.panel}-age-donut-container`).empty()

    const { nodata } = this.props.customerStats

    const changedData =
      !isEqual(this.props.data, prevProps.data) ||
      nodata !== prevProps.customerStats.nodata

    const changedDim = !isEqual(prevProps.dimensions, this.props.dimensions)

    const secondRender =
      this.props.chart !== undefined && prevProps.chart === undefined

    const controlPanel =
      (this.props.controls.panel.on !== prevProps.controls.prev.panel.on &&
        secondRender) ||
      this.props.controls.on !== prevProps.controls.on

    const shouldDraw = notDrawn && this.props.data

    if (shouldDraw && !this.props.controls.panel.on) {
      // console.log('  drawChart:')
      this.drawChart()
      // } else if (changedOpts) {
      // console.log('changed Opts')
    } else if (changedData) {
      // console.log('Data Change')
      this.updateChart()
    } else if (changedDim) {
      // console.log('updateDim')
      this.updateDim()
    } else if (controlPanel) {
      this.updateDim()
    }
  }

  render() {
    const { loaded } = this.props
    return loaded ? (
      <div
        className={`.${this.props.panel}-age-donut`}
        style={{
          width: this.props.toBlock ? '100%' : '50%',
          height: this.props.height,
          display: this.props.toBlock ? 'block' : 'inline-block'
        }}
      >
        {this.props.chart}
      </div>
    ) : null
  }
}

export default withFauxDOM(AgeDonut)
