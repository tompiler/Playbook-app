import React from 'react'

import '/css/Button.css'

const TYPES = {
  PRIMARY: '.primary',
  WARNING: '.warning',
  DANGER: '.danger',
  SUCCESS: '.success'
}

export const SIZES = {
  SMALL: '.small',
  MEDIUM: '.medium',
  LARGE: '.large'
}

const BaseButton = props => (
  <button
    type={props.type}
    onClick={props.onClick}
    className={props.className}
    value={props.value}
  >
    {props.mouseDate && (
      <p
        style={{
          position: 'fixed',
          left: 5,
          verticalAlign: 'middle',
          fontWeight: '500',
          lineHeight: '1.8em',
          fontSize: 1.3 - Math.min(0.3, 100 / props.width) + 'rem',
          fontFamily: props.fontFamily
            ? props.fontFamily
            : 'Open Sans, sans serif',
          fontWeight: props.fontWeight ? props.fontWeight : 400
        }}
        className={props.className + '-date'}
      >
        {props.mouseDate ? 'Date:' + props.mouseDate : null}
      </p>
    )}
    {props.dateRange && (
      <p
        style={{
          position: 'fixed',
          left: 10,
          verticalAlign: 'middle',
          lineHeight: '1.8em',
          fontSize: 1.3 - Math.min(0.3, 100 / props.width) + 'rem',
          fontFamily: props.fontFamily
            ? props.fontFamily
            : 'Open Sans, sans serif',
          fontWeight: props.fontWeight ? props.fontWeight : 400
        }}
        className={props.className + '-dateRange'}
      >
        {props.dateRange[0] + ' : ' + props.dateRange[1]}
      </p>
    )}
    {props.currentSport && (
      <p
        style={{
          position: 'fixed',
          right: 10,
          verticalAlign: 'middle',
          lineHeight: '1.8em',
          fontSize: 1.3 - Math.min(0.3, 100 / props.width) + 'rem',
          fontFamily: props.fontFamily
            ? props.fontFamily
            : 'Open Sans, sans serif',
          fontWeight: props.fontWeight ? props.fontWeight : 400
        }}
        className={props.className + '-currentSport'}
      >
        {props.currentSport}
      </p>
    )}
    <p
      style={{
        display: 'inline-block',
        textAlign: 'center',
        verticalAlign: 'middle',
        overflow: 'hidden',
        fontFamily: props.fontFamily
          ? props.fontFamily
          : 'Open Sans, sans serif',
        fontWeight: props.fontWeight ? props.fontWeight : 400,
        width: props.width
      }}
    >
      {props.text}
    </p>
  </button>
)

export const Primary = props => (
  <BaseButton {...props} buttonType={TYPES.PRIMARY} />
)
