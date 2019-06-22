import gql from 'graphql-tag'
import dayjs from 'dayjs'
import { findWithAttr } from '../Utils/utils'
import newCustomers_map from '/newCustomers_map.json'

export function updateNewCustomersData() {
  const {
    currentStores,
    storeTarget,
    dateRange,
    dateRangeAggLevel
  } = this.props.newCustomerOptions

  const noDataType =
    currentStores.length === 1 && currentStores[0] === storeTarget
      ? 'primary'
      : 'secondary'

  this.props.client
    .query({
      query: gql`
        query Query(
          $stores: [Int]
          $dateStart: newCustomerDate
          $dateEnd: newCustomerDate
          $dateRangeAggLevel: String
        ) {
          newCustomers(
            stores: $stores
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
              nb_total
              nb_online
              nb_cube_in_store
              nb_adhesion_light
            }
          }
        }
      `,
      variables: {
        stores: currentStores,
        dateStart: dateRange[0],
        dateEnd: dateRange[1],
        dateRangeAggLevel: dateRangeAggLevel
      }
    })
    .then(res => {
      res.data.newCustomers.forEach(store => {
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
        res.data.newCustomers && res.data.newCustomers.length > 0
      )
      this.setState(prevState => ({
        newCustomers: {
          data:
            !nodata > 0 ? res.data.newCustomers : prevState.newCustomers.data,
          loaded: true,
          nodata: nodata,
          legend:
            nodata && noDataType === 'primary'
              ? 'open'
              : prevState.newCustomers.legend || 'closed',
          currentStoresData: currentStores // boolean array showing whether or not the store has data
            .map(store =>
              findWithAttr(
                !nodata > 0
                  ? res.data.newCustomers
                  : prevState.newCustomers.data,
                newCustomers_map['primary_key'],
                store
              )
            )
            .map(storeResult => (storeResult >= 0 ? true : false))
        }
      }))
    })
}

export function updateNewCustomersProps() {
  const newCustomers = {
    opts: {
      yAxisVar: this.props.newCustomerOptions.yAxisVar,
      dateRange: this.props.newCustomerOptions.dateRange,
      dateRangeAggLevel: this.props.newCustomerOptions.dateRangeAggLevel,
      currentStores: this.props.newCustomerOptions.currentStores,
      storeTarget: this.props.newCustomerOptions.storeTarget,
      target: this.props.newCustomerOptions.target
    },
    const: {
      yAxisVars: this.props.newCustomerOptions.yAxisVars,
      yMap: this.props.newCustomerOptions.yMap,
      yMapInv: this.props.newCustomerOptions.yMapInv,
      colourMap: this.props.newCustomerOptions.colourMap,
      primaryKey: newCustomers_map['primary_key'],
      primaryKeyLabel: newCustomers_map['primary_key_label']
    },
    query: this.updateNewCustomersData,
    data: this.state.newCustomers.data,
    loaded: this.state.newCustomers.loaded,
    nodata: this.state.newCustomers.nodata,
    legend: this.state.newCustomers.legend,
    toggleLegend: this.toggleLegend,
    currentStoresData: this.state.newCustomers.currentStoresData
  }
  return newCustomers
}
