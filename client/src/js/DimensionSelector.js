import React from 'react'
import { CSSTransition } from 'react-transition-group'

class DimensionSelector extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    // console.log(this.props.width);
    return (
      <div>
        <CSSTransition in={true} appear={true} timeout={2000} classNames="fade">
          <pre>
            {JSON.stringify(
              {
                panel: this.props.panel,
                width: this.props.width,
                height: this.props.height,
                layout: this.props.layout,
                colwidth: this.props.colwidth,
                dimensions: this.props.dimensions
              },
              null,
              2
            )}
          </pre>
        </CSSTransition>
      </div>
    )
  }
}
export default DimensionSelector
