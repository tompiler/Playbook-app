import React from 'react'
import omit from 'lodash.omit'
import isEqual from 'lodash.isequal'

export default class AddDimensionWrapper extends React.Component {
  shouldComponentUpdate(nextProps) {
    /// mechanism to prevent constant updates of
    // each panel when another panel is clicked

    const {
      transactions,
      newCustomers,
      sportMap,
      crossSelling,
      customerStats,
      productSunburst
    } = this.props
    const checkProps = omit(this.props, [
      'children',
      'onClick',
      'onMouseUp',
      'onMouseDown',
      'onTouchEnd',
      'onTouchEnd',
      'onTouchStart'
    ])
    const checkNextProps = omit(nextProps, [
      'children',
      'onClick',
      'onMouseUp',
      'onMouseDown',
      'onTouchEnd',
      'onTouchEnd',
      'onTouchStart'
    ])

    if (
      this.props.controls.panel.on ||
      !isEqual(this.props.controls, nextProps.controls)
    ) {
      return true
    } else if (!isEqual(this.props.style, nextProps.style)) {
      return true
    } else if (!isEqual(this.props.url, nextProps.url)) {
      return true
    } else if (transactions && !isEqual(transactions, nextProps.transactions)) {
      return true
    } else if (newCustomers && !isEqual(newCustomers, nextProps.newCustomers)) {
      return true
    } else if (sportMap && !isEqual(sportMap, nextProps.sportMap)) {
      return true
    } else if (crossSelling && !isEqual(crossSelling, nextProps.crossSelling)) {
      return true
    } else if (
      customerStats &&
      !isEqual(customerStats, nextProps.customerStats)
    ) {
      return true
    } else if (
      productSunburst &&
      !isEqual(productSunburst, nextProps.productSunburst)
    ) {
      return true
    } else if (isEqual(checkProps, checkNextProps)) {
      return false
    } else {
      return false
    }
  }

  componentWillUnmount() {
    // console.log('Add DimWrapper Unmount')
  }

  render() {
    var that = this
    // console.log('Add ReRender')
    const getDimensions = transform => {
      if (transform) {
        const arr = transform.replace(/[^0-9\,.]+/g, '').split(',')
        return {
          left: +arr[0],
          top: +arr[1],
          right: +arr[0] + +that.props.style.width.replace(/[^0-9\,.]+/g, ''),
          bottom: +arr[1] + +that.props.style.height.replace(/[^0-9\,.]+/g, '')
        }
      } else {
        return null
      }
    }
    var newChildren = React.Children.map(this.props.children, function(child) {
      return React.cloneElement(child, {
        width: that.props.style.width,
        height: that.props.style.height,
        dimensions: getDimensions(that.props.style.transform)
      })
    })

    const other = omit(this.props, [
      'colWidth',
      'transactions',
      'newCustomers',
      'sportMap',
      'crossSelling',
      'customerStats',
      'productSunburst'
    ])

    return (
      <div {...other} onClick={this.props.onClick}>
        {this.props.show ? null : newChildren}
      </div>
    )
  }
}
