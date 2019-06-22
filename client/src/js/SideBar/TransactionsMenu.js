import React from 'react'
import { findWithAttr, getPreviousMonday } from '../Utils/utils'
import transactions_map from '/transactions_map.json'
import '/css/SideBar.css'

import Dropdown from './Dropdown'
import DropdownMultiple from './DropdownMultiple'
import * as Button from '../LegendButton'

import DateRangePicker from '@wojtekmaj/react-daterange-picker'

class TransactionsMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentStores: [],
      currentSports: [],
      yAxisVars: ['Average Basket', 'Total Revenue', 'Total Transactions'],
      channels: [],
      identified: [],
      date: [new Date(), new Date()]
    }
  }

  onClick() {
    console.log('Sidebar Menu Item Clicked')
  }

  toggleSelected = (id, key) => {
    // toggle functions from Master
    const { toggles } = this.props.transactionOptions

    // extract required toggle object
    const toggle = toggles[key]

    // call toggle function with id and key
    toggle(id, key, 'transactions')

    let temp = this.state[key]
    const pos = findWithAttr(temp, 'id', id)
    temp[pos].selected = !temp[pos].selected
    this.setState({
      [key]: temp
    })
  }

  resetThenSet = (id, key) => {
    const { toggles } = this.props.transactionOptions

    const toggle = toggles[key]
    toggle(id, key, 'transactions')
    let temp = this.state[key]
    temp.forEach(item => (item.selected = false))
    temp[id].selected = true

    this.setState({ [key]: temp })
  }

  componentDidMount() {
    const storeArray = []
    const sportArray = []
    const varArray = []
    const channelArray = []
    const identifiedArray = []
    const {
      currentStores,
      currentSports,
      channels,
      identified,
      yAxisVar,
      yAxisVars,
      yMap
    } = this.props.transactionOptions

    yAxisVars.map((entry, i) => {
      var li = {
        id: i,
        title: entry,
        key: 'yAxisVars',
        selected: yMap[entry] === yAxisVar ? true : false
      }
      varArray.push(li)
    })
    Object.entries(transactions_map['final_store']).map(entry => {
      var li = {
        id: entry[1],
        title: entry[0],
        key: 'currentStores',
        selected: currentStores.includes(parseInt(entry[1])) ? true : false
      }
      storeArray.push(li)
    })
    Object.entries(transactions_map['unv_label']).map(entry => {
      var li = {
        id: entry[1],
        title: entry[0],
        key: 'currentSports',
        selected: currentSports.includes(parseInt(entry[1])) ? true : false
      }
      sportArray.push(li)
    })
    Object.entries(transactions_map['channel_name']).map(entry => {
      var li = {
        id: entry[1],
        title: entry[0],
        key: 'channels',
        selected: channels.includes(parseInt(entry[1])) ? true : false
      }
      channelArray.push(li)
    })
    Object.keys(transactions_map['identified']).map((entry, i) => {
      var li = {
        id: i,
        title: entry,
        key: 'identified',
        selected: identified.includes(parseInt(entry[1])) ? true : false
      }
      identifiedArray.push(li)
    })

    this.setState({
      currentStores: storeArray,
      currentSports: sportArray,
      yAxisVars: varArray,
      channels: channelArray,
      identified: identifiedArray
    })
  }

  onCalendarChange = dateRange => {
    if (this.props.transactionOptions.dateRangeAggLevel === 'Week') {
      const lower = new Date(getPreviousMonday(dateRange[0]))
      const upper = new Date(
        getPreviousMonday(dateRange[1]) + 1000 * 60 * 60 * 24 * 6 - 1001
      )
      this.props.transactionOptions.toggles.dateRange(
        [lower, upper],
        'transactions'
      )
    } else {
      this.props.transactionOptions.toggles.dateRange(dateRange, 'transactions')
    }
  }

  onCalendarAggregationChange = ev => {
    // const level =
    //   this.props.transactionOptions.dateRangeAggLevel === 'month'
    //     ? 'day'
    //     : 'month'
    const level = ev.currentTarget.value
    this.props.transactionOptions.toggles.calendarAggregation(
      level,
      'transactions'
    )
  }

  componentDidUpdate() {
    // console.log('SidebarJs Updated...')
  }

  componentWillUnmount() {
    // console.log('SidebarJs Unmounted...')
  }

  render() {
    const { dateRangeAggLevel } = this.props.transactionOptions
    const lastUpdated = new Date(transactions_map['last_updated'])

    // REMEMBER:
    //
    // @wojtekmaj/react-daterange-picker/DateRangePicker.js in line: value: function renderInputs() { :
    // Add this line: format = _this$props2.format,
    // AND
    // in var commonProps = { :
    // Add this line: format: format,

    // ALSO
    //
    // In @wojtekmaj/react-daterange-picker/DateRangePicker.css
    //
    //.react-daterange-picker__wrapper {
    //   border-radius: 3px;
    //   display: flex;
    //   border: 3px solid white;
    // }
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
          <div className="sidebar-heading-info">Transactions Menu</div>
          <div>
            <p className="sidebar-heading-info-instructions">
              This chart shows data on transactions in each store.
            </p>
            <p className="sidebar-heading-info-instructions">
              Change the y-axis to show Average Basket, Total Revenue, or Total
              Transactions. There are additional filters for Date Range (by
              Month or Day), Store, Sport, Channel, and Identification status.
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
              this.props.transactionOptions.yMapInv[
                this.props.transactionOptions.yAxisVar
              ]
            }
            list={this.state.yAxisVars}
            resetThenSet={this.resetThenSet}
            width={this.props.width - 50}
          />
        </a>
        <div />

        <a className="menu-item" href="#">
          <div className="sidebar-heading">Date</div>
          <div className="sidebar-sub-heading">Range</div>
          <DateRangePicker
            onChange={this.onCalendarChange}
            value={this.props.transactionOptions.dateRange}
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
              this.props.transactionOptions.dateRangeAggLevel === 'Month'
                ? 'button transactions-button-active'
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
              this.props.transactionOptions.dateRangeAggLevel === 'Week'
                ? 'button transactions-button-active'
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
              this.props.transactionOptions.dateRangeAggLevel === 'Day'
                ? 'button transactions-button-active'
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
        <a className="menu-item" href="#">
          <div className="sidebar-heading">Sport</div>
          <DropdownMultiple
            titleHelper="Sport"
            title="SELECT SPORT"
            list={this.state.currentSports}
            toggleItem={this.toggleSelected}
            width={this.props.width - 50}
          />
        </a>
        <div />
        <a className="menu-item" href="#">
          <div className="sidebar-heading">Channel</div>
          <DropdownMultiple
            titleHelper="Channel"
            title="SELECT CHANNEL"
            list={this.state.channels}
            toggleItem={this.toggleSelected}
            width={this.props.width - 50}
          />
        </a>
        <div />
        <a className="menu-item" href="#">
          <div className="sidebar-heading">Identification Status</div>
          <DropdownMultiple
            titleHelper="Identification"
            title={
              this.props.transactionOptions.identified.length === 1
                ? this.props.transactionOptions.identified[0]
                : 'All'
            }
            list={this.state.identified}
            toggleItem={this.toggleSelected}
            width={this.props.width - 50}
          />
        </a>
        <a className="menu-item" href="#">
          <p className="sidebar-heading-info-instructions">
            ***Note that within a transaction, items purchased may cover
            different 'sports', so the total represents the total transactions
            where at least ONE item of that sport was purchased.
          </p>
        </a>
      </React.Fragment>
    )
  }
}

export default TransactionsMenu
