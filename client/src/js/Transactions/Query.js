import gql from 'graphql-tag'
import dayjs from 'dayjs'

import { findWithAttr } from '../Utils/utils'
import transactions_map from '/transactions_map.json'

export function updateTransactionsData() {
  const {
    currentStores,
    currentSports,
    storeTarget,
    channels,
    identified,
    dateRange,
    dateRangeAggLevel
  } = this.props.transactionOptions

  const noDataType =
    currentStores.length === 1 && currentStores[0] === storeTarget
      ? 'primary'
      : 'secondary'

  this.props.client
    .query({
      query: gql`
        query Query(
          $stores: [Int]
          $sports: [Int]
          $channels: [Int]
          $identified: [Int]
          $dateStart: TransactionDate
          $dateEnd: TransactionDate
          $dateRangeAggLevel: String
        ) {
          transactions(
            stores: $stores
            sports: $sports
            channels: $channels
            identified: $identified
            dateStart: $dateStart
            dateEnd: $dateEnd
            dateRangeAggLevel: $dateRangeAggLevel
          ) {
            idr_final_store
            data {
              year
              month
              week
              weekYear
              day
              total_transactions
              total_revenue
              avgBasket
            }
          }
        }
      `,
      variables: {
        stores: currentStores,
        sports: currentSports,
        channels: channels,
        identified: identified,
        dateStart: dateRange[0],
        dateEnd: dateRange[1],
        dateRangeAggLevel: dateRangeAggLevel
      }
    })
    .then(res => {
      res.data.transactions.forEach(store => {
        store.data.forEach(row => {
          const dayStr = 'DD '
          const monthStr = 'MMM'
          const fullYearStr = ' YYYY'
          const yearStr = ' YY'

          if (dateRangeAggLevel === 'Week') {
            row['Date'] = 'Week ' + row['week'] + ' ' + row['weekYear']
          } else {
            const date = new Date(
              row['year'],
              row['month'] - 1,
              dateRangeAggLevel === 'Day' ? row['day'] : 1
            )

            row['Date'] = dayjs(date)
              .format(
                dateRangeAggLevel === 'Day'
                  ? dayStr + monthStr + yearStr
                  : monthStr + fullYearStr
              )
              .toString()
          }

          return row
        })
        return store
      })
      return res
    })
    .then(res => {
      const nodata = !(
        res.data.transactions && res.data.transactions.length > 0
      )
      this.setState(prevState => ({
        transactions: {
          data:
            !nodata > 0 ? res.data.transactions : prevState.transactions.data,
          loaded: true,
          nodata: nodata,
          legend:
            nodata && noDataType === 'primary'
              ? 'open'
              : prevState.transactions.legend,
          currentStoresData: currentStores // boolean array showing whether or not the store has data
            .map(store =>
              findWithAttr(
                !nodata > 0
                  ? res.data.transactions
                  : prevState.transactions.data,
                transactions_map['primary_key'],
                store
              )
            )
            .map(storeResult => (storeResult >= 0 ? true : false))
        }
      }))
    })
}

export function updateTransactionsProps() {
  const transactions = {
    opts: {
      yAxisVar: this.props.transactionOptions.yAxisVar,
      dateRange: this.props.transactionOptions.dateRange,
      dateRangeAggLevel: this.props.transactionOptions.dateRangeAggLevel,
      currentStores: this.props.transactionOptions.currentStores,
      currentSports: this.props.transactionOptions.currentSports,
      channels: this.props.transactionOptions.channels,
      identified: this.props.transactionOptions.identified,
      storeTarget: this.props.transactionOptions.storeTarget,
      target: this.props.transactionOptions.target
    },
    const: {
      yAxisVars: this.props.transactionOptions.yAxisVars,
      yMap: this.props.transactionOptions.yMap,
      yMapInv: this.props.transactionOptions.yMapInv,
      colourMap: this.props.transactionOptions.colourMap,
      primaryKey: transactions_map['primary_key'],
      primaryKeyLabel: transactions_map['primary_key_label']
    },
    query: this.updateTransactionsData,
    data: this.state.transactions.data,
    loaded: this.state.transactions.loaded,
    nodata: this.state.transactions.nodata,
    legend: this.state.transactions.legend,
    toggleLegend: this.toggleLegend,
    currentStoresData: this.state.transactions.currentStoresData
  }
  return transactions
}
