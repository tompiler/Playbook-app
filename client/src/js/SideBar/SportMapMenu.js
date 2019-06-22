import React from 'react'
import { findWithAttr } from '../Utils/utils'

import sportMap_map from '/sportMap_map.json'
import '/css/SideBar.css'

import Dropdown from './Dropdown'
import DropdownMultiple from './DropdownMultiple'

import { swap } from '../Utils/utils'
import RangeSlider from './SportMapDateRange'

class SportMapMenu extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentSports: [],
      unvLabelInv: swap(sportMap_map['unv_label'])
    }
  }

  onClick() {}

  resetThenSet = (id, key) => {
    const { toggles } = this.props.sportMapOptions
    const toggle = toggles[key]
    toggle(id, key, 'sportMap')

    let temp = this.state[key]
    temp.forEach(item => (item.selected = false))
    const pos = findWithAttr(temp, 'id', id)
    temp[pos].selected = true

    this.setState({ [key]: temp })
  }

  componentDidMount() {
    const sportArray = []
    const { currentSport } = this.props.sportMapOptions
    Object.entries(sportMap_map['unv_label']).map(entry => {
      var li = {
        id: entry[1],
        title: entry[0],
        key: 'currentSports',
        selected: currentSport === parseInt(entry[1]) ? true : false
      }
      sportArray.push(li)
    })
    this.setState({
      currentSports: sportArray
    })
  }

  componentDidUpdate() {
    // console.log('SidebarJs Updated...')
  }

  componentWillUnmount() {
    // console.log('SidebarJs Unmounted...')
  }

  render() {
    const margin = { top: 20, right: 70, bottom: 20, left: 20 }

    const width = this.props.width - margin.left - margin.right,
      height = 70 - margin.top - margin.bottom

    return (
      <React.Fragment>
        <a className="menu-item" href="#">
          <div className="sidebar-heading-info">Sport Map Menu</div>
          <div>
            <p className="sidebar-heading-info-instructions">
              This chart shows a map of total transactions by postcode area.
            </p>
            <p className="sidebar-heading-info-instructions">
              The map has pan and zoom enabled. There is a slider for the Date
              Range and a Sport filter.
            </p>
            <p className="sidebar-heading-info-instructions">
              Click the 'Key' button at the bottom of the chart for more
              information.
            </p>
          </div>
        </a>
        <a className="menu-item" href="#">
          <div className="sidebar-heading">Date Range</div>
          <RangeSlider
            isSidebarOpen={this.props.isOpen}
            height={height}
            width={width}
            margin={margin}
            min={0}
            max={22}
            pushable={true}
            // defaultValue={{ min: 13, max: 24 }}
            onChange={console.log}
            dateRange={this.props.sportMapOptions.dateRange}
            onSidebarSliderChange={this.props.sportMapOptions.toggles.dateRange}
          />
        </a>
        <a className="menu-item" href="#">
          <div className="sidebar-heading">Sport</div>
          <Dropdown
            titleHelper="Sport"
            title={
              this.state.unvLabelInv[this.props.sportMapOptions.currentSport]
            }
            list={this.state.currentSports}
            resetThenSet={this.resetThenSet}
            width={this.props.width - 50}
          />
        </a>
      </React.Fragment>
    )
  }
}

export default SportMapMenu
