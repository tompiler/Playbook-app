import gql from 'graphql-tag'

export function updateCustomerStatsData() {
  const { currentStore } = this.props.customerStatOptions
  this.props.client
    .query({
      query: gql`
        query Query($store: Int) {
          customerStats(store: $store) {
            idr_final_store
            under_25
            btw_25_35
            btw_35_45
            btw_45_55
            over_55
            homme
            femme
            nb_users
            nb_new
            nb_active
          }
        }
      `,
      variables: {
        store: currentStore
      }
    })
    .then(res => {
      // console.log('Customer Result:', res.data.customerStats)
      const nodata = !(
        res.data.customerStats && res.data.customerStats.length > 0
      )
      this.setState({
        customerStats: {
          data: !nodata > 0 ? res.data.customerStats : [],
          loaded: true,
          nodata: nodata
        }
      })
    })
}

export function updateCustomerStatsProps() {
  const customerStats = {
    opts: {
      currentStore: this.props.customerStatOptions.currentStore,
      target: this.props.customerStatOptions.target
    },
    query: this.updateCustomerStatsData,
    data: this.state.customerStats.data,
    loaded: this.state.customerStats.loaded,
    nodata: this.state.customerStats.nodata
  }
  return customerStats
}
