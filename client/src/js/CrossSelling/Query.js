import gql from 'graphql-tag'

export function updateCrossSellingData() {
  const {
    currentSports,
    skip,
    limit,
    sorted,
    filtered
  } = this.props.crossSellingOptions

  this.props.client
    .query({
      query: gql`
        query Query(
          $sports: [Int]
          $skip: Int
          $limit: Int
          $sortedVar: [String]
          $sortedDirection: [Int]
          $filteredVar: [String]
          $filteredValue: [String]
        ) {
          crossSelling(
            sports: $sports
            skip: $skip
            limit: $limit
            sortedVar: $sortedVar
            sortedDirection: $sortedDirection
            filteredVar: $filteredVar
            filteredValue: $filteredValue
          ) {
            total
            limit
            offset
            docs {
              mdl_num_modele_r3_reference
              name_model_reference
              univ_num_reference
              mdl_num_modele_r3_associe1
              name_model_associe1
              univ_num_associe1
              mdl_num_modele_r3_associe2
              name_model_associe2
              univ_num_associe2
              mdl_num_modele_r3_associe3
              name_model_associe3
              univ_num_associe3
              lien_media
            }
          }
        }
      `,
      variables: {
        sports: currentSports,
        skip: skip,
        limit: limit,
        sortedVar: sorted !== undefined ? sorted.map(d => d.id) : null,
        sortedDirection:
          sorted !== undefined ? sorted.map(d => (d.desc ? -1 : 1)) : null,
        filteredVar: filtered !== undefined ? filtered.map(d => d.id) : null,
        filteredValue:
          filtered !== undefined ? filtered.map(d => d.value) : null
      }
    })
    .then(res => {
      const nodata = !(
        res.data.crossSelling && res.data.crossSelling.docs.length > 0
      )
      this.setState({
        crossSelling: {
          data: !nodata > 0 ? res.data.crossSelling.docs : [],
          total: res.data.crossSelling.total,
          limit: res.data.crossSelling.limit,
          loaded: true,
          nodata: nodata
        }
      })
    })
}

export function updateCrossSellingProps() {
  const crossSelling = {
    opts: {
      currentSports: this.props.crossSellingOptions.currentSports,
      target: this.props.crossSellingOptions.target
    },
    query: this.updateCrossSellingData,
    onFetch: this.props.crossSellingOptions.onFetch,
    data: this.state.crossSelling.data,
    total: this.state.crossSelling.total,
    limit: this.state.crossSelling.limit,
    loaded: this.state.crossSelling.loaded,
    nodata: this.state.crossSelling.nodata
  }
  return crossSelling
}
