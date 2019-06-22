import { SportMap } from './sportMap.model'

import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const sportMap = (_, args, ctx) => {
  // console.log('Sport Map Args:', args, ctx)
  const out = SportMap.aggregate([
    {
      $match: {
        num_univers: args.sport,
        transaction_date: {
          $gte: args.dateStart || new Date(2018, 3, 1),
          $lte: args.dateEnd || new Date(2018, 5, 1)
        }
      }
    },
    {
      $group: {
        _id: {
          num_univers: '$num_univers',
          postcode_area: '$postcode_area'
        },
        num_univers: { $first: '$num_univers' },
        postcode_area: { $first: '$postcode_area' },
        year: { $first: '$year' },
        month: { $first: '$month' },
        total_revenue: { $sum: '$total_revenue' }
      }
    },
    {
      $sort: {
        postcode_area: 1
      }
    },
    {
      $group: {
        _id: { num_univers: '$num_univers' },
        data: {
          $push: {
            postcode_area: '$postcode_area',
            total_revenue: '$total_revenue'
          }
        }
      }
    },
    {
      $project: {
        _id: null,
        data: '$data'
      }
    }
  ]).exec()
  return out
}

const sportMapDate = new GraphQLScalarType({
  name: 'sportMapDate',
  description: 'Date custom scalar type',
  parseValue(value) {
    return new Date(value)
  },
  serialize(value) {
    return value.getTime()
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value)
    }
    return null
  }
})

export default {
  Query: { sportMap },
  sportMapDate: sportMapDate
}
