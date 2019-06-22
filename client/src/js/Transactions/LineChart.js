import React from 'react'
import { withFauxDOM } from 'react-faux-dom'
import { select, selectAll, mouse } from 'd3-selection'
import 'd3-transition'
import { line, curveMonotoneX } from 'd3-shape'
import {
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  scaleQuantize,
  scaleTime
} from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { extent } from 'd3-array'
import { wrap, extentPad, transactionsQuery, flatten } from '../Utils/utils'
import { easeLinear } from 'd3-ease'
import { schemeCategory10 } from 'd3-scale-chromatic'

import '/css/LineChart.css'

import isEqual from 'lodash.isequal'

import { timeMonth, timeDay } from 'd3-time'
import { timeFormat } from 'd3-time-format'

import { PlaybookContext } from '../Context/Context'

class LineChart extends React.Component {
  static contextType = PlaybookContext

  constructor(props) {
    super(props)
    this.updateLegendMouseMove = this.updateLegendMouseMove.bind(this)
  }

  findOne = storeTarget => {
    const data = this.props.transactions.data[
      this.props.dataPositions[storeTarget]
    ]
    if (data) {
      return this.props.transactions.data[this.props.dataPositions[storeTarget]]
        .data
    } else {
      return data // undefined
    }
  }

  // AUXILLARY FUNCTIONS
  addNoDataText(w, h) {
    const transform =
      'translate(' + (w / 2 - this.props.left - 100) + ',' + h / 2 + ')'
    if (
      !select(`.${this.props.panel}-chart .grp`)
        .select(`.${this.props.panel}-nodata`)
        .node()
    ) {
      // if no data is not already showing, show it
      select(`.${this.props.panel}-chart .grp`)
        .append('text')
        .attr('dy', '0.5em')
        .text('No Data.')
        .attr('class', `${this.props.panel}-nodata`)
        // .attr('transform', transform) // position
        .attr('x', (this.props.width - this.props.left - this.props.right) / 2)
        .attr('y', (this.props.height - this.props.top - this.props.bottom) / 2)
        .style('opacity', 0)
        .attr(
          'font-family',
          '"Helvetica Neue", "HelveticaNeue", Helvetica, Arial, sans-serif'
        )
        .attr('text-anchor', 'middle')
        .attr('font-size', Math.min(78, this.props.width / 10))
        .attr('font-style', 'italic')
        .attr('font-weight', 'bold')
        .attr('fill', '#b4b9c1')
        .transition()
        .duration(200)
        .style('opacity', 1)
    } else {
      select(`.${this.props.panel}-chart .grp`)
        .select(`.${this.props.panel}-nodata`)
        .attr('transform', transform)
    }
  }

  updateNoDataText() {
    select(`.${this.props.panel}-nodata`)
      .attr('x', (this.props.width - this.props.left - this.props.right) / 2)
      .attr('y', (this.props.height - this.props.top - this.props.bottom) / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', Math.min(78, this.props.width / 10))
  }

  removeNoDataText() {
    select(`.${this.props.panel}-chart .grp`)
      .select(`.${this.props.panel}-nodata`)
      .style('opacity', 1)
      .transition()
      .duration(50)
      .style('opacity', 0)
      .remove()
  }

  toNoData(duration) {
    const {
      dataPositions,
      transactions: {
        opts: { currentStores, storeTarget }
      }
    } = this.props

    var withData = Object.keys(dataPositions).filter(function(key) {
      return dataPositions[key] >= 0
    })

    if (withData.length === 0) {
      // if this was the last line to remove
      // (i.e. no data triggered by primary filter)

      this.removeLine(storeTarget)
      this.removeCircles(storeTarget)
    } else {
      for (var i = 0; i < currentStores.length; i++) {
        // if no data returned for some other reason
        // if no data triggered by secondary filter
        const id = currentStores[i]

        select(`.${this.props.panel} .g_${id}`)
          .select(`#${this.props.panel}_line_${id}`)
          .transition()
          .duration(duration)
          .style('stroke', '#b8b9ba')

        selectAll(`.${this.props.panel} .dot_${id}`)
          .transition()
          .duration(duration)
          .attr('r', 4.5)
          .style('fill', '#b8b9ba')
      }
    }
  }

  updateMouseLine(w, h) {
    const mouseLinePos =
      this.xScale(
        this.xScaleQ(
          select(`.${this.props.panel}-mouse-line`).node()['x1']['animVal'][
            'value'
          ]
        )
      ) +
      this.xScale.bandwidth() / 2

    select(`.${this.props.panel}-mouse-line`)
      .attr('y2', h)
      .attr('x1', mouseLinePos)
      .attr('x2', mouseLinePos)
  }

  updateLegendMouseMove(event = true) {
    // bad for performance on Chrome but not firefox
    const {
      transactions: {
        opts: { currentStores, yAxisVar }
      },
      dataFormat
    } = this.props

    const chart = select(`.${this.props.panel} div`).node()

    const mouseDate = event
      ? this.xScaleQ(mouse(chart)[0] - 50)
      : this.xScaleQ(
          select(`.${this.props.panel}-mouse-line`).node()['x1']['animVal'][
            'value'
          ]
        )
    const xPos = this.xScale(mouseDate) + this.xScale.bandwidth() / 2

    if (event) {
      select(`.${this.props.panel}-mouse-line`)
        .attr('x1', xPos)
        .attr('x2', xPos)
        .style('opacity', '1')
    }

    select(`.${this.props.panel} .button-legend-select-date`).text(
      `Date: ${mouseDate}`
    )

    for (var i = 0; i < currentStores.length; i++) {
      const result = transactionsQuery(
        this.props.data,
        currentStores[i],
        'Date',
        mouseDate
      )
      if (this.props.legendStatus === 'open') {
        select(
          `.${this.props.panel}-legend-body-g-${currentStores[i]}-value`
        ).text(() => {
          if (result) {
            return dataFormat(result[yAxisVar].toFixed(2))
          } else {
            return ''
          }
        })
      }
    }
  }

  wrapLabels() {
    const tspan = select(`.${this.props.panel} .x.axis`)
      .select('.tick tspan')
      .empty()

    const tspanOrText = element => {
      wrap(
        select(`.${this.props.panel} .x.axis`).selectAll(`.tick ${element}`),
        this.xScale.bandwidth()
      )
    }

    tspan ? tspanOrText('text') : tspanOrText('tspan')
  }

  shouldApplyFlatColor() {
    const {
      opts: { currentStores, yAxisVar },
      const: { colourMap }
    } = this.props.transactions

    if (currentStores.length > 10) {
      currentStores.forEach(id => {
        const data = this.findOne(id)
        if (data) {
          select(`#${this.props.panel}_line_${id}`).style('stroke', '#0082C3')
          selectAll(`.dot_${id}`)
            .data(data)
            .transition()
            .duration(400)
            .attr(
              'cx',
              d => this.xScale(d['Date']) + this.xScale.bandwidth() / 2
            )
            .attr('cy', d => this.yScale(d[yAxisVar]))
            .attr('r', 3)
            .style('fill', '#0082C3')
            .style('opacity', 1)
        }
      })
    } else {
      currentStores.forEach(id => {
        select(`#${this.props.panel}_line_${id}`).style('stroke', colourMap[id])
      })
    }
  }

  updateContainer(duration) {
    // redefine transactions-chart
    select(`.${this.props.panel}-chart`)
      .transition()
      .duration(duration)
      .attr('width', this.props.width)
      .attr('height', this.props.height)
  }

  addCircles(storeTarget, colourMap) {
    const circles = select(`.${this.props.panel} .g_${storeTarget}`)
      .selectAll('.dot')
      .data(this.findOne(storeTarget))
      .enter()
      .append('circle')
      .attr('class', `${this.props.panel} dot_${storeTarget}`)
      .attr('cx', d => this.xScale(d['Date']) + this.xScale.bandwidth() / 2)
      .attr('cy', d => this.yScale(d[this.props.transactions.opts.yAxisVar]))
      .attr('r', 4.5 - 200 / this.props.width)
      .style('stroke', 'white')
      .style('fill', colourMap[storeTarget])
      .style('opacity', 0)

    circles
      .transition()
      .duration(400)
      .ease(easeLinear)
      .style('opacity', 1)
  }

  removeCircles(storeTarget) {
    const circles = selectAll(`.${this.props.panel} .dot_${storeTarget}`)
    circles
      .transition()
      .duration(100)
      .ease(easeLinear)
      .style('opacity', 0)
      .remove()
  }

  removeLine(storeTarget) {
    const line = select(`#${this.props.panel}_line_${storeTarget}`)
    line
      .transition()
      .duration(100)
      .ease(easeLinear)
      .style('opacity', 0)
      .remove()

    select(`.${this.props.panel} .g_${storeTarget}`)
      .transition()
      .duration(100)
      .remove()
  }

  addLine(storeTarget, colourMap) {
    const data = this.findOne(storeTarget)
    if (data) {
      const line = select(`.${this.props.panel}-chart .grp`)
        .append('g')
        .attr('class', `${this.props.panel}-chart g_${storeTarget}`)
        .append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('id', `${this.props.panel}_line_${storeTarget}`)
        .attr('d', this.linePlot)
        .style('stroke', colourMap[storeTarget])
        .style('opacity', 0)

      line
        .transition()
        .duration(200)
        .ease(easeLinear)
        .style('opacity', 1)
    }
  }

  updateLine(id, duration = 400) {
    const {
      transactions: {
        opts: { yAxisVar, currentStores }
      }
    } = this.props

    const data = this.findOne(id)

    if (data) {
      select(`.${this.props.panel}-chart .grp`)
        .select(`#${this.props.panel}_line_${id}`)
        .datum(data)
        .transition()
        .duration(duration)
        .attr('d', this.linePlot)

      // rerender the circles given the axis changes
      selectAll(`.${this.props.panel} .dot_${id}`)
        .data(data)
        .attr('class', `${this.props.panel} dot_${id}`)
        .transition()
        .duration(duration)
        .attr('cx', d => this.xScale(d['Date']) + this.xScale.bandwidth() / 2)
        .attr('cy', d => this.yScale(d[yAxisVar]))
        .attr('r', currentStores.length > 10 ? 3 : 4.5 - 200 / this.props.width)
    }
  }

  updateLinePlot() {
    this.linePlot = line()
      .x(d => this.xScale(d['Date']) + this.xScale.bandwidth() / 2)
      .y(d => this.yScale(d[this.props.transactions.opts.yAxisVar]))
      .curve(curveMonotoneX)
  }

  //MAIN FUNCTIONS
  applyVarChange(w, h, duration, update = true) {
    const {
      transactions: {
        opts: { currentSports, yAxisVar },
        const: { primaryKey },
        nodata
      }
    } = this.props
    if (currentSports.length < 2 && yAxisVar === 'total_transactions') {
      this.updateYAxisLabel(w, h, 400)
    }

    // only really need to update yAxis and line
    this.updateAxes(w, h)

    if (!nodata && update) {
      for (var i = 0; i < this.props.data.length; i++) {
        const id = this.props.data[i][primaryKey]
        // when a secondary filter changes the data
        this.updateLine(id)
      }
    }
  }

  applyPrimaryFilter(w, h, duration) {
    const {
      transactions: {
        const: { colourMap, primaryKey },
        opts: { currentStores, storeTarget },
        currentStoresData
      },
      dataPositions
    } = this.props

    this.updateYScale(w, h)
    this.updateXScale(w, h)

    const storePos = currentStores.indexOf(storeTarget)
    const dataPos = dataPositions[storeTarget]
    const deselected = dataPos === undefined

    for (var i = 0; i < this.props.data.length; i++) {
      const id = this.props.data[i][primaryKey]
      this.updateLine(id)
      selectAll(`.${this.props.panel} .dot_${id}`).style('fill', colourMap[id])
    }

    for (var i = 0; i < currentStores.length; i++) {
      const id = currentStores[i]
      if (dataPositions[id] === undefined || dataPositions[id] === -1) {
        this.removeLine(id)
      }
    }

    if (deselected) {
      if (dataPositions[storeTarget] === -1) {
        return
      }
      // if the storeTarget is no longer in the query result
      this.removeLine(storeTarget)
      this.removeCircles(storeTarget)
    } else {
      // if the storeTarget is added to the query result
      if (currentStoresData[storePos] === true) {
        // if there is data for this site
        this.addLine(storeTarget, colourMap)
        this.addCircles(storeTarget, colourMap)
        if (currentStores.length === 1) {
          this.updateAxes(w, h, 400)
        }
      }
    }
    this.shouldApplyFlatColor(colourMap, dataPositions)
  }

  applySecondaryFilter(w, h, duration) {
    const {
      transactions: {
        const: { colourMap, primaryKey },
        opts: { currentStores, yAxisVar, target },
        nodata
      },
      dataPositions
    } = this.props

    this.updateYScale(w, h)
    this.updateXScale(w, h)
    this.updateLinePlot()

    for (var i = 0; i < this.props.data.length; i++) {
      const id = this.props.data[i][primaryKey]
      // when a secondary filter changes the data
      this.updateLine(id)

      if (target !== 'stores') {
        // Remove circles for 'partial' lines where data exists for a subset
        // of dates

        selectAll(`.${this.props.panel} .dot_${id}`)._groups[0].forEach(
          (node, j) => {
            if (!this.findOne(id)[j]) {
              node.remove()
            }
          }
        )

        // only add 'partial' circles if the filter added
        // was not the primary (store) filter
        // returns months where circles have disappeared due to filters
        const lapsed = Array.from(
          selectAll(`.${this.props.panel} .dot_${id}`)._groups[0]
        ).map((d, i) => {
          return d.__data__['Date']
        })

        if (!lapsed.length) {
          this.addLine(id, colourMap, dataPositions[id])
        }

        // appends circles where they have been removed due to filters
        const circles = select(`.${this.props.panel} .g_${id}`)
          .selectAll(`.${this.props.panel} .g_${id}`)
          .data(this.findOne(id).filter(d => lapsed.indexOf(d['Date']) === -1))
          .enter()
          .append('circle')
          .attr('class', `${this.props.panel} dot_${id}`)
          .attr('cx', d => this.xScale(d['Date']) + this.xScale.bandwidth() / 2)
          .attr('cy', d => this.yScale(d[yAxisVar]))
          .attr('r', 4.5 - 200 / this.props.width)
          .style(
            'fill',
            nodata
              ? '#b8b9ba'
              : currentStores.length <= 10
              ? colourMap[id]
              : '#0082C3'
          )
          .style('stroke', 'white')
          .style('opacity', 0)

        circles
          .transition()
          .duration(400)
          .ease(easeLinear)
          .style('opacity', 1)

        selectAll(`.${this.props.panel} .dot_${id}`)
          .style('stroke', 'white')
          .style(
            'fill',
            nodata
              ? '#b8b9ba'
              : currentStores.length <= 10
              ? colourMap[id]
              : '#0082C3'
          )
      }
    }

    // remove lines/circles when secondary filters return
    // no data for the primary filter
    const dataStores = this.props.data.map(d => d[primaryKey])
    for (var i = 0; i < currentStores.length; i++) {
      if (!dataStores.includes(currentStores[i])) {
        this.removeLine(currentStores[i])
        this.removeCircles(currentStores[i])
      }
    }

    this.applyVarChange(w, h, duration, false)
    this.shouldApplyFlatColor(colourMap, dataPositions)
    this.updateLegendMouseMove((event = false))
    // this.xAxisRender(w, h, duration)
  }

  updateXAxisLabel(w, h, duration) {
    select(`.${this.props.panel}-chart .xlabel`)
      .attr('y', -5)
      .attr('x', w - 20)
      .style('font-size', Math.min(12, Math.max(7, w / 30)) + 'px')
  }

  updateYAxisLabel(w, h, duration) {
    const {
      transactions: {
        opts: { yAxisVar, currentSports },
        const: { yMapInv }
      }
    } = this.props

    const getY = () => {
      if (yAxisVar === 'total_transactions') {
        if (currentSports.length > 0) {
          return yMapInv[yAxisVar] + ' (Inclusive)'
        } else {
          return yMapInv[yAxisVar]
        }
      } else {
        return yMapInv[yAxisVar]
      }
    }

    const yLabel = getY()

    select(`.${this.props.panel}-chart .ylabel`)
      .attr('x', -10)
      .style('text-anchor', 'end')
      .style('opacity', 0)
      .style('font-size', Math.min(12, Math.max(7, h / 20)) + 'px')
      .transition()
      .duration(duration)
      .style('opacity', 1)
      .style('text-anchor', 'right')
      .text(yLabel)
  }

  updateXScale(w, h) {
    const { bandDomain } = this.props

    this.xScale
      .domain(bandDomain)
      .rangeRound([0, w])
      .padding(0.1)

    this.xScaleQ.domain([0, w]).range(bandDomain)
  }

  updateYScale(w, h) {
    const yAxisVar = this.props.transactions.opts.yAxisVar
    ;[this.min, this.max] = extent(flatten(this.props.data, yAxisVar))
    this.yScale.domain(extentPad([this.min, this.max])).rangeRound([h, 0])
  }

  xAxisRender(w, h, duration = 400) {
    const bandDomain = this.xScale.domain()
    const widthAux = this.props.width < 400 ? 1 : 0
    const divider = Math.floor(bandDomain.length / 12) + widthAux

    const reducedXTicks = bandDomain.filter((d, i) => {
      return !(i % divider)
    })

    select(`.${this.props.panel}-chart .x.axis`)
      .call(
        axisBottom()
          .tickValues(bandDomain.length > 12 ? reducedXTicks : bandDomain)
          .scale(this.xScale)
      )
      .transition()
      .duration(duration)
      .attr('transform', 'translate(0,' + h + ')')
      .selectAll(`.tick text`)
      .call(wrap, this.xScale.bandwidth())

    selectAll(`.${this.props.panel} .x.axis .tick text`).each(function() {
      select(this).style('font-size', Math.min(10, Math.max(7, w / 30)))
    })
  }

  yAxisRender(w, h, duration = 400) {
    select(`.${this.props.panel}-chart .y.axis`)
      .transition()
      .duration(duration)
      .call(
        axisLeft()
          .scale(this.yScale)
          .tickFormat(this.props.dataFormat)
      )

    selectAll(`.${this.props.panel} .y.axis .tick text`).each(function() {
      select(this).style('font-size', Math.min(10, Math.max(7, w / 30)))
    })
  }

  drawChart(w, h) {
    // connect to Faux Dom element
    // all D3 elements will be drawn as children of this node
    const faux = this.props.connectFauxDOM('div', 'chart')

    const {
      transactions: {
        opts: { yAxisVar, currentStores, currentSports },
        const: { colourMap, yMapInv, primaryKey }
      },
      dataFormat,
      bandDomain,
      panel,
      nodata
    } = this.props

    const widthAux = this.props.width < 400 ? 1 : 0
    const divider = Math.floor(bandDomain.length / 12) + widthAux
    const reducedXTicks = bandDomain.filter((d, i) => {
      return !(i % divider)
    })

    this.xScale = scaleBand()
      .domain(bandDomain)
      .rangeRound([0, w])
      .padding(0.1)

    this.xScaleQ = scaleQuantize()
      .domain([0, w])
      .range(bandDomain)

    this.xAxis = axisBottom()
      .tickValues(bandDomain.length > 12 ? reducedXTicks : bandDomain)
      .scale(this.xScale)

    // define yScale
    ;[this.min, this.max] = extent(flatten(this.props.data, yAxisVar))

    this.yScale = scaleLinear()
      .domain(extentPad([this.min, this.max]))
      .rangeRound([h, 0])

    // define yAxis
    this.yAxis = axisLeft()
      .scale(this.yScale)
      .tickFormat(dataFormat)

    // define line path
    this.updateLinePlot()

    // draw initial SVG
    const svg = select(faux)
      .append('svg')
      .attr('class', `${this.props.panel}-chart`)
      .attr('width', this.props.width)
      .attr('height', this.props.height)

    // draw group container adjusted by chart margins (top & left)
    const g = svg
      .append('g')
      .attr('class', `${this.props.panel}-chart grp`)
      .attr(
        'transform',
        'translate(' + this.props.left + ',' + this.props.top + ')'
      )

    // draw x-axis
    this.gX = g
      .append('g')
      .attr('class', `${this.props.panel}-chart x axis`)
      .attr('transform', 'translate(0,' + h + ')')
      .call(this.xAxis)

    this.gX.selectAll('.tick text').each(function() {
      select(this).style('font-size', Math.min(10, Math.max(7, w / 30)))
    })

    // add x-axis label
    this.gX
      .append('text')
      .attr('fill', '#000')
      .attr('y', -5)
      .attr('x', w - 20)
      .attr('class', `${this.props.panel}-chart xlabel`)
      .style('font-size', Math.min(12, Math.max(7, w / 30)) + 'px')
      .text('Date')

    // draw y-axis
    this.gY = g
      .append('g')
      .attr('class', `${this.props.panel}-chart y axis`)
      .call(this.yAxis)

    this.gY.selectAll('.tick text').each(function() {
      select(this).style('font-size', Math.min(10, Math.max(7, w / 30)))
    })

    const yLabel =
      yMapInv[yAxisVar] +
      (currentSports.length > 0 && yAxisVar === 'total_transactions'
        ? ' (Inclusive)'
        : '')

    // draw y-axis label
    this.gY
      .append('text')
      .attr('fill', '#000')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('x', -10)
      .attr('dy', '0.89em')
      .attr('dx', '0.9em')
      .attr('class', `${this.props.panel}-chart ylabel`)
      .style('font-size', Math.min(12, Math.max(7, h / 20)) + 'px')
      .style('text-anchor', 'end')
      .text(yLabel)

    g.append('line')
      .datum(bandDomain)
      .attr('class', `${this.props.panel}-mouse-line`)
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', h)
      .style('stroke', '#212f44')
      .style('stroke-width', '1px')
      .style('opacity', '0')

    svg
      .on('mouseover', () =>
        select(`.${panel}-mouse-line`).classed('active', true)
      )
      .on('mousemove', this.updateLegendMouseMove)
      .on('mouseout', function() {
        select(`.${panel}-mouse-line`)
          .classed('active', false)
          .style('opacity', 0)
      })

    // loop through stores and add line for each selected store
    if (!nodata) {
      for (var i = 0; i < this.props.data.length; i++) {
        const id = this.props.data[i][primaryKey]

        const data = this.findOne(id)

        const gPath = g
          .append('g')
          .attr('class', `${this.props.panel}-chart g_${id}`)

        gPath
          .append('path')
          .datum(data)
          .attr('class', 'line')
          .attr('id', `${this.props.panel}_line_${id}`)
          .attr('d', this.linePlot)
          .style('stroke', () =>
            currentStores.length > 10 ? '#0082C3' : colourMap[id]
          )

        gPath
          .selectAll('.dot')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', `${this.props.panel} dot_${id}`)
          .attr('cx', d => this.xScale(d['Date']) + this.xScale.bandwidth() / 2)
          .attr('cy', d => this.yScale(d[yAxisVar]))
          .attr(
            'r',
            currentStores.length > 10 ? 3 : 4.5 - 200 / this.props.width
          )
          .style('stroke', 'white')
          .style('fill', currentStores.length > 10 ? '#0082C3' : colourMap[id])
      }
    }
  }

  updateAxes(w, h, duration) {
    // console.log('Width:', this.props.width, 'Height:', this.props.height)

    this.updateContainer(duration)

    this.updateXScale(w, h)
    this.updateYScale(w, h)
    this.updateLinePlot()

    this.yAxisRender(w, h, duration)
    this.xAxisRender(w, h, duration)

    this.updateNoDataText()
  }

  updateChart(w, h, duration = 0) {
    for (var i = 0; i < this.props.data.length; i++) {
      const id = this.props.data[i][this.props.transactions.const.primaryKey]
      this.updateLine(id, duration)
    }
  }

  componentDidMount() {
    if (!this.props.data) {
      return
    }
    // console.log('LineChart DidMount')
    const w = this.props.width - this.props.left - this.props.right
    const h = this.props.height - this.props.bottom - this.props.top + 6
    this.drawChart(w, h)
  }

  componentWillUnmount() {
    // console.log('LineChart Unmounted')
  }

  // REMEMBER THAT WITHFAUXDOM UPDATES THE COMPONENT
  // WITH A CHART PROP ONCE IT HAS RENDERED.
  // SEE const faux = this.props.connectFauxDOM('div', 'chart') further up!!!

  componentDidUpdate(prevProps, prevState) {
    // is chart drawn yet - becomes true when this.props.data is not null

    const notDrawn = select(`.${this.props.panel}-chart`).empty()

    const w = this.props.width - this.props.left - this.props.right
    const h = this.props.height - this.props.bottom - this.props.top + 6

    const {
      nodata,
      opts: { yAxisVar, target }
    } = this.props.transactions

    const secondRender =
      this.props.chart !== undefined && prevProps.chart === undefined

    const changedData =
      !isEqual(this.props.data, prevProps.data) ||
      nodata !== prevProps.transactions.nodata

    const changedOpts = !isEqual(
      prevProps.transactions,
      this.props.transactions
    )

    // Object.keys(this.props).forEach(key => {
    //   if (!isEqual(this.props[key], prevProps[key]) && key !== 'children') {
    //     console.log(key)
    //   }
    // })

    const changedVar = yAxisVar != prevProps.transactions.opts.yAxisVar

    const changedLegend = this.props.legendStatus != prevProps.legendStatus

    const controlPanel =
      (this.props.controls.panel.on !== prevProps.controls.prev.panel.on &&
        secondRender) ||
      this.props.controls.on !== prevProps.controls.on // captures update if control panel was switched on or off

    const changedStores = target === 'stores' && !changedLegend && !controlPanel
    const changedSports = target === 'sports' && !changedLegend && !controlPanel
    const changedChannel =
      target === 'channels' && !changedLegend && !controlPanel
    const changedIdentified =
      target === 'identified' && !changedLegend && !controlPanel

    const changedDateRange =
      target === 'dateRange' && !changedLegend && !controlPanel

    const changedDateRangeAgg =
      target === 'dateRangeAggLevel' && !changedLegend && !controlPanel

    const changedDim = !isEqual(prevProps.dimensions, this.props.dimensions)

    const shouldDraw = notDrawn && this.props.data

    const dimChange = isEqual(this.props.dimensions, prevProps.dimensions)
    const duration = dimChange && !controlPanel ? 400 : 0

    // console.log(
    //   'In Linechart Update:',
    //   this.props.transactions.opts,
    //   prevProps.transactions.opts,
    //   changedDateRangeAgg
    // )

    // don't prevent 2nd update when Chart is added as a prop by FauxDom
    // labels are wrapped when this update fires.
    // console.log('Linechart:', notDrawn, this.props.data)
    // to prevent initial draw without data and 2nd render for connecting FauxDom
    if (notDrawn && !this.props.data) {
      return
    }
    if (shouldDraw) {
      // first pass where data is passed
      // and chart has not been drawn
      // console.log('   drawChart')
      this.drawChart(w, h)
    } else {
      if (changedDim) {
        // if dimensions are changed
        // console.log('changedDim')
        this.updateAxes(w, h, duration)

        this.updateXAxisLabel(w, h, duration)
        this.updateYAxisLabel(w, h, duration)

        this.updateMouseLine(w, h)
        this.updateChart(w, h, duration)
      } else if (changedOpts && !changedData) {
        // console.log('Changed Opts and Not Data')
        // first update -> make the legend appear when a new store is selected
        if (changedVar) {
          // if y-axis variable is changed
          // console.log('ChangeVar', yAxisVar)
          this.updateYAxisLabel(w, h, duration)
          this.applyVarChange(w, h, duration)
        }
        if (
          changedStores &&
          !changedData &&
          this.props.legendStatus === 'open'
        ) {
          // allows changes to height of linechart if the legend
          // is open and primary filter is activated
          // console.log('Not sure')
          this.updateAxes(w, h, duration)
          this.updateMouseLine(w, h)
        }
        if (changedLegend || controlPanel) {
          // essentially only fires if control panel is closed.
          // would fire when controls are opened but LineChart
          // is instead unmounted
          // console.log('Got to here')
          this.updateAxes(w, h, duration)
          this.updateMouseLine(w, h)
          this.updateChart(w, h, duration)
        }
      } else if (this.props.transactions.nodata && !changedLegend) {
        // console.log('To No Data', changedData, changedOpts)
        this.toNoData(duration)
        this.yAxisRender(w, h, duration)
        this.addNoDataText(w, h)
      } else if (
        changedStores ||
        changedSports ||
        changedDateRange ||
        changedDateRangeAgg ||
        changedChannel ||
        changedIdentified
      ) {
        // if data is available

        if (changedStores) {
          // console.log('applyPrimaryFilter')
          this.applyPrimaryFilter(w, h, duration)
        } else if (changedSports) {
          // console.log('applySecondaryFilter')
          this.applySecondaryFilter(w, h, duration)
        } else if (changedDateRange) {
          // console.log('DateRangeChanged:')
          this.applySecondaryFilter(w, h, duration)
        } else if (changedDateRangeAgg) {
          // console.log('DateRangeAggLevelChanged')
          this.applySecondaryFilter(w, h, duration)
          return
        } else if (changedChannel) {
          this.applySecondaryFilter(w, h, duration)
        } else if (changedIdentified) {
          this.applySecondaryFilter(w, h, duration)
        }
        this.removeNoDataText() // remove "No Data." text if data is returned by the query
        this.yAxisRender(w, h)
      }
      if (secondRender) {
        this.wrapLabels()
      }
    }
  }

  render() {
    // console.log('LineChart Render', this.props)

    const { loaded } = this.props.transactions
    return loaded ? (
      <div className={this.props.panel}>
        {this.props.chart}
        {/* <PlaybookContext.Consumer>
          {context => (
            <button width={100} height={20}>
              {context.currentStores}
            </button>
          )}
        </PlaybookContext.Consumer> */}
      </div>
    ) : null
  }
}

export default withFauxDOM(LineChart)
