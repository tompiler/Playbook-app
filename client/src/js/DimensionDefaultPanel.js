import React from 'react'
import DimensionSelector from './DimensionSelector'

class DimensionDefaultPanel extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    // console.log(this.props);
    return (
      <div
        className={`${this.props.className}`}
        ref={el => (this._element = el)}
      >
        <DimensionSelector {...this.props} />
        {this.props.children}
      </div>
    )
  }
}

export default DimensionDefaultPanel
