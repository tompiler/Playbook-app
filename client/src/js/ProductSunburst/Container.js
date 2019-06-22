import React from 'react'

import GridItemFramer from '../HOCs/GridItemFramer'
import DimensionDefaultPanel from '../DimensionDefaultPanel'
import ControlChoicePanel from '../ControlChoicePanel'

import { findWithAttr } from '../Utils/utils'
import omit from 'lodash.omit'
import isEqual from 'lodash.isequal'

import { format } from 'd3-format'
import { scaleTime } from 'd3-scale'
import { timeMonth, timeDay } from 'd3-time'
import { timeFormat } from 'd3-time-format'

import transactions_map from '/transactions_map.json'

class Container extends React.Component {
  constructor(props) {
    super(props)
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
    this.props.productSunburst.query()
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

  render() {
    const { client } = this.props
    const other = omit(this.props, [
      'onControlItemClick',
      'hotkeyMap',
      'currentBreakpoint',
      'productSunburst'
    ])

    // const {
    //   opts: { currentStores, yAxisVar, dateRange, dateRangeAggLevel },
    //   legend
    // } = this.props.transactions
    // console.log(this.props)
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
    } else if (this.props.item === 'Product Sun burst') {
      return <div {...other}>Product SUNBUUUURRRRST</div>
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
