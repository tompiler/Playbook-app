import React from 'react'
import omit from 'lodash.omit'
import isEqual from 'lodash.isequal'

import Main from './Main'
import {
  updateTransactionsData,
  updateTransactionsProps
} from './Transactions/Query'

import {
  updateNewCustomersData,
  updateNewCustomersProps
} from './NewCustomers/Query'

import { updateSportMapProps, updateSportMapData } from './SportMap/Query'

import {
  updateCrossSellingData,
  updateCrossSellingProps
} from './CrossSelling/Query'

import {
  updateCustomerStatsData,
  updateCustomerStatsProps
} from './CustomerStats/Query'

import {
  updateProductSunburstData,
  updateProductSunburstProps
} from './ProductSunburst/Query'

class Query extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      transactions: { legend: 'open' },
      newCustomers: { legend: 'open' },
      sportMap: { legend: 'closed', opts: { selectedPolygon: null } },
      crossSelling: {},
      customerStats: {},
      productSunburst: {}
    }
    this.toggleLegend = this.toggleLegend.bind(this)
    this.updateTransactionsData = updateTransactionsData.bind(this)
    this.updateTransactionsProps = updateTransactionsProps.bind(this)
    this.updateNewCustomersData = updateNewCustomersData.bind(this)
    this.updateNewCustomersProps = updateNewCustomersProps.bind(this)
    this.updateSportMapData = updateSportMapData.bind(this)
    this.updateSportMapProps = updateSportMapProps.bind(this)
    this.toggleSportMapSelected = this.toggleSportMapSelected.bind(this)
    this.updateCrossSellingData = updateCrossSellingData.bind(this)
    this.updateCrossSellingProps = updateCrossSellingProps.bind(this)
    this.updateCustomerStatsData = updateCustomerStatsData.bind(this)
    this.updateCustomerStatsProps = updateCustomerStatsProps.bind(this)
    this.updateProductSunburstData = updateProductSunburstData.bind(this)
    this.updateProductSunburstProps = updateProductSunburstProps.bind(this)
  }

  toggleLegend(panel) {
    console.log(panel)
    this.setState(prevState => ({
      [panel]: {
        ...prevState[panel],
        legend: prevState[panel].legend === 'open' ? 'closed' : 'open'
      }
    }))
  }

  toggleSportMapSelected(d) {
    this.setState(prevState => ({
      sportMap: {
        ...prevState.sportMap,
        opts: {
          selectedPolygon:
            prevState.sportMap.opts.selectedPolygon === d.properties.name
              ? null
              : d.properties.name
        }
      }
    }))
  }

  componentDidUpdate(prevProps) {
    // console.log(prevProps.crossSellingOptions, this.props.crossSellingOptions)
    if (!isEqual(prevProps.transactionOptions, this.props.transactionOptions)) {
      this.updateTransactionsData()
    }
    if (!isEqual(prevProps.newCustomerOptions, this.props.newCustomerOptions)) {
      this.updateNewCustomersData()
    }
    if (!isEqual(prevProps.sportMapOptions, this.props.sportMapOptions)) {
      this.updateSportMapData()
    }
    if (
      !isEqual(prevProps.crossSellingOptions, this.props.crossSellingOptions)
    ) {
      this.updateCrossSellingData()
    }
    if (
      !isEqual(prevProps.customerStatOptions, this.props.customerStatOptions)
    ) {
      this.updateCustomerStatsData()
    }
    if (
      !isEqual(
        prevProps.productSunburstOptions,
        this.props.productSunburstOptions
      )
    ) {
      this.updateProductSunburstData()
    }
  }

  render() {
    const transactions = this.updateTransactionsProps()
    const newCustomers = this.updateNewCustomersProps()
    const sportMap = this.updateSportMapProps()
    const crossSelling = this.updateCrossSellingProps()
    const customerStats = this.updateCustomerStatsProps()
    const productSunburst = this.updateProductSunburstProps()

    const other = omit(this.props, [
      'transactionOptions',
      'newCustomerOptions',
      'sportMapOptions',
      'crossSellingOptions',
      'customerStatOptions',
      'productSunburstOptions'
    ])
    return (
      this.props.client && (
        <Main
          {...other}
          transactions={transactions}
          newCustomers={newCustomers}
          sportMap={sportMap}
          crossSelling={crossSelling}
          customerStats={customerStats}
          productSunburst={productSunburst}
        />
      )
    )
  }
}

export default Query
