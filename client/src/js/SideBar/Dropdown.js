import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// import '../styles/global.css'
import '/css/Dropdown.css'

class Dropdown extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listOpen: false,
      headerTitle: this.props.title
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

  selectItem(title, id, stateKey) {
    this.setState(
      {
        headerTitle: title,
        listOpen: false
      },
      this.props.resetThenSet(id, stateKey)
    )
  }

  toggleList() {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen
    }))
  }

  render() {
    const { list } = this.props
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
                key={item.id}
                onClick={() => this.selectItem(item.title, item.id, item.key)}
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

export default Dropdown
