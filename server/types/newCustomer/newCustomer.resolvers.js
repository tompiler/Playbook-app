import { NewCustomer } from './newCustomer.model'

import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const newCustomers = (_, args, ctx) => {
  const weekYearGrp =
    args.dateRangeAggLevel === 'Week'
      ? { $isoWeekYear: '$creation_date' }
      : null

  const weekGrp =
    args.dateRangeAggLevel === 'Week' ? { $isoWeek: '$creation_date' } : null

  const weekYear = args.dateRangeAggLevel === 'Week' ? '$weekYear' : null
  const week = args.dateRangeAggLevel === 'Week' ? '$week' : null
  const day = args.dateRangeAggLevel === 'Day' ? '$day' : null

  var sort = {
    idr_final_store: 1
  }

  if (args.dateRangeAggLevel === 'Month') {
    sort['year'] = 1
    sort['month'] = 1
  }

  if (args.dateRangeAggLevel === 'Week') {
    sort['weekYear'] = 1
    sort['week'] = 1
  }

  if (args.dateRangeAggLevel === 'Day') {
    sort['year'] = 1
    sort['month'] = 1
    sort['day'] = 1
  }

  const out = NewCustomer.aggregate([
    {
      $match: {
        idr_final_store: { $in: args.stores },
        creation_date: {
          $gte: args.dateStart || new Date(2017, 3, 1),
          $lte: args.dateEnd || new Date(2019, 2, 1)
        }
      }
    },
    {
      $group: {
        _id: {
          idr_final_store: '$idr_final_store',
          year: args.dateRangeAggLevel !== 'Week' ? '$year' : null,
          month: args.dateRangeAggLevel !== 'Week' ? '$month' : null,
          day: day,
          week: weekGrp,
          weekYear: weekYearGrp
        },
        idr_final_store: { $first: '$idr_final_store' },
        year: { $first: '$year' },
        month: { $first: '$month' },
        week: { $first: weekGrp },
        weekYear: { $first: weekYearGrp },
        day: { $first: '$day' },
        transaction_date: { $first: '$creation_date' },
        nb_total: { $sum: '$nb_total' },
        nb_online: { $sum: '$nb_online' },
        nb_cube_in_store: { $sum: '$nb_cube_in_store' },
        nb_adhesion_light: { $sum: '$nb_adhesion_light' }
      }
    },
    {
      $sort: sort
    },
    {
      $group: {
        _id: { idr_final_store: '$idr_final_store' },
        idr_final_store: { $first: '$idr_final_store' },
        data: {
          $push: {
            year: '$year',
            month: '$month',
            week: week,
            weekYear: weekYear,
            day: day,
            nb_total: '$nb_total',
            nb_online: '$nb_online',
            nb_cube_in_store: '$nb_cube_in_store',
            nb_adhesion_light: '$nb_adhesion_light'
          }
        }
      }
    },
    {
      $project: {
        _id: null,
        idr_final_store: '$idr_final_store',
        data: '$data'
      }
    }
  ]).exec()
  return out
}

const newCustomerDate = new GraphQLScalarType({
  name: 'newCustomerDate',
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
  Query: { newCustomers },
  newCustomerDate: newCustomerDate
}
