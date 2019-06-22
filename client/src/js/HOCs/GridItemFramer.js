import React from 'react'

const GridItemFramer = (properties = {}) => WrappedComponent => {
  class Framer extends React.Component {
    constructor(props) {
      super(props)
    }

    render() {
      return (
        <div>
          {this.props.children}
          <WrappedComponent {...this.props} {...properties} />
        </div>
      )
    }
  }
  return Framer
}

export default GridItemFramer
