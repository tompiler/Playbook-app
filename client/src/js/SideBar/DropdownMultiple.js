import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// import '../styles/global.css'
import '/css/Dropdown.css'

class DropdownMultiple extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: null,
      listOpen: false,
      headerTitle: this.props.title,
      timeOut: null
    }
    this.close = this.close.bind(this)
  }

  componentDidUpdate() {
    const { listOpen } = this.state
    setTimeout(() => {
      if (listOpen) {
        window.addEventListener('click', this.close)
      } else {
        window.removeEventListener('click', this.close)
      }
    }, 0)
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.close)
  }

  close(timeOut) {
    this.setState({
      listOpen: false
    })
  }

  static getDerivedStateFromProps(nextProps) {
    const selected = nextProps.list.filter(function(a) {
      return a.selected
    })
    const count = selected.length
    if (nextProps.titleHelper === 'Identification' && count === 1) {
      return { headerTitle: selected[0]['title'] }
    } else if (nextProps.titleHelper === 'Identification' && count === 2) {
      return { headerTitle: 'All' }
    }
    if (count === 0) {
      return { headerTitle: nextProps.title }
    } else if (count === 1) {
      return { headerTitle: `${count} ${nextProps.titleHelper}` }
    } else if (count > 1) {
      return { headerTitle: `${count} ${nextProps.titleHelper}s` }
    }
  }

  toggleList() {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen
    }))
  }

  render() {
    const { list, toggleItem } = this.props
    const { listOpen, headerTitle } = this.state
    return (
      <div className="dd-wrapper">
        <div
          className="dd-header"
          onClick={() => this.toggleList()}
          style={{ width: this.props.width }}
        >
          <div className="dd-header-title">{headerTitle}</div>
          {listOpen ? (
            <FontAwesomeIcon icon="angle-up" size="2x" className="angleUp" />
          ) : (
            <FontAwesomeIcon
              icon="angle-down"
              size="2x"
              className="angleDown"
            />
          )}
        </div>
        {listOpen && (
          <ul
            className="dd-list"
            onClick={e => e.stopPropagation()}
            style={{ width: this.props.width }}
          >
            {list.map(item => (
              <li
                className="dd-list-item"
                key={item.title}
                onClick={() => toggleItem(item.id, item.key)}
              >
                {item.title} {item.selected && <FontAwesomeIcon icon="check" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
}

export default DropdownMultiple
