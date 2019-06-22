import React from 'react'

import Map from './Map'
import Legend from './Legend'
import ChartTitle from '../ChartTitle'

import GridItemFramer from '../HOCs/GridItemFramer'
import DimensionDefaultPanel from '../DimensionDefaultPanel'
import ControlChoicePanel from '../ControlChoicePanel'

import { scaleThreshold, scaleQuantize } from 'd3-scale'
import { extent } from 'd3-array'
import { range } from 'd3-array'
import { schemeYlGnBu } from 'd3-scale-chromatic'

import { findWithAttr } from '../Utils/utils'
import omit from 'lodash.omit'
import gql from 'graphql-tag'

// for interacting with MongoDB from the client

import isEqual from 'lodash.isequal'

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
      // console.log('M CHART CLICK KEY:', key, this.props)
    }
  }

  onLegendClick = e => {
    // console.log('M LEGEND CLICK KEY:', e, this.props)
  }

  updateData() {
    this.props.sportMap.query()
  }

  zoomMap = (projection, transform) => {
    this.props.sportMap.onZoom(projection, transform)
    // this.setState({ projection: projection, transform: transform })
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Object.keys(nextProps).forEach(key => {
    //   if (!isEqual(this.props[key], nextProps[key]) && key !== 'children') {
    //     console.log(key)
    //   }
    // })
    const dataChange = !isEqual(
      this.props.sportMap.data,
      nextProps.sportMap.data
    )
    const controlChange = !isEqual(this.props.controls, nextProps.controls)
    const dimensionChange =
      !isEqual(nextProps.dimensions, this.props.dimensions) &&
      this.props.sportMap.loaded // if the dimensions of the container change and the container has loaded
    // const optsChange = !isEqual(this.props.sportMap, nextProps.sportMap) // don't update linechart just because controlPanel is exited
    const transformChange = !isEqual(
      this.props.sportMap.transform,
      nextProps.sportMap.transform
    )
    const selectedChange =
      this.props.sportMap.opts.selectedPolygon !==
      nextProps.sportMap.opts.selectedPolygon
    const legendChange =
      this.props.sportMap.legend !== nextProps.sportMap.legend
    const draggableChange =
      this.props.sportMap.draggable !== nextProps.sportMap.draggable
    const noDataChange =
      this.props.sportMap.nodata !== nextProps.sportMap.nodata

    if (
      dataChange ||
      controlChange ||
      dimensionChange ||
      transformChange ||
      // optsChange ||
      legendChange || // if the legend is toggled
      noDataChange ||
      draggableChange ||
      selectedChange
    ) {
      // console.log('            Container ComponentShouldUpdate')
      return true
    } else {
      // console.log('            Container NOT ComponentShouldUpdate')
      return false
    }
  }

  componentDidMount() {
    // console.log('Container Mounted', this.props.sportMap.legend)
    this.updateData()
  }

  componentWillUnmount() {
    // console.log('Unmounted')
  }

  render() {
    const { client } = this.props

    const other = omit(this.props, [
      'onControlItemClick',
      'hotkeyMap',
      'currentBreakpoint',
      'sportMap'
    ])

    const title = 'Sport Map'
    const titleHeight = Math.min(
      40,
      Math.max(25, parseInt(this.props.width) / 25)
    )
    const titleFontSize = Math.min(
      22,
      Math.max(16, parseInt(this.props.width) / 40)
    )

    const legendSelectHeight = 45

    const legendWidthFunc = () => {
      if (this.props.sportMap.legend === 'open') {
        return legendSelectHeight + 300
      } else {
        return legendSelectHeight
      }
    }

    const legendHeight = legendWidthFunc()

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
    } else if (this.props.item === 'Sport Map') {
      return (
        <div {...other}>
          {client && (
            <React.Fragment>
              <ChartTitle
                title={title}
                titleHeight={titleHeight}
                fontSize={titleFontSize}
              />
              <div
                // onClick={this.onChartClick.bind(this)}
                style={{ display: 'inline-block' }}
              >
                <Map
                  {...other}
                  loaded={this.props.sportMap.loaded}
                  data={this.props.sportMap.data}
                  width={parseInt(this.props.width, 10)}
                  height={
                    parseInt(this.props.height, 10) -
                    legendSelectHeight -
                    7 -
                    titleHeight
                  }
                  zoomMap={this.props.sportMap.onZoom}
                  sportMap={this.props.sportMap}
                  legendStatus={this.props.sportMap.legend}
                  legendHeight={legendHeight}
                  onOutsideMapClick={this.onChartClick}
                />
              </div>
              <div
                onClick={this.onLegendClick.bind(this)}
                style={{ display: 'block' }}
              >
                <Legend
                  {...other}
                  data={this.props.sportMap.data}
                  loaded={this.props.sportMap.loaded}
                  containerHeight={
                    parseInt(this.props.height, 10) - titleHeight
                  }
                  height={legendHeight}
                  width={parseInt(this.props.width, 10)}
                  buttonHeight={legendSelectHeight}
                  sportMap={this.props.sportMap}
                  toggle={this.props.sportMap.toggleLegend}
                  status={this.props.sportMap.legend}
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
