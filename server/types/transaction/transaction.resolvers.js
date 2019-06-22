import { Transaction } from './transaction.model'

import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const transactions = (_, args, ctx) => {
  // console.log('Transaction Args:', args, ctx)

  const weekYearGrp =
    args.dateRangeAggLevel === 'Week'
      ? { $isoWeekYear: '$transaction_date' }
      : null

  const weekGrp =
    args.dateRangeAggLevel === 'Week' ? { $isoWeek: '$transaction_date' } : null

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

  if (args.sports.length > 0) {
    const out = Transaction.aggregate([
      { $unwind: '$bySport' },
      {
        $match: {
          idr_final_store: { $in: args.stores },
          channel_name: {
            $in: args.channels.length > 0 ? args.channels : [0, 1, 2, 3, 4, 5]
          },
          identified: {
            $in: args.identified.length > 0 ? args.identified : [0, 1]
          },
          'bySport.num_univers': { $in: args.sports },
          transaction_date: {
            $gte: args.dateStart || new Date(2019, 1, 1),
            $lt: args.dateEnd || new Date(2019, 4, 1)
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
          transaction_date: { $first: '$transaction_date' },
          num_univers: { $first: '$bySport.num_univers' },
          total_transactions_sport: {
            $sum: '$bySport.total_parent_transactions'
          },
          total_revenue_sport: { $sum: '$bySport.total_revenue' }
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
              total_transactions: '$total_transactions_sport',
              total_revenue: '$total_revenue_sport',
              avgBasket: {
                $divide: ['$total_revenue_sport', '$total_transactions_sport']
              }
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
  } else {
    const out = Transaction.aggregate([
      {
        $match: {
          idr_final_store: { $in: args.stores },
          channel_name: {
            $in:
              args.channels.length > 0 ? args.channels : [0, 1, 2, 3, 4, 5, 6]
          },
          identified: {
            $in: args.identified.length > 0 ? args.identified : [0, 1]
          },
          transaction_date: {
            $gte: args.dateStart || new Date(2019, 1, 1),
            $lt: args.dateEnd || new Date(2019, 4, 1)
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
          transaction_date: { $first: '$transaction_date' },
          total_transactions: { $sum: '$total_transactions' },
          total_revenue: { $sum: '$total_revenue' }
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
              total_transactions: '$total_transactions',
              total_revenue: '$total_revenue',
              avgBasket: { $divide: ['$total_revenue', '$total_transactions'] }
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
}

const TransactionDate = new GraphQLScalarType({
  name: 'TransactionDate',
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
  Query: { transactions },
  TransactionDate: TransactionDate
}
