import React from 'react'
import { withFauxDOM } from 'react-faux-dom'

import { feature } from 'topojson'
import { select, selectAll, event } from 'd3-selection'
import { geoPath, geoAlbers } from 'd3-geo'
import { map } from 'd3-collection'
import { extent } from 'd3-array'
import { scaleThreshold, scaleQuantize } from 'd3-scale'
import { schemeYlGnBu } from 'd3-scale-chromatic'
import { format } from 'd3-format'

import { zoom, zoomIdentity } from 'd3-zoom'
import { flatten } from '../Utils/utils'

import uk from './uk_topojson_new'

import isEqual from 'lodash.isequal'

import '/css/Map.css'
import sportMap_map from '/sportMap_map.json'

class Map extends React.Component {
  constructor(props) {
    super(props)

    this.selectPolygon = this.selectPolygon.bind(this)
  }

  drawChart() {
    // connect to Faux Dom element
    // all D3 elements will be drawn as children of this node
    const faux = this.props.connectFauxDOM('div', 'chart')

    const {
      sportMap: {
        projection,
        scale,
        const: { color },
        opts: { selectedPolygon }
      },

      panel
    } = this.props

    const path = geoPath().projection(projection)

    const zoomed = () => {
      const transform = event.transform
      projection.translate([transform.x, transform.y]).scale(transform.k)
      if (event.sourceEvent) {
        this.props.zoomMap(projection, transform)
      }
    }

    const zoomObj = zoom()
      .scaleExtent([3800, 50 * this.props.height])
      .translateExtent([
        [-this.props.width / scale, -this.props.height / scale],
        [this.props.width / scale, this.props.height / scale]
      ])
      .on('zoom', zoomed)

    // draw initial SVG
    const svg = select(faux)
      .append('svg')
      .attr('class', `${this.props.panel}-chart`)
      .attr('width', this.props.width)
      .attr('height', this.props.height)

    const g = svg.append('g').attr('class', `${this.props.panel}-chart-g`)

    // console.log('In Map: ', this.props.data)

    g.append('rect')
      .attr('width', this.props.width)
      .attr('height', this.props.height)
      .style('fill', 'white')
      .on('click', this.props.onOutsideMapClick)

    // Set up the initial identity:
    const transform = zoomIdentity
    if (
      this.props.sportMap.transform &&
      this.props.sportMap.transform.k !== 4200
    ) {
      transform.x = projection.translate()[0]
      transform.y = projection.translate()[1]
    } else {
      transform.x = this.props.width / 1.7
      transform.y = this.props.height / 3.5
    }

    transform.k = projection.scale()
    // console.log(transform) //
    this.zoomOn(zoomObj, transform)
    // console.log(this.props.data)

    const that = this
    const f = d => '£ ' + format(',.0f')(d)

    const nullValue = 'Total Transactions: £ 0'
    const value = d => 'Total Transactions: ' + f(d)

    g.append('g')
      .attr('class', 'postcode_areas')
      .selectAll('path')
      .data(feature(uk, uk.objects.Areas).features)
      .enter()
      .append('path')
      .attr('fill', d => this.getColor(d))
      .attr('d', path)
      .attr(
        'class',
        d =>
          `pc_area_${d.properties.name}` +
          (d.properties.name === selectedPolygon ? ' pc_area_selected' : '')
      )
      .on('mouseover', d => this.onMouseover(d, value, nullValue))
      .on('mouseout', d => this.onMouseout(d))
      .on('click', this.selectPolygon)

    // select(`.pc_area_${selectedPolygon}`).classed('pc_area_selected', true)
  }

  onMouseover = (d, value, nullValue) => {
    const {
      panel,
      sportMap: { dataMap }
    } = this.props
    select(`.pc_area_${d.properties.name}`).style('opacity', 0.7)
    select(`.${panel}-legend-body-hover-info-rect`).style(
      'fill',
      this.getColor(d)
    )
    select(`.${panel}-legend-body-hover-info-label`).text(
      sportMap_map['postcode_area'][d.properties.name]
    )
    select(`.${panel}-legend-body-hover-info-value`).text(
      dataMap.get(d.properties.name)
        ? value(dataMap.get(d.properties.name))
        : nullValue
    )
  }

  onMouseout = d => {
    const { panel } = this.props
    select(`.pc_area_${d.properties.name}`).style('opacity', 1)
    select(`.${panel}-legend-body-hover-info-rect`).style('fill', 'white')
    select(`.${panel}-legend-body-hover-info-label`).text('')
    select(`.${panel}-legend-body-hover-info-value`).text('')
  }

  zoomOn(zoomObj, transform) {
    select('.postcode_areas')
      .transition()
      .duration(100)
      .style('opacity', 1)

    select(`.${this.props.panel}-dragging`)
      .text('')
      .transition()
      .duration(100)
      .style('opacity', 0)
      .remove()

    select(this.zoomRef)
      .call(zoomObj)
      .call(zoomObj.transform, transform)
  }

  zoomOff() {
    select(`.${this.props.panel}-chart-g`)
      .append('text')
      .attr('dy', '0.5em')
      .text('Dragging Mode')
      .attr('class', `${this.props.panel}-dragging`)
      .attr('text-anchor', 'middle')
      .attr('x', this.props.width / 2)
      .attr('y', this.props.height / 2)
      .attr(
        'font-family',
        '"Helvetica Neue", "HelveticaNeue", Helvetica, Arial, sans-serif'
      )
      .attr('font-size', '72px')
      .attr('font-style', 'italic')
      .attr('font-weight', 'bold')
      .attr('fill', '#b4b9c1')
      .style('opacity', 0)
      .transition()
      .duration(100)
      .style('opacity', 1)

    select('.postcode_areas')
      .transition()
      .duration(100)
      .style('opacity', 0.2)

    // select(`.${this.props.panel}-dragging`)
    //   .text('Dragging Mode')
    //   .transition()
    //   .duration(100)
    //   .style('opacity', 1)

    select(this.zoomRef).on('mousedown.zoom', () => {})
  }

  selectPolygon(d) {
    this.props.sportMap.polygonSelect(d)
    const polygon = select(`.pc_area_${d.properties.name}`)
    const isSelected = polygon.classed('pc_area_selected')
    selectAll('[class^="pc_area_"]').classed('pc_area_selected', false)
    polygon.classed('pc_area_selected', !isSelected)
  }

  updateChart() {
    const {
      sportMap: {
        transform,
        projection,
        dataMap,
        const: { color }
      },
      panel
    } = this.props

    if (!projection) {
      return
    }
    // console.log('Update Map', this.props.sportMap, this.props.sportMap.data[0])
    const path = geoPath().projection(projection)

    // console.log('Domain:', color.domain())
    const that = this
    const f = d => '£ ' + format(',.0f')(d)

    const nullValue = 'Total Transactions: £ 0'
    const value = d => 'Total Transactions: ' + f(d)

    select('.postcode_areas')
      .selectAll('path')
      .data(feature(uk, uk.objects.Areas).features)
      .attr('d', path)
      .transition()
      .duration(400)
      .attr('fill', d => this.getColor(d))

    select('.postcode_areas')
      .selectAll('path')
      .on('mouseover', function(d) {
        select(`.pc_area_${d.properties.name}`).style('opacity', 0.7)
        select(`.${panel}-legend-body-hover-info-rect`).style(
          'fill',
          that.getColor(d, dataMap)
        )
        select(`.${panel}-legend-body-hover-info-label`).text(
          sportMap_map['postcode_area'][d.properties.name]
        )
        select(`.${panel}-legend-body-hover-info-value`).text(
          dataMap.get(d.properties.name)
            ? value(dataMap.get(d.properties.name))
            : nullValue
        )
      })
      .on('mouseout', d => {
        select(`.pc_area_${d.properties.name}`).style('opacity', 1)
        select(`.${panel}-legend-body-hover-info-rect`).style('fill', 'white')
        select(`.${panel}-legend-body-hover-info-label`).text('')
        select(`.${panel}-legend-body-hover-info-value`).text('')
      })
  }

  getColor(d) {
    const {
      const: { color },
      dataMap
    } = this.props.sportMap

    const attr = (d.total_revenue = dataMap.get(d.properties.name))
    const colour = color(attr) === undefined ? '#b4b9c1' : color(attr)
    return colour
  }

  updateDraggable() {
    console.log('Draggable:', this.props.sportMap.draggable)
    if (!this.props.sportMap.draggable) {
      this.drawChart()
    } else {
      this.zoomOff()
    }
  }

  updateDim() {
    // console.log('legendWidth:', this.props.legendWidth)
    select(`.${this.props.panel}-chart`)
      .attr('width', this.props.width)
      .attr('height', this.props.height)

    select('.map-background')
      .attr('width', this.props.width)
      .attr('height', this.props.height)

    const {
      sportMap: { projection, transform }
    } = this.props

    // console.log('transform:', transform)
    const path = geoPath().projection(projection)

    select('.postcode_areas')
      .selectAll('path')
      .data(feature(uk, uk.objects.Areas).features)
      .attr('d', path)

    select(`.${this.props.panel}-dragging`)
      .attr('x', this.props.width / 2)
      .attr('y', this.props.height / 2)
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
    const notDrawn = select(`.${this.props.panel}-chart`).empty()
    // console.log('Map Update', this.props.sportMap, prevProps.sportMap)
    const w = this.props.width - this.props.left - this.props.right
    const h = this.props.height - this.props.bottom - this.props.top + 6

    const changedData =
      this.props.data !== prevProps.data ||
      this.props.nodata !== prevProps.nodata

    const changedProjection =
      this.props.sportMap.transform !== prevProps.sportMap.transform
    // const changedOpts = !isEqual(
    //   this.props.sportMap.opts.currentSport,
    //   prevProps.sportMap.opts.currentSport
    // )
    const changedDim = !isEqual(prevProps.dimensions, this.props.dimensions)
    const changedLegendOpen =
      this.props.legendStatus === 'open' && prevProps.legendStatus === 'closed'
    const changedLegendClose =
      this.props.legendStatus === 'closed' && prevProps.legendStatus === 'open'

    const changedSelected = !isEqual(
      this.props.sportMap.opts.selectedPolygon,
      prevProps.sportMap.opts.selectedPolygon
    )
    const draggable =
      this.props.sportMap.draggable !== prevProps.sportMap.draggable
    const shouldDraw = notDrawn && this.props.data

    if (shouldDraw && !this.props.controls.panel.on) {
      // console.log('  drawChart:')
      this.drawChart()
      // } else if (changedOpts) {
      //   console.log('changed Opts')
    } else if (changedProjection) {
      // console.log('  changedProjection, updateChart:')
      this.updateChart()
    } else if (changedData) {
      // console.log('Data Change')
      this.updateChart()
    } else if (changedDim) {
      // console.log('updateDim')
      this.updateDim()
    }
    if (draggable) {
      // console.log('updateDraggable')
      this.updateDraggable()
    }
  }

  render() {
    const { loaded } = this.props
    return loaded ? (
      <div
        ref={r => {
          this.zoomRef = r
        }}
        className={this.props.panel}
      >
        {this.props.chart}
      </div>
    ) : null
  }
}

export default withFauxDOM(Map)
