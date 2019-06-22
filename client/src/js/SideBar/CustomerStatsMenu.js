import React from 'react'
import { findWithAttr, swap } from '../Utils/utils'
import customerStats_map from '/customerStats_map.json'
import '/css/SideBar.css'

import Dropdown from './Dropdown'

class CrossSellingMenu extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentStores: [],
      storeMap: swap(customerStats_map[customerStats_map['primary_key_label']])
    }
  }

  onClick() {
    console.log('Sidebar Menu Item Clicked')
  }

  resetThenSet = (id, key) => {
    const { toggles } = this.props.customerStatOptions
    const toggle = toggles[key]
    toggle(id, key, 'customerStat')

    let temp = this.state[key + 's']
    const pos = findWithAttr(temp, 'id', id)
    temp.forEach(item => (item.selected = false))
    temp[pos].selected = !temp[pos].selected

    this.setState({
      [key]: temp
    })
  }

  componentDidMount() {
    const storeArray = []
    const { currentStore } = this.props.customerStatOptions

    Object.entries(
      customerStats_map[customerStats_map['primary_key_label']]
    ).map(entry => {
      var li = {
        id: entry[1],
        title: entry[0],
        key: 'currentStore',
        selected: currentStore === parseInt(entry[1]) ? true : false
      }
      storeArray.push(li)
    })

    this.setState({
      currentStores: storeArray
    })
  }

  componentDidUpdate() {
    // console.log('SidebarJs Updated...')
  }

  componentWillUnmount() {
    // console.log('SidebarJs Unmounted...')
  }

  render() {
    return (
      <React.Fragment>
        <a className="menu-item" href="#">
          <div className="sidebar-heading-info">Customer Statistics Menu</div>
          <div>
            <p className="sidebar-heading-info-instructions">
              This graphic shows some Customer Statistics about the customers at
              each store.
            </p>
            <p className="sidebar-heading-info-instructions">
              Change the Store variable using the dropdown below to get the
              Customer Statistics for each store.
            </p>
          </div>
        </a>
        <div />
        <a className="menu-item" href="#">
          <div className="sidebar-heading">Store</div>
          <Dropdown
            titleHelper="Store"
            title={
              this.state.storeMap[this.props.customerStatOptions.currentStore]
            }
            list={this.state.currentStores}
            resetThenSet={this.resetThenSet}
            width={this.props.width - 50}
          />
        </a>
      </React.Fragment>
    )
  }
}

export default CrossSellingMenu
