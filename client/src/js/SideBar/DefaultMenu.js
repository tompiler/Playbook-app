import React from 'react'

import '/css/SideBar.css'

class DefaultMenu extends React.Component {
  constructor(props) {
    super(props)
    this.onStateChange.bind(this)
  }

  onClick() {
    console.log('Sidebar Menu Item Clicked')
  }

  onStateChange = state => {
    if (!state.isOpen) {
      this.props.onSidebarStateChange(state)
    }
  }

  render() {
    return (
      <React.Fragment>
        <a className="menu-item" href="#">
          <div className="sidebar-heading" />
        </a>
      </React.Fragment>
    )
  }
}

export default DefaultMenu
