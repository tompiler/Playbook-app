import React from 'react'
import { swap } from './Utils/utils'
import { CSSTransition } from 'react-transition-group'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class ControlSelector extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const className = !this.props.controls.panel.on
      ? 'control-active'
      : this.props.controls.panel.target
      ? 'control-active'
      : 'control-hidden'

    const hotkeyMapInv = swap(this.props.hotkeyMap)
    return (
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <div className="control-parent">
          <div
            className={className}
            style={{
              fontSize: Math.min(84, this.props.width / 12)
            }}
            width={this.props.width}
          >
            {className === 'control-active' ? this.props.item : null}
          </div>
          <div>
            {className === 'control-active' ? (
              window.innerWidth < 690 ? (
                <div
                  className={className + '-instructions-chart'}
                  style={{ fontSize: Math.min(26, this.props.width / 20) }}
                >
                  {'Chart View: Press  '}
                  <FontAwesomeIcon icon="bars" className="controlBurgerDark" />
                </div>
              ) : (
                <div
                  className={className + '-instructions-chart'}
                  style={{ fontSize: Math.min(26, this.props.width / 20) }}
                >
                  {'Chart View: Press ctrl + up'}
                </div>
              )
            ) : null}
          </div>
          {className === 'control-active' ? (
            window.innerWidth < 690 ? (
              <div
                className={className + '-instructions-control'}
                style={{ fontSize: Math.min(26, this.props.width / 20) }}
              >
                Controls: Click here
              </div>
            ) : (
              <div
                className={className + '-instructions-control'}
                style={{ fontSize: Math.min(26, this.props.width / 20) }}
              >
                Controls: Click here or press
                {' ' + hotkeyMapInv[this.props.item.replace(' ', '')]}
              </div>
            )
          ) : null}
        </div>
      </CSSTransition>
    )
  }
}
export default ControlSelector

{
  /* <React.Fragment>
<CSSTransition in={true} appear={true} timeout={2000} classNames="fade">
  <div
    className={className}
    style={{
      fontSize: Math.min(84, this.props.width / 7.5)
    }}
    width={this.props.width}
  >
    {className === 'control-active' ? this.props.item : null}
  </div>
</CSSTransition>
<CSSTransition in={true} appear={true} timeout={2000} classNames="fade">
  {className === 'control-active' ? (
    <div
      className={className + '-instructions-chart'}
      style={{ fontSize: Math.min(26, this.props.width / 7.5) }}
    >
      Chart View: Press ctrl + up
    </div>
  ) : null}
</CSSTransition>
<CSSTransition in={true} appear={true} timeout={2000} classNames="fade">
  {className === 'control-active' ? (
    <div
      className={className + '-instructions-control'}
      style={{ fontSize: Math.min(26, this.props.width / 7.5) }}
    >
      Controls: Click here or press
      {' ' + hotkeyMapInv[this.props.item.replace(' ', '')]}
    </div>
  ) : null}
</CSSTransition>
</React.Fragment> */
}
