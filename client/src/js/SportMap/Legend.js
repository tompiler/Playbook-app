import React from 'react'
import { withFauxDOM } from 'react-faux-dom'
import { select, selectAll, mouse } from 'd3-selection'
import 'd3-transition'
import { line, curveMonotoneX } from 'd3-shape'
import { scaleBand, scaleLinear, scaleOrdinal, scaleQuantize } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { extent } from 'd3-array'
import { format } from 'd3-format'
import dayjs from 'dayjs'
import {
  wrap,
  extentPad,
  findWithAttr,
  transactionsQuery,
  flatten,
  swap
} from '../Utils/utils'
import { easeLinear } from 'd3-ease'
import { scaleThreshold } from 'd3-scale'
import { range } from 'd3-array'
import { schemeYlGnBu } from 'd3-scale-chromatic'
import isEqual from 'lodash.isequal'

import * as Button from '../LegendButton'

import '/css/Map.css'
import '/css/LineChart.css'

import sportMap_map from '/sportMap_map.json'

class Legend extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      unvLabelInv: swap(sportMap_map['unv_label'])
    }

    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.props.toggle(this.props.panel)
  }

  drawLegend(w, h) {
    const faux = this.props.connectFauxDOM('div', 'legend')

    const {
      opts: { selectedPolygon },
      const: { color }
    } = this.props.sportMap

    const sportMapExtent = extent(
      this.props.sportMap.data,
      d => d['total_revenue']
    )

    const fullDomain = [0]
      .concat(color.domain())
      .concat([Math.round(sportMapExtent[1], 0)])
      .filter((d, i) => i !== 1)

    const f = d => '£' + format(',.0f')(d)

    const legendBodyHeight =
      this.props.status === 'open'
        ? this.props.height - this.props.buttonHeight
        : 0

    const legendBodyTranslateY =
      this.props.status === 'open'
        ? this.props.containerHeight -
          this.props.height +
          this.props.buttonHeight -
          10
        : this.props.containerHeight - this.props.height - 10

    const legend = select(faux)
      .append('svg')
      .attr('class', `${this.props.panel}-legend`)
      .attr('width', this.props.width)
      .attr('height', legendBodyHeight)
      .attr('transform', 'translate(0,' + legendBodyTranslateY + ')')

    select(`.${this.props.panel} .button-legend-select`)
      .style('width', '100%')
      .style('height', this.props.buttonHeight + 'px')
      .style('font-size', `${20 * 0.8}` + 'px')
      .style('top', this.props.containerHeight - this.props.height - 10 + 'px')

    const body = legend
      .append('g')
      .attr('class', `${this.props.panel}-legend-body`)

    // console.log('DRAWWWW:', this.props.status === 'open')
    body
      .append('rect')
      .attr('class', `${this.props.panel}-legend-body-rect`)
      .attr('width', this.props.width)
      .attr(
        'height',
        this.props.status === 'open'
          ? this.props.height - this.props.buttonHeight
          : 0
      )

    this.addLegendBodyTitle(body)

    const hover = body
      .append('g')
      .attr('class', `${this.props.panel}-legend-body-hover`)
      .attr(
        'transform',
        'translate(' +
          this.props.width * 0.4 +
          ',' +
          this.props.height * 0.5 +
          ')'
      )

    hover
      .append('line')
      .attr('class', `${this.props.panel}-legend-body-underline2`)
      .attr('x1', 5)
      .attr('x2', this.props.width * 0.6 - 10)
      .attr('y1', 5)
      .attr('y2', 5)
      .style('stroke', 'black')
      .style('stroke-width', '0.5px')

    hover
      .append('text')
      .attr('class', `${this.props.panel}-legend-body-title-hover-area`)
      .text('Hover Area')
      .attr('x', 10)
      .attr('y', -4)
      .attr(
        'font-size',
        Math.min(14, Math.max(7, this.props.width / 30)) + 'px'
      )
      .style('font-family', 'Open Sans, sans serif')
      .style('font-weight', 500)

    hover
      .append('rect')
      .attr('class', `${this.props.panel}-legend-body-hover-info-rect`)
      .attr('x', 10)
      .attr('y', 20)
      .attr('rx', 5)
      .attr('width', 80)
      .attr('height', 80)
      .style('fill', 'white')

    hover
      .append('text')
      .attr('class', `${this.props.panel}-legend-body-hover-info-label`)
      .attr('x', 97)
      .attr('y', 50)
      .attr(
        'font-size',
        Math.min(18, Math.max(7, this.props.width / 30)) + 'px'
      )
      .style('font-family', 'Open Sans, sans serif')
      .style('font-weight', 500)

    hover
      .append('text')
      .attr('class', `${this.props.panel}-legend-body-hover-info-value`)
      .attr('x', 97)
      .attr('y', 74)
      .style('font-size', '14px')
      .attr(
        'font-size',
        Math.min(14, Math.max(7, this.props.width / 30)) + 'px'
      )
      .style('font-family', 'Open Sans, sans serif')
      .style('font-weight', 500)

    body
      .append('line')
      .attr('class', `${this.props.panel}-legend-body-underline`)
      .attr('x1', 10)
      .attr('x2', this.props.width - 10)
      .attr('y1', 27)
      .attr('y2', 27)
      .style('stroke', 'black')
      .style('stroke-width', '0.5px')

    if (selectedPolygon) {
      const selectedAreaD = this.props.data.filter(
        d => d['postcode_area'] === selectedPolygon
      )[0]
      const selectedAreaQty =
        selectedAreaD !== undefined ? selectedAreaD['total_revenue'] : -1

      // const infoGroup = body
      //   .append('g')
      //   .attr('class', `${this.props.panel}-legend-body-selected-info`)
      //   .attr(
      //     'transform',
      //     'translate(' + this.props.width / 2 + ', ' + 30 + ')'
      //   )
      const infoGroup = this.addInfoGroup(body)
      this.addInfoRect(infoGroup, selectedAreaQty)
      this.addInfoLabel(infoGroup, selectedPolygon)
      this.addInfoValue(infoGroup, selectedAreaQty)
    } else {
      this.noneSelected()
    }

    if (this.props.status === 'open') {
      for (var i = 0; i < color.domain().length; i++) {
        // console.log(color.domain())
        const gKey = body
          .append('g')
          .attr('class', `${this.props.panel}-legend-body-key-g-${i}`)
          .attr('transform', 'translate(10, ' + ((24 + 5) * i + 35) + ')')

        gKey
          .append('rect')
          .attr('class', `${this.props.panel}-legend-body-key-item`)
          .attr('width', 24)
          .attr('height', 24)
          .attr('x', 10)
          .attr('rx', 2)
          .style('fill', color(color.domain()[i]))

        gKey
          .append('text')
          .attr('class', `${this.props.panel}-legend-body-key-item-text-${i}`)
          .text(`${f(fullDomain[i])} to ${f(fullDomain[i + 1])}`)
          .attr('x', 70)
          .attr('y', 16)
          .style(
            'font-size',
            Math.min(11, Math.max(8, this.props.width / 30)) + 'px'
          )
      }
    }
  }

  updateDim() {
    const {
      const: { color }
    } = this.props.sportMap

    const legendBodyHeight =
      this.props.status === 'open'
        ? this.props.height - this.props.buttonHeight
        : 0

    const legendBodyTranslateY =
      this.props.status === 'open'
        ? this.props.containerHeight -
          this.props.height +
          this.props.buttonHeight -
          10
        : this.props.containerHeight - this.props.height - 10

    // legend select button
    select(`.${this.props.panel} .button-legend-select`)
      .style('width', '100%')
      .style('height', this.props.buttonHeight + 'px')
      .style('font-size', `${20 * 0.8}` + 'px')
      .style('top', this.props.containerHeight - this.props.height - 10 + 'px')

    // legend body
    select(`.${this.props.panel}-legend`)
      .attr('width', this.props.width)
      .attr('height', legendBodyHeight)
      .attr('transform', 'translate(0,' + legendBodyTranslateY + ')')

    select(`.${this.props.panel}-legend-body-rect`)
      .attr('width', this.props.width)
      .attr(
        'height',
        this.props.status === 'open'
          ? this.props.height - this.props.buttonHeight
          : 0
      )

    select(`.${this.props.panel}-legend-body-underline`)
      .attr('x1', 10)
      .attr('x2', this.props.width - 10)
      .attr('y1', 27)
      .attr('y2', 27)

    select(`.${this.props.panel}-legend-body-hover`).attr(
      'transform',
      'translate(' +
        this.props.width * 0.4 +
        ',' +
        this.props.height * 0.5 +
        ')'
    )

    select(`.${this.props.panel}-legend-body-title-hover-area`)
      .attr('x', 10)
      .attr('y', -4)

    select(`.${this.props.panel}-legend-body-underline2`)
      .attr('x1', 5)
      .attr('x2', this.props.width * 0.6 - 10)
      .attr('y1', 5)
      .attr('y2', 5)

    select(`.${this.props.panel}-legend-body-selected-info`).attr(
      'transform',
      'translate(' + this.props.width * 0.4 + ', ' + 30 + ')'
    )

    // legend key title elements
    select(`.${this.props.panel}-legend-body-title-shade`)
      .attr('x', this.props.width * 0.01)
      .attr(
        'font-size',
        Math.min(14, Math.max(7, this.props.width / 30)) + 'px'
      )
    select(`.${this.props.panel}-legend-body-title-range`)
      .attr('x', this.props.width * 0.13)
      .attr(
        'font-size',
        Math.min(14, Math.max(7, this.props.width / 30)) + 'px'
      )
    select(`.${this.props.panel}-legend-body-title-selected-area`)
      .attr('x', this.props.width * 0.4)
      .attr(
        'font-size',
        Math.min(14, Math.max(7, this.props.width / 30)) + 'px'
      )

    // legend key elements
    for (var i = 0; i < color.domain().length; i++) {
      select(`.${this.props.panel}-legend-body-key-item-text-${i}`)
        .attr('x', this.props.width * 0.13)
        .attr(
          'font-size',
          Math.min(11, Math.max(8, this.props.width / 30)) + 'px'
        )

      selectAll(`.${this.props.panel}-legend-body-key-item-${i}`).attr(
        'x',
        this.props.width * 0.01
      )
    }
  }

  addInfoGroup(bodyObj) {
    const body = bodyObj || select(`.${this.props.panel}-legend-body`)
    const infoGroup = select(`.${this.props.panel}-legend-body-selected-info`)
    if (infoGroup.empty()) {
      const infoGroup = body
        .append('g')
        .attr('class', `${this.props.panel}-legend-body-selected-info`)
        .attr(
          'transform',
          'translate(' + this.props.width * 0.4 + ', ' + 30 + ')'
        )
      return infoGroup
    } else {
      return infoGroup
    }
  }

  noneSelected() {
    const infoGroup = this.addInfoGroup(null)
    this.addInfoRect(null, 0)
    this.addInfoLabel(null, '')
    this.addInfoValue(null, 0)
    select(`.${this.props.panel}-legend-body-selected-info-rect`).style(
      'fill',
      '#b4b9c1'
    )

    select(`.${this.props.panel}-legend-body-selected-info-label`).text(
      'None Selected'
    )

    select(`.${this.props.panel}-legend-body-selected-info-value`).text('')
  }

  addInfoRect(infoGroupObj, selectedAreaQty) {
    const {
      const: { color }
    } = this.props.sportMap

    const infoGroup =
      infoGroupObj || select(`.${this.props.panel}-legend-body-selected-info`)

    const infoRect = select(
      `.${this.props.panel}-legend-body-selected-info-rect`
    )
    if (!infoRect.empty()) {
      infoRect.style(
        'fill',
        selectedAreaQty === -1 ? '#b4b9c1' : color(selectedAreaQty)
      )
    } else {
      infoGroup
        .append('rect')
        .attr('class', `${this.props.panel}-legend-body-selected-info-rect`)
        .attr('width', 80)
        .attr('height', 80)
        .attr('x', 10)
        .attr('y', 10)
        .attr('rx', 5)
        .style(
          'fill',
          selectedAreaQty === -1 ? '#b4b9c1' : color(selectedAreaQty)
        )
    }
  }

  addInfoLabel(infoGroupObj, selectedPolygon) {
    const infoGroup =
      infoGroupObj || select(`.${this.props.panel}-legend-body-selected-info`)

    const infoLabel = select(
      `.${this.props.panel}-legend-body-selected-info-label`
    )
    if (!infoLabel.empty()) {
      infoLabel.text(sportMap_map['postcode_area'][selectedPolygon])
    } else {
      infoGroup
        .append('text')
        .attr('class', `${this.props.panel}-legend-body-selected-info-label`)
        .attr('x', 100)
        .attr('y', 46)
        .text(sportMap_map['postcode_area'][selectedPolygon])
        .attr(
          'font-size',
          Math.min(18, Math.max(7, this.props.width / 30)) + 'px'
        )
        .style('font-family', 'Open Sans, sans serif')
        .style('font-weight', 500)
    }
  }

  addInfoValue(infoGroupObj, selectedAreaQty) {
    const infoGroup =
      infoGroupObj || select(`.${this.props.panel}-legend-body-selected-info`)

    const f = d => '£ ' + format(',.0f')(d)
    const infoValue = select(
      `.${this.props.panel}-legend-body-selected-info-value`
    )
    const nullValue = 'Total Transactions: £ 0'
    const value = 'Total Transactions: ' + f(selectedAreaQty)

    if (!infoValue.empty()) {
      infoValue.text(selectedAreaQty === -1 ? nullValue : value)
    } else {
      infoGroup
        .append('text')
        .attr('class', `${this.props.panel}-legend-body-selected-info-value`)
        .attr('x', 100)
        .attr('y', 70)
        .text(selectedAreaQty === -1 ? nullValue : value)
        .attr(
          'font-size',
          Math.min(14, Math.max(7, this.props.width / 30)) + 'px'
        )
        .style('font-family', 'Open Sans, sans serif')
        .style('font-weight', 500)
    }
  }

  updateLegend() {
    const {
      opts: { selectedPolygon },
      const: { color }
    } = this.props.sportMap

    const sportMapExtent = extent(
      this.props.sportMap.data,
      d => d['total_revenue']
    )

    const fullDomain = [0]
      .concat(color.domain())
      .concat([Math.round(sportMapExtent[1], 0)])
      .filter((d, i) => i !== 1)

    const f = d => '£' + format(',.0f')(d)

    if (selectedPolygon) {
      const selectedAreaD = this.props.data.filter(
        d => d['postcode_area'] === selectedPolygon
      )[0]
      const selectedAreaQty =
        selectedAreaD !== undefined ? selectedAreaD['total_revenue'] : -1

      const infoGroup = this.addInfoGroup(null)
      this.addInfoRect(infoGroup, selectedAreaQty)
      this.addInfoLabel(infoGroup, selectedPolygon)
      this.addInfoValue(infoGroup, selectedAreaQty)
    } else {
      this.noneSelected()
    }
    if (this.props.status === 'open') {
      for (var i = 0; i < color.domain().length; i++) {
        select(`.${this.props.panel}-legend-body-key-item-text-${i}`)
          .style(
            'font-size',
            Math.min(11, Math.max(8, this.props.width / 30)) + 'px'
          )
          .transition()
          .duration(400)
          .text(`${f(fullDomain[i])} to ${f(fullDomain[i + 1])}`)
      }
    }
  }

  addLegendBodyTitle(bodyObj) {
    const body = bodyObj || select(`.${this.props.panel}-legend-body`)

    const title = body
      .append('g')
      .attr('class', `${this.props.panel}-legend-body-title`)
      .attr('transform', 'translate(10, 5)')

    title
      .append('text')
      .attr('class', `${this.props.panel}-legend-body-title-shade`)
      .text('Shade')
      .attr('x', this.props.width * 0.005)
      .attr('y', 15)
      .attr(
        'font-size',
        Math.min(14, Math.max(7, this.props.width / 30)) + 'px'
      )
      .style('font-family', 'Open Sans, sans serif')
      .style('font-weight', 500)

    title
      .append('text')
      .attr('class', `${this.props.panel}-legend-body-title-range`)
      .text('Range')
      .attr('x', this.props.width * 0.13)
      .attr('y', 15)
      .attr(
        'font-size',
        Math.min(14, Math.max(7, this.props.width / 30)) + 'px'
      )
      .style('font-family', 'Open Sans, sans serif')
      .style('font-weight', 500)

    title
      .append('text')
      .attr('class', `${this.props.panel}-legend-body-title-selected-area`)
      .text('Selected Area')
      .attr('x', this.props.width * 0.4)
      .attr('y', 15)
      .attr(
        'font-size',
        Math.min(14, Math.max(7, this.props.width / 30)) + 'px'
      )
      .style('font-family', 'Open Sans, sans serif')
      .style('font-weight', 500)
  }

  openLegend() {
    // console.log('Opened the legend', this.props.width, this.props.height)

    const {
      opts: { selectedPolygon },
      const: { color }
    } = this.props.sportMap

    const sportMapExtent = extent(
      this.props.sportMap.data,
      d => d['total_revenue']
    )

    const fullDomain = [0]
      .concat(color.domain())
      .concat([Math.round(sportMapExtent[1], 0)])
      .filter((d, i) => i !== 1)

    const f = d => '£' + format(',.0f')(d)

    select(`.${this.props.panel}-legend`)
      .attr(
        'transform',
        'translate(0,' + (this.props.containerHeight - 10) + ')'
      )
      .attr('width', this.props.width)
      .transition()
      .duration(400)
      .attr('height', this.props.height - this.props.buttonHeight)
      .attr(
        'transform',
        'translate(0,' +
          (this.props.containerHeight -
            this.props.height +
            this.props.buttonHeight -
            10) +
          ')'
      )

    select(`.${this.props.panel} .button-legend-select`)
      .transition()
      .duration(400)
      .style('top', this.props.containerHeight - this.props.height - 10 + 'px')

    select(`.${this.props.panel}-legend-body-rect`)
      .attr('width', this.props.width)
      .transition()
      .duration(400)
      .attr('height', this.props.height - this.props.buttonHeight)

    select(`.${this.props.panel}-legend-body-hover`).attr(
      'transform',
      'translate(' +
        this.props.width * 0.4 +
        ',' +
        this.props.height * 0.5 +
        ')'
    )

    if (selectedPolygon) {
      const selectedAreaD = this.props.data.filter(
        d => d['postcode_area'] === selectedPolygon
      )[0]
      const selectedAreaQty =
        selectedAreaD !== undefined ? selectedAreaD['total_revenue'] : -1

      const infoGroup = this.addInfoGroup(null)
      this.addInfoRect(infoGroup, selectedAreaQty)
      this.addInfoLabel(infoGroup, selectedPolygon)
      this.addInfoValue(infoGroup, selectedAreaQty)
    } else {
      this.noneSelected()
    }

    for (var i = 0; i < color.domain().length; i++) {
      // console.log(color.domain())
      select(`.${this.props.panel}-legend-body`)
        .append('g')
        .attr('class', `${this.props.panel}-legend-body-key-g-${i}`)
        .attr('transform', 'translate(10, ' + ((24 + 5) * i + 35) + ')')

        .append('rect')
        .attr('class', `${this.props.panel}-legend-body-key-item`)
        .attr('width', 24)
        .attr('height', 24)
        .attr('x', this.props.width * 0.01)
        .attr('rx', 2)
        .style('fill', color(color.domain()[i]))

      console.log(this.props.width)
      select(`.${this.props.panel}-legend-body-key-g-${i}`)
        .append('text')
        .attr('class', `${this.props.panel}-legend-body-key-item-text-${i}`)
        .text(`${f(fullDomain[i])} to ${f(fullDomain[i + 1])}`)
        .attr('x', this.props.width * 0.13)
        .attr('y', 16)
        .style(
          'font-size',
          Math.min(11, Math.max(8, this.props.width / 40)) + 'px'
        )
        .style('font-family', 'Open Sans, sans serif')
        .style('font-weight', 500)
    }
  }

  closeLegend() {
    const {
      const: { color }
    } = this.props.sportMap

    // console.log('Closed the legend', this.props.width, this.props.height)
    selectAll(`.${this.props.panel}-legend`)
      .transition()
      .duration(400)
      .attr('width', this.props.width)
      .attr('height', 0)
      .attr(
        'transform',
        'translate(0,' +
          (this.props.containerHeight - this.props.height - 10) +
          ')'
      )

    select(`.${this.props.panel} .button-legend-select`)
      .transition()
      .duration(400)
      .style(
        'top',
        this.props.containerHeight - this.props.buttonHeight - 10 + 'px'
      )

    selectAll(`.${this.props.panel}-legend-body-rect`)
      .transition()
      .duration(400)
      .attr('width', this.props.width)
      .attr(
        'height',
        this.props.status === 'open'
          ? this.props.height - this.props.buttonHeight
          : 0
      )

    for (var i = 0; i < color.domain().length; i++) {
      select(`.${this.props.panel}-legend-body-key-g-${i}`)
        .transition()
        .duration(400)
        .remove()
    }
  }

  componentDidMount() {
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
    // is chart drawn yet - becomes true when this.props.data is not null
    const notDrawn = select(`.${this.props.panel}-legend`).empty()

    const w = this.props.width - this.props.left - this.props.right
    const h = this.props.height - this.props.bottom - this.props.top + 6

    const changedStatus = this.props.status != prevProps.status
    const changedOpts =
      this.props.transactionOptions !== prevProps.transactionOptions
    const changedData =
      this.props.data !== prevProps.data ||
      this.props.nodata !== prevProps.nodata
    const changedDim = !isEqual(prevProps.dimensions, this.props.dimensions)
    const shouldDraw = notDrawn && this.props.data
    const changedOpen =
      this.props.status === 'open' && prevProps.status === 'closed'
    const changedClose =
      this.props.status === 'closed' && prevProps.status === 'open'

    // console.log(
    //   'Check this:',
    //   notDrawn,
    //   select(`.${this.props.panel}-legend`).empty(),
    //   !this.props.controls.panel.on
    // )

    const changedSelectedPolygon = !isEqual(
      this.props.sportMap.opts.selectedPolygon,
      prevProps.sportMap.opts.selectedPolygon
    )

    if (shouldDraw && !this.props.controls.panel.on) {
      // console.log('    drawLegend')
      this.drawLegend(w, h)
    } else if (changedSelectedPolygon) {
      // console.log('Legend: changedSelectedPolygon')
      this.updateLegend()
    } else if (changedData) {
      this.updateLegend()
    } else if (changedDim) {
      this.updateDim()
    } else if (changedOpen) {
      this.openLegend()
    } else if (changedClose) {
      this.closeLegend()
    }
  }

  render() {
    // console.log('Legend Render', this.props)
    const dateRange = this.props.sportMap.dateRange.map(date => {
      return dayjs(date)
        .format('MMM YY')
        .toString()
    })

    const { loaded } = this.props
    return loaded ? (
      <div className={`${this.props.panel}`}>
        <Button.Primary
          text="Key"
          onClick={this.toggle}
          className={`${this.props.panel} button-legend-select`}
          dateRange={dateRange}
          currentSport={
            this.state.unvLabelInv[this.props.sportMap.opts.currentSport]
          }
          width={this.props.width}
        />
        {this.props.legend}
      </div>
    ) : null
  }
}

export default withFauxDOM(Legend)
