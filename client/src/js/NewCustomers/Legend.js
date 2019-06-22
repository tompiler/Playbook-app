import React from 'react'
import { withFauxDOM } from 'react-faux-dom'
import { select } from 'd3-selection'
import 'd3-transition'
import { scaleQuantize, scaleTime } from 'd3-scale'

import { findWithAttr, transactionsQuery } from '../Utils/utils'
import isEqual from 'lodash.isequal'
import * as Button from '../LegendButton'

import '/css/LineChart.css'

import newCustomers_map from '/newCustomers_map.json'

import { timeMonth, timeDay } from 'd3-time'
import { timeFormat } from 'd3-time-format'

class Legend extends React.Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.addLegendItem = this.addLegendItem.bind(this)
    this.updateItem = this.updateItem.bind(this)
    this.updateLegendValues = this.updateLegendValues.bind(this)
  }

  toggle() {
    this.props.toggle(this.props.panel)
  }

  drawLegend(w, h) {
    const faux = this.props.connectFauxDOM('div', 'legend')

    const legend = select(faux)
      .append('svg')
      .attr('class', `${this.props.panel}-legend`)
      .attr('width', this.props.width)
      .attr('height', this.props.height - this.props.buttonHeight)

    select(`.${this.props.panel} .button-legend-select`)
      .style('width', '100%')
      // .style('height', this.props.buttonHeight + 'px')
      .style('font-size', `${20 * 0.8}` + 'px')

    const body = legend
      .append('g')
      .attr('class', `${this.props.panel}-legend-body`)

    body
      .append('rect')
      .attr('class', `${this.props.panel}-legend-body-rect`)
      .attr(
        'height',
        this.props.status === 'open'
          ? this.props.height - this.props.buttonHeight
          : 0
      )
  }

  updateLegend(w, h) {
    const {
      newCustomers: {
        const: { colourMap },
        opts: { currentStores }
      },
      status
    } = this.props

    this.updateSvgDimensions()

    for (var i = 0; i < currentStores.length; i++) {
      const col = i % 2
      const row = (i - (i % 2)) / 2
      if (status === 'open') {
        this.addLegendItem(currentStores[i], col, row)
        this.updateItem(currentStores[i], col, row)
      } else {
        this.removeLegendItem(currentStores[i])
      }
    }
  }

  updateSvgDimensions() {
    select(`.${this.props.panel}-legend`)
      .attr('width', this.props.width)
      .transition()
      .duration(400)
      .attr('height', this.props.height - this.props.buttonHeight)

    select(`.${this.props.panel} .button-legend-select`).style(
      'height',
      this.props.buttonHeight + 'px'
    )
  }

  updateItem(store, col, row) {
    const {
      newCustomers: {
        const: { colourMap },
        opts: { currentStores },
        currentStoresData,
        nodata
      }
    } = this.props

    const lineEnd = this.props.width / 4 / 2
    const textPadding = 10
    const textStart = lineEnd + textPadding
    const text = select(`.${this.props.panel}-legend-body-g-${store}-name`)
    const textValue = text.text()
    const tspan = text
      .text(null)
      .append('tspan')
      .text(textValue)

    const textEnd = lineEnd + textPadding + tspan.node().getComputedTextLength()
    const valueStart = this.props.width / 2 - this.props.width / 20

    const storePos = currentStores.indexOf(store)
    const noData = !currentStoresData[storePos] || nodata

    if (valueStart < textEnd) {
      this.props.toggle(this.props.panel)
    }

    this.updateSvgDimensions()

    select(`.${this.props.panel}-legend-body-g-${store}`).attr(
      'transform',
      'translate(' +
        (col ? this.props.width / 2 : 0) +
        ',' +
        (this.props.bodyPadding / 2 - 2 + row * 20) +
        ')'
    )

    select(`.${this.props.panel}-legend-body-g-${store}-line`)
      .attr('x1', 25)
      .attr('x2', lineEnd / 2)
      .transition()
      .duration(400)
      .attr('x1', 5)
      .attr('x2', lineEnd)
      .style('stroke', noData ? '#b8b9ba' : colourMap[store])
      .style('stroke-width', '3.5px')
      .style('opacity', 1)

    select(`.${this.props.panel}-legend-body-g-${store}-circle`)
      .style('opacity', 0)
      .attr('cx', 5 + (this.props.width / 8 - 5) / 2)
      .transition()
      .duration(400)
      .style('fill', noData ? '#b8b9ba' : colourMap[store])
      .style('opacity', 1)

    select(`.${this.props.panel}-legend-body-g-${store}-name`)
      .attr('font-size', Math.min(11, Math.max(6, this.props.width / 40)))
      .attr('x', textStart)

    select(`.${this.props.panel}-legend-body-g-${store}-value`)
      .attr('x', valueStart)
      .attr('font-size', Math.min(11, Math.max(6, this.props.width / 40)))
  }

  applyVarChange() {
    const { currentStores } = this.props.newCustomers.opts
    for (var i = 0; i < currentStores.length; i++) {
      this.updateLegendValues(currentStores[i])
    }
  }

  applyPrimaryFilter() {
    const {
      newCustomers: {
        opts: { currentStores, storeTarget },
        const: { colourMap, primaryKey }
      },
      dataPositions
    } = this.props

    const col = currentStores.indexOf(storeTarget) % 2
    const row =
      (currentStores.indexOf(storeTarget) -
        (currentStores.indexOf(storeTarget) % 2)) /
      2

    const deselected = dataPositions[storeTarget] === undefined //&& !nodata
    if (storeTarget !== undefined) {
      // only add or remove line if storeTarget is not undefined
      // (which it is when e.g. sport is changed)
      if (deselected) {
        // if the storeTarget is no longer in the query result
        this.removeLegendItem(storeTarget, col, row)
      } else {
        // if the storeTarget is added to the query result
        this.addLegendItem(storeTarget, col, row)
        this.updateItem(storeTarget, col, row)
      }
    } else {
      for (var i = 0; i < currentStores.length; i++) {
        // when filter is not the Store
        const dataPos = findWithAttr(
          this.props.data,
          primaryKey,
          currentStores[i]
        )
        select(
          `.${this.props.panel}-legend-body-g-${currentStores[i]}-line`
        ).style('stroke', dataPos < 0 ? '#b8b9ba' : colourMap[currentStores[i]])
        select(
          `.${this.props.panel}-legend-body-g-${currentStores[i]}-circle`
        ).style('fill', dataPos < 0 ? '#b8b9ba' : colourMap[currentStores[i]])
      }
    }
    this.updateLegendValues(currentStores[i])
  }

  removeLegendItem(storeTarget) {
    const {
      newCustomers: {
        opts: { currentStores }
      }
    } = this.props

    select(`.${this.props.panel}-legend-body-g-${storeTarget}-name`)
      .transition()
      .duration(10)
      .remove()

    select(`.${this.props.panel}-legend-body-g-${storeTarget}`)
      .transition()
      .duration(10)
      .style('opacity', 0)
      .remove()

    for (var i = 0; i < currentStores.length; i++) {
      const col = i % 2
      const row = (i - (i % 2)) / 2
      select(`.${this.props.panel}-legend-body-g-${currentStores[i]}`).attr(
        'transform',
        'translate(' +
          (col ? this.props.width / 2 : 0) +
          ',' +
          (5 + row * 20) +
          ')'
      )
    }
    this.updateSvgDimensions()
  }

  addLegendItem(storeTarget, col, row) {
    const {
      newCustomers: {
        opts: { dateRange },
        const: { colourMap, primaryKeyLabel }
      },
      dataPositions
    } = this.props

    const isDefined = select(
      `.${this.props.panel}-legend-body-g-${storeTarget}`
    ).empty()

    const noData = dataPositions[storeTarget] === -1 ? true : false

    if (isDefined) {
      const mapping = newCustomers_map[primaryKeyLabel]
      const inv_mapping = Object.keys(mapping).reduce(
        (obj, key) => ({ ...obj, [mapping[key]]: key }),
        {}
      )
      const storeName = inv_mapping[storeTarget]

      select(`.${this.props.panel}-legend-body`)
        .append('g')
        .attr('class', `${this.props.panel}-legend-body-g-${storeTarget}`)
        .attr(
          'transform',
          'translate(' +
            (col ? this.props.width / 2 : 0) +
            ',' +
            (this.props.bodyPadding / 2 - 2 + row * 20) +
            ')'
        )

      select(`.${this.props.panel}-legend-body-g-${storeTarget}`)
        .append('line')
        .attr('class', `${this.props.panel}-legend-body-g-${storeTarget}-line`)
        .attr('x1', 5)
        .attr('x2', 45)
        .attr('y1', 10)
        .attr('y2', 10)
        .style('stroke', noData ? '#b8b9ba' : colourMap[storeTarget])
        .style('stroke-width', '3.5px')

      select(`.${this.props.panel}-legend-body-g-${storeTarget}`)
        .append('circle')
        .attr(
          'class',
          `${this.props.panel}-legend-body-g-${storeTarget}-circle`
        )
        .attr('cx', 25)
        .attr('cy', 10)
        .attr('r', 4.5)
        .style('fill', noData ? '#b8b9ba' : colourMap[storeTarget])
        .style('stroke', 'white')
        .style('stroke-width', '2px')

      select(`.${this.props.panel}-legend-body-g-${storeTarget}`)
        .append('text')
        .attr('class', `${this.props.panel}-legend-body-g-${storeTarget}-name`)
        .text(storeName + ':')
        .attr('font-family', 'Open Sans')
        .attr('font-size', Math.max(11, this.props.width / 150))
        .attr('x', 55)
        .attr('y', 15)

      this.w = this.props.width - this.props.left - this.props.right
      this.xScaleQ = scaleQuantize()
        .domain([0, this.w])
        .range(this.props.bandDomain)
      this.mouseDate = this.xScaleQ(
        select(`.${this.props.panel}-mouse-line`).node()['x1']['animVal'][
          'value'
        ]
      )

      const value = select(
        `.${this.props.panel}-legend-body-g-${storeTarget}-value`
      )
      if (value.empty()) {
        select(`.${this.props.panel}-legend-body-g-${storeTarget}`)
          .append('text')
          .attr(
            'class',
            `${this.props.panel}-legend-body-g-${storeTarget}-value`
          )
          .attr('font-family', 'Open Sans')
          .attr('font-size', 12)
          .attr('text-anchor', 'end')
          .attr('x', this.props.width / 2 - 40)
          .attr('y', 15)

        this.updateLegendValues(storeTarget)
      }
    }
  }

  updateLegendValues(storeTarget) {
    const result = transactionsQuery(
      this.props.data,
      storeTarget,
      'Date',
      this.mouseDate
    )

    if (
      select(`.${this.props.panel} .button-legend-select-date`).text() == ''
    ) {
      select(`.${this.props.panel}-legend-body-g-${storeTarget}-value`).text('')
    } else {
      select(`.${this.props.panel}-legend-body-g-${storeTarget}-value`).text(
        () => {
          return result
            ? this.props.dataFormat(
                result[this.props.newCustomers.opts.yAxisVar].toFixed(2)
              )
            : ''
        }
      )
    }
  }

  componentDidMount() {
    // console.log('Legend componentDidMount', this.props.data)
    if (!this.props.data) {
      return
    }

    const w = this.props.width - this.props.left - this.props.right
    const h = this.props.height - this.props.bottom - this.props.top + 6
    this.drawLegend(w, h)
  }

  componentWillUnmount() {
    // console.log('Legend Unmounted')
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      newCustomers: {
        nodata,
        opts: { target }
      }
    } = this.props

    // is chart drawn yet - becomes true when this.props.data is not null
    const notDrawn = select(`.${this.props.panel}-chart`).empty()

    const w = this.props.width - this.props.left - this.props.right
    const h = this.props.height - this.props.bottom - this.props.top + 6

    const changedData =
      !isEqual(this.props.data, prevProps.data) ||
      nodata !== prevProps.newCustomers.nodata

    const changedOpts = !isEqual(
      prevProps.newCustomers,
      this.props.newCustomers
    )
    const secondRender =
      this.props.legend !== undefined && prevProps.legend === undefined

    const changedStatus = this.props.status != prevProps.status

    const changedVar =
      this.props.newCustomers.opts.yAxisVar !=
      prevProps.newCustomers.opts.yAxisVar

    const controlPanel =
      this.props.controls.panel.on !== prevProps.controls.prev.panel.on &&
      secondRender

    const changedStores = target === 'stores' && !changedStatus && !controlPanel
    const changedSports = target === 'sports' && !changedStatus && !controlPanel

    const shouldDraw = notDrawn && this.props.data

    const changedNoData = nodata !== prevProps.newCustomers.nodata
    const toNoDataClose = nodata && this.props.status === 'open'
    const toNoDataOpen =
      !nodata && this.props.status === 'closed' && changedNoData

    if (shouldDraw) {
      // console.log('    drawLegend:', shouldDraw)
      this.drawLegend(w, h)
    } else {
      if (changedOpts && !changedData) {
        if (changedVar) {
          // when y-axis var is changed
          // console.log('    Legend: applyVarChange')
          this.applyVarChange()
        } else if (changedStatus) {
          // when legend is opened or closed
          // console.log('    Legend: ChangedStatus updateLegend')
          this.updateLegend(w, h)
        } else if (nodata) {
          // adds grey stores to legend
          // console.log('    Legend: ChangedStores')
          this.applyPrimaryFilter()
        }
      } else if (changedData) {
        // console.log('    Legend: ChangedData')
        // second update ->

        if (changedStores) {
          // console.log('    Legend: ChangedStores')
          this.applyPrimaryFilter()
        }
        if (changedSports) {
          // console.log('    Legend: ChangedSports')
          this.updateLegend()
        }
        if (toNoDataClose) {
          // console.log('    Legend: ChangedStatus')
          setTimeout(() => {
            this.props.toggle(this.props.panel)
          }, 400)
          return
        }
        if (toNoDataOpen) {
          // console.log('    Legend: ChangedStatus')
          setTimeout(() => {
            this.props.toggle(this.props.panel)
          }, 400)
          return
        }
      } else if (!changedOpts && !changedData) {
        // any other update
        // console.log('    Legend: Update')
        this.applyVarChange()
        this.updateLegend(w, h)
      }
    }
  }

  render() {
    // console.log('Legend Render', this.props)
    const { loaded } = this.props
    return loaded ? (
      <div className={`${this.props.panel}`}>
        <Button.Primary
          text="Key"
          onClick={this.toggle}
          className={`${this.props.panel} button-legend-select`}
          width={this.props.width}
          mouseDate=" "
        />
        {this.props.legend}
      </div>
    ) : null
  }
}

export default withFauxDOM(Legend)
