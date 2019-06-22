import React from 'react'
import { slide as Menu } from 'react-burger-menu'

import '/css/SideBar.css'

import TransactionsMenu from './TransactionsMenu'
import NewCustomersMenu from './NewCustomersMenu'
import SportMapMenu from './SportMapMenu'
import CrossSellingMenu from './CrossSellingMenu'
import CustomerStatsMenu from './CustomerStatsMenu'

import DefaultMenu from './DefaultMenu'

class Sidebar extends React.Component {
  constructor(props) {
    super(props)

    this.onStateChange = this.onStateChange.bind(this)
  }

  onStateChange = state => {
    if (!state.isOpen) {
      this.props.onSidebarStateChange(state)
    }
  }

  render() {
    const { controls, url } = this.props
    if (url === 'store') {
      if (controls.panel.target === 'Transactions') {
        return (
          <Menu {...this.props} onStateChange={this.onStateChange}>
            <TransactionsMenu {...this.props} />
          </Menu>
        )
      } else if (controls.panel.target === 'NewCustomers') {
        return (
          <Menu {...this.props} onStateChange={this.onStateChange}>
            <NewCustomersMenu {...this.props} />
          </Menu>
        )
      } else if (controls.panel.target === 'CustomerStats') {
        return (
          <Menu {...this.props} onStateChange={this.onStateChange}>
            <CustomerStatsMenu {...this.props} />
          </Menu>
        )
      } else {
        return (
          <Menu {...this.props}>
            <DefaultMenu {...this.props} onStateChange={this.onStateChange} />
          </Menu>
        )
      }
    } else if (url === 'sport') {
      if (controls.panel.target === 'SportMap') {
        return (
          <Menu {...this.props} onStateChange={this.onStateChange}>
            <SportMapMenu {...this.props} />
          </Menu>
        )
      } else {
        return (
          <Menu {...this.props} onStateChange={this.onStateChange}>
            <CrossSellingMenu {...this.props} />
          </Menu>
        )
      }
    }
  }
}

export default Sidebar
