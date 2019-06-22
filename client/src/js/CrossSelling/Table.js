import React from 'react'

import ReactTable from 'react-table'
import 'react-table/react-table.css'
import '/css/CrossSelling.css'

class Table extends React.Component {
  constructor(props) {
    super(props)

    this.fetchData = this.fetchData.bind(this)
    this.updateData = this.updateData.bind(this)
    this.onInputKeyDown = this.onInputKeyDown.bind(this)
  }

  componentDidMount() {
    // console.log('Container Mounted')
    this.updateData()
  }

  updateData() {
    this.props.crossSelling.query()
  }

  fetchData(state, instance) {
    // console.log(state, instance)
    this.props.crossSelling.onFetch(state, instance)
  }

  customFilterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id
    return row[id] !== undefined
      ? String(row[id].toLowerCase()).includes(filter.value)
      : true
  }

  onInputKeyDown = (event, onChange) => {
    if (
      event.keyCode === 8 ||
      event.which === 8 ||
      event.keyCode === 46 ||
      event.which === 46
    ) {
      if (event.target.value.length === 1) {
        onChange('')
      }
    }
    if (event.keyCode === 13 || event.which === 13) {
      onChange(event.target.value)
    }
  }

  customFilterName = ({ filter, onChange }) => {
    return (
      <input
        onKeyDown={event => this.onInputKeyDown(event, onChange)}
        style={{ width: this.props.width * 0.15 }}
      />
    )
  }

  customFilterModel = ({ filter, onChange }) => {
    return (
      <input
        onKeyDown={event => this.onInputKeyDown(event, onChange)}
        style={{ width: this.props.width * 0.06 }}
      />
    )
  }

  render() {
    const columns = [
      {
        Header: (
          <span className="crossselling-header-group">Reference Model</span>
        ),
        columns: [
          {
            Header: <span className="crossselling-header-name">Model</span>,
            accessor: 'mdl_num_modele_r3_reference',
            width: this.props.width * 0.08,
            filterMethod: this.customFilterMethod,
            Filter: this.customFilterModel,
            style: { fontSize: window.innerWidth < 690 ? 6 : 12 }
          },
          {
            Header: <span className="crossselling-header-name">Name</span>,
            accessor: 'name_model_reference',
            width: this.props.width * 0.17,
            filterMethod: this.customFilterMethod,
            Filter: this.customFilterName,
            style: {
              whiteSpace: 'unset',
              borderRight: 'dashed 1px #a6a6a6',
              fontSize: window.innerWidth < 690 ? 6 : 12
            },
            fontSize: 3
          }
        ]
      },
      {
        Header: (
          <span className="crossselling-header-group">
            Complementary Product 1
          </span>
        ),
        columns: [
          {
            Header: <span className="crossselling-header-name">Model</span>,
            accessor: 'mdl_num_modele_r3_associe1',
            width: this.props.width * 0.08,
            filterMethod: this.customFilterMethod,
            Filter: this.customFilterModel,
            style: { fontSize: window.innerWidth < 690 ? 6 : 12 }
          },
          {
            Header: <span className="crossselling-header-name">Name</span>,
            accessor: 'name_model_associe1',
            width: this.props.width * 0.17,
            filterMethod: this.customFilterMethod,
            Filter: this.customFilterName,
            style: {
              whiteSpace: 'unset',
              borderRight: 'dashed 1px #a6a6a6',
              fontSize: window.innerWidth < 690 ? 6 : 12
            }
          }
        ]
      },
      {
        Header: (
          <span className="crossselling-header-group">
            Complementary Product 2
          </span>
        ),
        columns: [
          {
            Header: <span className="crossselling-header-name">Model</span>,
            accessor: 'mdl_num_modele_r3_associe2',
            width: this.props.width * 0.08,
            filterMethod: this.customFilterMethod,
            Filter: this.customFilterModel,
            style: { fontSize: window.innerWidth < 690 ? 6 : 12 }
          },
          {
            Header: <span className="crossselling-header-name">Name</span>,
            accessor: 'name_model_associe2',
            width: this.props.width * 0.17,
            filterMethod: this.customFilterMethod,
            Filter: this.customFilterName,
            style: {
              whiteSpace: 'unset',
              borderRight: 'dashed 1px #a6a6a6',
              fontSize: window.innerWidth < 690 ? 6 : 12
            }
          }
        ]
      },
      {
        Header: (
          <span className="crossselling-header-group">
            Complementary Product 3
          </span>
        ),
        columns: [
          {
            Header: <span className="crossselling-header-name">Model</span>,
            accessor: 'mdl_num_modele_r3_associe3',
            width: this.props.width * 0.08,
            filterMethod: this.customFilterMethod,
            Filter: this.customFilterModel,
            style: { fontSize: window.innerWidth < 690 ? 6 : 12 }
          },
          {
            Header: <span className="crossselling-header-name">Name</span>,
            accessor: 'name_model_associe3',
            width: this.props.width * 0.17,
            filterMethod: this.customFilterMethod,
            Filter: this.customFilterName,
            style: {
              whiteSpace: 'unset',
              borderRight: 'dashed 1px #a6a6a6',
              fontSize: window.innerWidth < 690 ? 6 : 12
            }
          }
        ]
      }
    ]

    return (
      <ReactTable
        data={this.props.crossSelling.data}
        columns={columns}
        defaultPageSize={this.props.crossSelling.limit}
        pages={Math.ceil(
          this.props.crossSelling.total / this.props.crossSelling.limit
        )}
        className="-striped -highlight"
        filterable
        manual
        onFetchData={this.fetchData}
        defaultFilterMethod={this.filterCaseInsensitive}
        style={{ height: this.props.height }}
        getProps={(state, rowInfo, column, instance) => {
          return {
            onClick: () => {
              this.props.onTableClick(this.props.item)
            }
          }
        }}
      />
    )
  }
}

export default Table
