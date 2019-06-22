import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import '/css/NavBar.css'
import ControlToggle from './ControlToggle'
import Logo from './Logo'
import ControlSelector from '../ControlChoicePanel'
import { isAbsolute } from 'path'

class NavBar extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const navBarStyle =
      this.props.controls.panel.on & (window.innerWidth < 690)
        ? { zIndex: 100, position: 'fixed', top: 0 }
        : {}

    return (
      <nav className="navbar" style={navBarStyle}>
        <div className="logoDiv">
          <div className="linkDiv">
            <a href="https://github.com/tompiler">About</a>
          </div>
          {/* <Logo /> */}
        </div>

        {window.innerWidth >= 690 && (
          <React.Fragment>
            <NavLink to="/" className="navbarLink">
              <div className="linkDiv">Home</div>
            </NavLink>
            <NavLink to="/store" className="navbarLink">
              <div className="linkDiv">Store</div>
            </NavLink>
            <NavLink to="/sport" className="navbarLink">
              <div className="linkDiv">Sport</div>
            </NavLink>
          </React.Fragment>
        )}
        <div className="controlDiv">
          <ControlToggle {...this.props} />
        </div>
      </nav>
    )
  }
}
export default withRouter(NavBar)
