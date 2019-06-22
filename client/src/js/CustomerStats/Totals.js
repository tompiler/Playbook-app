import React from 'react'
import { withFauxDOM } from 'react-faux-dom'

import { select, selectAll, event } from 'd3-selection'

import { wrap, flatten } from '../Utils/utils'
import { format } from 'd3-format'
import isEqual from 'lodash.isequal'

class Totals extends React.Component {
  constructor(props) {
    super(props)
  }

  drawChart() {
    // connect to Faux Dom element
    // all D3 elements will be drawn as children of this node
    const faux = this.props.connectFauxDOM('div', 'chart')

    // const {
    //   customerStats: {
    //     const: {},
    //     opts: {}
    //   },
    //   panel
    // } = this.props

    // draw initial SVG
    const svg = select(faux)
      .append('svg')
      .attr('class', `${this.props.panel}-totals-chart`)
      .attr('width', this.props.width)
      .attr('height', Math.min(250, this.props.height))

    // draw group container adjusted by chart margins (top & left)
    this.drawFigures(svg)
  }

  drawFigures(container) {
    const svg = select(`.${this.props.panel}-totals-chart`).empty()
      ? container
      : select(`.${this.props.panel}-totals-chart`)

    const numFormat = d => format(',.0f')(d)

    select(`.${this.props.panel}-totals-chart .header-total`).remove()
    select(`.${this.props.panel}-totals-chart .header-total-new`).remove()
    select(`.${this.props.panel}-totals-chart .header-total-active`).remove()

    const gLeft = svg
      .append('g')
      .attr('class', `${this.props.panel}-totals-chart header-total`)
      .attr(
        'transform',
        'translate(' +
          this.props.width * 0.15 +
          ',' +
          this.props.margin.top +
          ')'
      )

    const gCenter = svg
      .append('g')
      .attr('class', `${this.props.panel}-totals-chart header-total-new`)
      .attr(
        'transform',
        'translate(' +
          this.props.width * 0.48 +
          ',' +
          this.props.margin.top +
          ')'
      )

    const gRight = svg
      .append('g')
      .attr('class', `${this.props.panel}-totals-chart header-total-active`)
      .attr(
        'transform',
        'translate(' +
          this.props.width * 0.8 +
          ',' +
          this.props.margin.top +
          ')'
      )

    const headerLeft = gLeft
      .append('text')
      .attr('fill', '#000')
      .attr('class', `${this.props.panel}-totals-chart text`)
      .style(
        'font-size',
        Math.min(22, Math.max(7, this.props.width / 20)) + 'px'
      )
      .style('text-anchor', 'middle')
      .style('font-family', 'Open Sans, sans-serif')
      .style('font-weight', 300)
      .text('Total Customers')

    const headerCenter = gCenter
      .append('text')
      .attr('fill', '#000')
      .attr('class', `${this.props.panel}-totals-chart text`)
      .style(
        'font-size',
        Math.min(22, Math.max(7, this.props.width / 20)) + 'px'
      )
      .style('text-anchor', 'middle')
      .style('font-family', 'Open Sans, sans-serif')
      .style('font-weight', 300)
      .text('Total New Customers')

    const headerRight = gRight
      .append('text')
      .attr('fill', '#000')
      .attr('class', `${this.props.panel}-totals-chart text`)
      .style(
        'font-size',
        Math.min(22, Math.max(7, this.props.width / 20)) + 'px'
      )
      .style('text-anchor', 'middle')
      .style('font-family', 'Open Sans, sans-serif')
      .style('font-weight', 300)
      .text('Total Active Customers')

    const numberLeft = gLeft
      .append('text')
      .attr('fill', '#000')
      .attr('class', `${this.props.panel}-totals-chart number-text`)
      .style(
        'font-size',
        Math.min(36, Math.max(7, this.props.width / 20)) + 'px'
      )
      .style('text-anchor', 'middle')
      .style('font-family', 'Open Sans, sans-serif')
      .style('font-weight', 300)
      .attr('y', this.props.height / 2)
      .text(numFormat(this.props.data[0].nb_users))

    const numberCenter = gCenter
      .append('text')
      .attr('fill', '#000')
      .attr('class', `${this.props.panel}-totals-chart number-text`)
      .style(
        'font-size',
        Math.min(36, Math.max(7, this.props.width / 20)) + 'px'
      )
      .style('text-anchor', 'middle')
      .style('font-family', 'Open Sans, sans-serif')
      .style('font-weight', 300)
      .attr('y', this.props.height / 2)
      .text(numFormat(this.props.data[0].nb_new))

    const numberRight = gRight
      .append('text')
      .attr('fill', '#000')
      .attr('class', `${this.props.panel}-totals-chart number-text`)
      .style(
        'font-size',
        Math.min(36, Math.max(7, this.props.width / 20)) + 'px'
      )
      .style('text-anchor', 'middle')
      .style('font-family', 'Open Sans, sans-serif')
      .style('font-weight', 300)
      .attr('y', this.props.height / 2)
      .text(numFormat(this.props.data[0].nb_active))
  }

  updateChart() {
    this.drawFigures()
  }

  updateDim() {
    // console.log(
    //   'Font size:',
    //   Math.min(18, Math.max(10, this.props.width / 50)) + 'px',
    //   this.props.width
    // )

    select(`.${this.props.panel}-totals-chart`)
      .attr('width', this.props.width)
      .attr('height', Math.min(250, this.props.height))

    select(`.${this.props.panel}-totals-chart .header-total`).attr(
      'transform',
      'translate(' + this.props.width * 0.15 + ',' + this.props.margin.top + ')'
    )

    select(`.${this.props.panel}-totals-chart .header-total-new`).attr(
      'transform',
      'translate(' + this.props.width * 0.48 + ',' + this.props.margin.top + ')'
    )

    select(`.${this.props.panel}-totals-chart .header-total-active`).attr(
      'transform',
      'translate(' + this.props.width * 0.8 + ',' + this.props.margin.top + ')'
    )

    selectAll(`.${this.props.panel}-totals-chart .text`).style(
      'font-size',
      Math.min(22, Math.max(10, this.props.width / 20)) + 'px'
    )

    selectAll(`.${this.props.panel}-totals-chart .number-text`)
      .style(
        'font-size',
        Math.min(36, Math.max(10, this.props.width / 15)) + 'px'
      )
      .attr('y', this.props.height / 2)
  }

  wrapTitles = () => {
    wrap(select(`.${this.props.panel}-totals-chart .header-total text`), 70)
    wrap(select(`.${this.props.panel}-totals-chart .header-total-new text`), 90)
    wrap(
      select(`.${this.props.panel}-totals-chart .header-total-active text`),
      120
    )
  }

  componentDidMount() {
    if (!this.props.data) {
      return
    }
    // console.log('Totals Mounted & DrawChart')
    this.drawChart()
  }

  componentDidUpdate(prevProps, prevState) {
    // is chart drawn yet - becomes true when this.props.data is not null
    const notDrawn = select(`.${this.props.panel}-totals-chart`).empty()
    // console.log('Map Update', this.props.sportMap, prevProps.sportMap)
    const w = this.props.width - this.props.left - this.props.right
    const h = this.props.height - this.props.bottom - this.props.top + 6

    const changedData =
      this.props.data !== prevProps.data ||
      this.props.nodata !== prevProps.nodata

    const changedOpts = !isEqual(
      this.props.customerStats.opts.currentSport,
      prevProps.customerStats.opts.currentSport
    )
    const changedDim = !isEqual(prevProps.dimensions, this.props.dimensions)
    const changedLegendOpen =
      this.props.legendStatus === 'open' && prevProps.legendStatus === 'closed'
    const changedLegendClose =
      this.props.legendStatus === 'closed' && prevProps.legendStatus === 'open'

    const shouldDraw = notDrawn && this.props.data
    // console.log(notDrawn, this.props.data, !this.props.controls.panel.on)

    const secondRender =
      this.props.chart !== undefined && prevProps.chart === undefined

    const controlPanel =
      (this.props.controls.panel.on !== prevProps.controls.prev.panel.on &&
        secondRender) ||
      this.props.controls.on !== prevProps.controls.on

    // Object.keys(this.props).forEach(key => {
    //   if (!isEqual(this.props[key], prevProps[key]) && key !== 'children') {
    //     console.log('Changed Prop:', key)
    //   }
    // })

    if (shouldDraw && !this.props.controls.panel.on) {
      //   console.log('  drawChart:')
      this.drawChart()
    } else if (changedOpts) {
      // console.log('changed Opts')
    } else if (changedData) {
      // console.log('Data Change')
      this.updateChart()
    } else if (changedDim) {
      // console.log('updateDim')
      this.updateDim()
      if (this.props.width < 700 && prevProps.width >= 700) {
        this.wrapTitles()
        selectAll(`.${this.props.panel}-totals-chart .number-text`).attr(
          'dy',
          20
        )
      } else if (this.props.width >= 700 && prevProps.width < 700) {
        this.drawFigures()
        selectAll(`.${this.props.panel}-totals-chart .number-text`).attr(
          'dy',
          -20
        )
      }
    } else if (controlPanel) {
      if (this.props.width < 700) {
        this.wrapTitles()
        selectAll(`.${this.props.panel}-totals-chart .number-text`).attr(
          'dy',
          20
        )
      }
    }
  }

  render() {
    const { loaded } = this.props
    return loaded ? (
      // <div className={this.props.panel}>{this.props.chart}</div>
      <div
        className={this.props.panel}
        style={{
          width: '100%',
          height: this.props.height + 'px',
          display: 'block'
        }}
      >
        {this.props.chart}
      </div>
    ) : null
  }
}

export default withFauxDOM(Totals)
