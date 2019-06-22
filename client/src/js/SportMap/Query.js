import gql from 'graphql-tag'

import { extent } from 'd3-array'
import { scaleThreshold, scalePow } from 'd3-scale'
import { schemeGnBu } from 'd3-scale-chromatic'
import { range } from 'd3-array'
import { map } from 'd3-collection'

export function updateSportMapData() {
  const { currentSport, dateRange } = this.props.sportMapOptions

  this.props.client
    .query({
      query: gql`
        query Query(
          $sport: Int
          $dateStart: sportMapDate
          $dateEnd: sportMapDate
        ) {
          sportMap(sport: $sport, dateStart: $dateStart, dateEnd: $dateEnd) {
            data {
              postcode_area
              total_revenue
            }
          }
        }
      `,
      variables: {
        sport: currentSport,
        dateStart: dateRange[0],
        dateEnd: dateRange[1]
      }
    })
    .then(res => {
      const nodata = !(res.data.sportMap && res.data.sportMap.length > 0)
      this.setState(prevState => ({
        sportMap: {
          data:
            !nodata > 0 ? res.data.sportMap[0].data : prevState.sportMap.data,
          loaded: true,
          legend: prevState.sportMap.legend,
          opts: prevState.sportMap.opts
        }
      }))
    })
}

export function updateSportMapProps() {
  //   console.log(this.state.sportMap.legend)

  const sportMapExtent = this.state.sportMap.data
    ? extent(this.state.sportMap.data, d => (d ? d['total_revenue'] : 0))
    : [0, 0]

  const step = (sportMapExtent[1] - sportMapExtent[0]) / 9
  const domain = range(sportMapExtent[0], sportMapExtent[1], step)

  const pow = scalePow()
    .exponent(1.5)
    .domain([sportMapExtent[0], sportMapExtent[1]])
    .rangeRound([sportMapExtent[0], sportMapExtent[1]])

  const dataMap = map()
  if (this.state.sportMap.data) {
    this.state.sportMap.data.forEach(d => {
      dataMap.set(d.postcode_area, +d.total_revenue)
    })
  }

  const sportMap = {
    opts: {
      currentSport: this.props.sportMapOptions.currentSport,
      selectedPolygon: this.state.sportMap.opts.selectedPolygon
    },
    const: {
      extent: sportMapExtent,
      color: scaleThreshold()
        .domain(domain.map(d => pow(parseInt(d.toFixed(0)))))
        .range(schemeGnBu[9])
    },
    polygonSelect: this.toggleSportMapSelected,
    query: this.updateSportMapData,
    data: this.state.sportMap.data,
    dataMap: dataMap,
    dateRange: this.props.sportMapOptions.dateRange,
    loaded: this.state.sportMap.loaded,
    legend: this.state.sportMap.legend,
    toggleLegend: this.toggleLegend,
    onZoom: this.props.sportMapOptions.onZoom,
    projection: this.props.sportMapOptions.projection,
    transform: this.props.sportMapOptions.transform,
    scale: this.props.sportMapOptions.scale,
    draggable: this.props.sportMapOptions.draggable
  }
  return sportMap
}
