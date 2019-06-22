import React from 'react'
import { findWithAttr, getPreviousMonday } from '../Utils/utils'

import newCustomers_map from '/newCustomers_map.json'
import '/css/SideBar.css'

import Dropdown from './Dropdown'
import DropdownMultiple from './DropdownMultiple'
import * as Button from '../LegendButton'

import DateRangePicker from '@wojtekmaj/react-daterange-picker'

class NewCustomersMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentStores: [],
      yAxisVars: ['All Routes', 'Online', 'Mobile In Store', 'Tills']
    }
    this.onStateChange = this.onStateChange.bind(this)
  }

  onClick() {
    console.log('Sidebar Menu Item Clicked')
  }

  onStateChange = state => {
    if (!state.isOpen) {
      this.props.onSidebarStateChange(state)
    }
  }

  toggleSelected = (id, key) => {
    console.log(this.props, id, key)
    // toggle functions from Master
    const { toggles } = this.props.newCustomerOptions

    // extract required toggle object
    const toggle = toggles[key]

    // call toggle function with id and key
    toggle(id, key, 'newCustomers')

    let temp = this.state[key]
    const pos = findWithAttr(temp, 'id', id)
    temp[pos].selected = !temp[pos].selected
    this.setState({
      [key]: temp
    })
  }

  resetThenSet = (id, key) => {
    const { toggles } = this.props.newCustomerOptions

    const toggle = toggles[key]

    toggle(id, key, 'newCustomers')
    let temp = this.state[key]
    temp.forEach(item => (item.selected = false))
    temp[id].selected = true

    this.setState({ [key]: temp })
  }

  onCalendarChange = dateRange => {
    if (this.props.newCustomerOptions.dateRangeAggLevel === 'Week') {
      const lower = new Date(getPreviousMonday(dateRange[0]))
      const upper = new Date(
        getPreviousMonday(dateRange[1]) + 1000 * 60 * 60 * 24 * 6 - 1001
      )
      this.props.newCustomerOptions.toggles.dateRange(
        [lower, upper],
        'newCustomers'
      )
    } else {
      this.props.newCustomerOptions.toggles.dateRange(dateRange, 'newCustomers')
    }
  }

  onCalendarAggregationChange = ev => {
    // const level =
    //   this.props.transactionOptions.dateRangeAggLevel === 'month'
    //     ? 'day'
    //     : 'month'
    const level = ev.currentTarget.value
    this.props.newCustomerOptions.toggles.calendarAggregation(
      level,
      'newCustomers'
    )
  }

  componentDidMount() {
    const storeArray = []
    const varArray = []
    const {
      currentStores,
      yAxisVar,
      yAxisVars,
      yMap
    } = this.props.newCustomerOptions

    yAxisVars.map((entry, i) => {
      var li = {
        id: i,
        title: entry,
        key: 'yAxisVars',
        selected: yMap[entry] === yAxisVar ? true : false
      }
      varArray.push(li)
    })

    Object.entries(newCustomers_map['final_store']).map(entry => {
      var li = {
        id: entry[1],
        title: entry[0],
        key: 'currentStores',
        selected: currentStores.includes(parseInt(entry[1])) ? true : false
      }
      storeArray.push(li)
    })
    this.setState({ currentStores: storeArray, yAxisVars: varArray })
  }

  componentDidUpdate() {
    // console.log('SidebarJs Updated...')
  }

  componentWillUnmount() {
    // console.log('SidebarJs Unmounted...')
  }

  render() {
    const { dateRangeAggLevel } = this.props.newCustomerOptions
    const lastUpdated = new Date(newCustomers_map['last_updated'])

    // REMEMBER:
    //
    // @wojtekmaj/react-daterange-picker/DateRangePicker in line: value: function renderInputs() { :
    // Add this line: format = _this$props2.format,
    // AND
    // in var commonProps = { :
    // Add this line: format: format,
    const maxDetail = dateRangeAggLevel === 'Month' ? 'year' : 'month'
    const format = dateRangeAggLevel === 'Month' ? 'M / y' : 'dd / M / y'

    const minDate = () => {
      if (dateRangeAggLevel === 'Month') {
        return new Date(
          lastUpdated.getFullYear() - 2,
          lastUpdated.getMonth(),
          1
        )
      } else if (dateRangeAggLevel === 'Day' || dateRangeAggLevel === 'Week') {
        return new Date(
          lastUpdated.getFullYear() - 2,
          lastUpdated.getMonth(),
          lastUpdated.getDate()
        )
      }
    }

    const maxDate = () => {
      if (dateRangeAggLevel === 'Month') {
        return new Date(
          lastUpdated.getFullYear(),
          lastUpdated.getMonth() + 1,
          0
        )
      } else if (dateRangeAggLevel === 'Day' || dateRangeAggLevel === 'Week') {
        return new Date(
          lastUpdated.getFullYear(),
          lastUpdated.getMonth(),
          lastUpdated.getDate()
        )
      }
    }
    const buttonWidth = Math.min(80, (this.props.width - 100) / 4)
    return (
      <React.Fragment>
        <a className="menu-item" href="#">
          <div className="sidebar-heading-info">New Customers Menu</div>
          <div>
            <p className="sidebar-heading-info-instructions">
              This chart shows data on new customers to each store.
            </p>
            <p className="sidebar-heading-info-instructions">
              There are filters for Date Range (by Month or Day).
            </p>
            <p className="sidebar-heading-info-instructions">
              Click the 'Key' button at the bottom of the chart for more
              information.
            </p>
          </div>
        </a>
        <div />
        <a className="menu-item" href="#">
          <div className="sidebar-heading">Data</div>
          <Dropdown
            titleHelper="Data"
            title={
              this.props.newCustomerOptions.yMapInv[
                this.props.newCustomerOptions.yAxisVar
              ]
            }
            list={this.state.yAxisVars}
            resetThenSet={this.resetThenSet}
            width={this.props.width - 50}
          />
        </a>
        <div />
        <a className="menu-item" href="#">
          <div className="sidebar-heading">Date Range</div>
          <DateRangePicker
            onChange={this.onCalendarChange}
            value={this.props.newCustomerOptions.dateRange}
            showLeadingZeros={true}
            format={format}
            minDetail="decade"
            maxDetail={maxDetail}
            clearIcon={null}
            minDate={minDate()}
            maxDate={maxDate()}
          />
          <div className="sidebar-sub-heading">Aggregation</div>
          <Button.Primary
            text="Month"
            value="Month"
            className={
              this.props.newCustomerOptions.dateRangeAggLevel === 'Month'
                ? 'button newCustomers-button-active'
                : 'button'
            }
            fontFamily={
              "'Helvetica Neue', 'HelveticaNeue', 'Helvetica', 'Arial', 'sans-serif'"
            }
            fontWeight={800}
            width={buttonWidth}
            onClick={this.onCalendarAggregationChange}
          />
          <Button.Primary
            text="Week"
            className={
              this.props.newCustomerOptions.dateRangeAggLevel === 'Week'
                ? 'button newCustomers-button-active'
                : 'button'
            }
            fontFamily={
              "'Helvetica Neue', 'HelveticaNeue', 'Helvetica', 'Arial', 'sans-serif'"
            }
            fontWeight={800}
            width={buttonWidth}
            value="Week"
            onClick={this.onCalendarAggregationChange}
          />
          <Button.Primary
            text="Day"
            className={
              this.props.newCustomerOptions.dateRangeAggLevel === 'Day'
                ? 'button newCustomers-button-active'
                : 'button'
            }
            fontFamily={
              "'Helvetica Neue', 'HelveticaNeue', 'Helvetica', 'Arial', 'sans-serif'"
            }
            fontWeight={800}
            width={buttonWidth}
            value="Day"
            onClick={this.onCalendarAggregationChange}
          />
        </a>
        <div />
        <a className="menu-item" href="#">
          <div className="sidebar-heading">Store</div>
          <DropdownMultiple
            titleHelper="Store"
            title="SELECT STORE"
            list={this.state.currentStores}
            toggleItem={this.toggleSelected}
            width={this.props.width - 50}
          />
        </a>
        <div />
        {/* <a className="menu-item" href="#">
          <div className="sidebar-heading">Channel</div>
          <Dropdown
            titleHelper="Data"
            title={'Channel'}
            list={this.state.channelType}
            resetThenSet={this.resetThenSet}
            width={this.props.width - 50}
          />
        </a> */}
      </React.Fragment>
    )
  }
}

export default NewCustomersMenu
