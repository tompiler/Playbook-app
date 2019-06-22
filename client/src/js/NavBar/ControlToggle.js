import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import '/css/ControlSelect.css'

export default class ControlToggle extends React.Component {
  constructor(props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }
  onClick() {
    this.props.onControlClick()
  }
  render() {
    if (window.innerWidth <= 690) {
      return (
        <a className="controlDivLink" href="#" onClick={this.onClick}>
          <div className="bars">
            <FontAwesomeIcon icon="bars" className="controlBurger" />
          </div>
        </a>
      )
    } else {
      return (
        <a className="controlDivLink" href="#" onClick={this.onClick}>
          Controls
          <FontAwesomeIcon icon="bars" className="controlBurger" />
        </a>
      )
    }
  }
}
