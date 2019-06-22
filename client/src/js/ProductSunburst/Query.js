import gql from 'graphql-tag'

export function updateProductSunburstData() {
  const {
    currentStore,
    currentSport,
    currentDepartment,
    currentSubDepartment,
    currentFamily
  } = this.props.productSunburstOptions
  // console.log(
  //   currentStore,
  //   currentSport,
  //   currentDepartment,
  //   currentSubDepartment,
  //   currentFamily
  // )
  this.props.client
    .query({
      query: gql`
        query Query(
          $store: [Int]!
          $sport: [Int]
          $department: [Int]
          $subDepartment: [Int]
          $family: [Int]
        ) {
          productSunburst(
            store: $store
            sport: $sport
            department: $department
            subDepartment: $subDepartment
            family: $family
          ) {
            idr_final_store
            data {
              num_univers
              dpt_num
              sdp_num
              fam_num_family
              byModel {
                mdl_num_model_r3
                total_items
                total_revenue
              }
              total_items
              total_revenue
            }
          }
        }
      `,
      variables: {
        store: currentStore,
        sport: currentSport,
        department: currentDepartment,
        subDepartment: currentSubDepartment,
        family: currentFamily
      }
    })
    .then(res => {
      // console.log('ProductSunburst Result:', res.data.productSunburst)
      const nodata = !(
        res.data.productSunburst && res.data.productSunburst.length > 0
      )
      this.setState({
        productSunburst: {
          data: !nodata > 0 ? res.data.productSunburst : [],
          loaded: true,
          nodata: nodata
        }
      })
    })
}

export function updateProductSunburstProps() {
  const productSunburst = {
    opts: {
      currentStore: this.props.productSunburstOptions.currentStore,
      target: this.props.productSunburstOptions.target
    },
    query: this.updateProductSunburstData,
    data: this.state.productSunburst.data,
    loaded: this.state.productSunburst.loaded,
    nodata: this.state.productSunburst.nodata
  }
  return productSunburst
}
