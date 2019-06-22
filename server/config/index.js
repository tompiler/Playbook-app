import merge from 'lodash.merge'

const env = process.env.NODE_ENV || 'development'

const baseConfig = {
  env,
  isDev: env === 'development',
  server: 'localhost',
  port: 3001,
  secrets: {
    jwt: process.env.JWT_SECRET,
    jwtExp: '100d'
  }
}

let envConfig = {}
console.log('NODE_ENV -->', env)
switch (env) {
  case 'production':
    envConfig = require('./prod').config
    break
  case 'development':
    envConfig = require('./dev').config
    break
  default:
    envConfig = require('./dev').config
}

export default merge(baseConfig, envConfig)
