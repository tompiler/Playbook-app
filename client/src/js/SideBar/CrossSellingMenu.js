import React from 'react'
import { findWithAttr, swap } from '../Utils/utils'
import transactions_map from '/transactions_map.json'
import '/css/SideBar.css'

import Dropdown from './Dropdown'

class CrossSellingMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentSports: [],
      sportMap: swap(transactions_map['unv_label'])
    }
  }

  onClick() {
    console.log('Sidebar Menu Item Clicked')
  }

  resetThenSet = (id, key) => {
    const { toggles } = this.props.crossSellingOptions

    const toggle = toggles[key]
    toggle(id, key, 'crossSelling')
    let temp = this.state[key]
    const pos = findWithAttr(temp, 'id', id)
    temp[pos].selected = !temp[pos].selected
    this.setState({
      [key]: temp
    })
  }

  componentDidMount() {
    const sportArray = []
    const { currentSports } = this.props.crossSellingOptions

    Object.entries(transactions_map['unv_label']).map(entry => {
      var li = {
        id: entry[1],
        title: entry[0],
        key: 'currentSports',
        selected: currentSports.includes(parseInt(entry[1])) ? true : false
      }
      sportArray.push(li)
    })

    this.setState({
      currentSports: sportArray
    })
  }

  componentDidUpdate() {
    // console.log('SidebarJs Updated...')
  }

  componentWillUnmount() {
    // console.log('SidebarJs Unmounted...')
  }

  render() {
    return (
      <React.Fragment>
        <a className="menu-item" href="#">
          <div className="sidebar-heading-info">Cross Selling Menu</div>
          <div>
            <p className="sidebar-heading-info-instructions">
              This table shows a list of products and the 3 most complementary
              products.
            </p>
            <p className="sidebar-heading-info-instructions">
              Change the Sport variable using the dropdown below to get the
              complementary products for that sport.
            </p>
            <p className="sidebar-heading-info-instructions">
              Using this table, you can also sort (click on the 'Model' or
              'Name' headings), and search for items by typing a search term
              into the text box and pressing return.
            </p>
          </div>
        </a>
        <div />
        <a className="menu-item" href="#">
          <div className="sidebar-heading">Sport</div>
          <Dropdown
            titleHelper="Sport"
            title={
              this.state.sportMap[
                this.props.crossSellingOptions.currentSports[0]
              ]
            }
            list={this.state.currentSports}
            resetThenSet={this.resetThenSet}
            width={this.props.width - 50}
          />
        </a>
      </React.Fragment>
    )
  }
}

export default CrossSellingMenu
