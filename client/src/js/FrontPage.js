import React from 'react'
import { NavLink } from 'react-router-dom'

import '/css/FrontPage.css'

class FrontPage extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    // console.log(window.innerWidth, window.innerHeight)
  }

  componentWillUnmount() {}

  render() {
    const rootElement = document.getElementById('root')
    rootElement.style.height = '100%'

    return (
      <div className="frontpage-parent">
        <div className="frontpage-menu-outer">
          <div className="frontpage-menu-playbook-logo">PLAYBOOK</div>
          <NavLink to="/store" className="frontpage-link">
            <div className="frontpage-menu-button">Store</div>
          </NavLink>
          <NavLink to="/sport" className="frontpage-link">
            <div className="frontpage-menu-button">Sport</div>
          </NavLink>
        </div>
      </div>
    )
  }
}

export default FrontPage
