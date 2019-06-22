import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import merge from 'lodash.merge'
import { loadTypeSchema } from './utils/schema'
import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import config from './config'
import cors from 'cors'

import transactions from './types/transaction/transaction.resolvers'
import newCustomers from './types/newCustomer/newCustomer.resolvers'
import sportMap from './types/sportMap/sportMap.resolvers'
import crossSelling from './types/crossSelling/crossSelling.resolvers'
import customerStats from './types/customerStat/customerStat.resolvers'
import productSunburst from './types/productSunburst/productSunburst.resolvers'

import { connect } from './db'

const types = [
  'transaction',
  'newCustomer',
  'sportMap',
  'crossSelling',
  'customerStat',
  'productSunburst'
]

const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

export const start = async () => {
  const rootSchema = `
    schema {
      query: Query
    }
  `

  const schemaTypes = await Promise.all(types.map(loadTypeSchema))
  // console.log(config, schemaTypes, transactions)
  const server = new ApolloServer({
    typeDefs: [rootSchema, ...schemaTypes],
    resolvers: merge(
      {},
      transactions,
      newCustomers,
      sportMap,
      crossSelling,
      customerStats,
      productSunburst
    ),
    playground: {
      endpoint: `http://${config.server}:${config.port}/graphql`,
      settings: {
        'editor.theme': 'dark'
      }
    }
  })

  server.applyMiddleware({ app })
  app.listen({ port: config.port }, () => {
    console.log(
      `🚀 Server ready at http://${config.server}:${config.port}${server.graphqlPath}`
    )
  })
  console.log(`The server has started on port: ${config.port}`)
  console.log(`http://${config.server}:${config.port}/graphql`)
  // console.log(url)

  await connect(config.dbUrl)
  console.log(`Connected to database @ ${config.dbUrl}`)
}
