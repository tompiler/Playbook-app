import React from 'react'

const Title = props => {
  return (
    <div
      style={{
        width: '100%',
        height: props.titleHeight,
        display: 'table',
        textAlign: 'center',
        verticalAlign: 'middle',
        fontSize: props.fontSize || 22,
        fontFamily: 'Open Sans, sans-serif',
        fontWeight: 300,
        background: 'rgba(0,0,0,0)'
      }}
    >
      <p
        style={{
          display: 'table-cell',
          verticalAlign: 'middle',
          background: 'rgba(0,0,0,0)'
        }}
      >
        {props.title}
      </p>
    </div>
  )
}

export default Title
