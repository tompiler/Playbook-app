import { ProductSunburst } from './productSunburst.model'

import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const productSunburst = (_, args, ctx) => {
  console.log('Product Sunburst Args:', args, ctx)

  var match = {
    idr_final_store: { $in: args.store }
  }
  var sort = { idr_final_store: 1 }

  if (args.sport) {
    match['num_univers'] = { $in: args.sport }
    sort['num_univers'] = 1
  }
  if (args.department) {
    match['dpt_num'] = { $in: args.department }
    sort['dpt_num'] = 1
  }
  if (args.subDepartment) {
    match['sdp_num'] = { $in: args.subDepartment }
    sort['sdp_num'] = 1
  }
  if (args.family) {
    match['fam_num_family'] = { $in: args.family }
    sort['fam_num_family'] = 1
  }

  const out = ProductSunburst.aggregate([
    {
      $match: match
    },
    {
      $group: {
        _id: {
          idr_final_store: '$idr_final_store',
          num_univers: args.sport ? '$num_univers' : null,
          dpt_num: args.department ? '$dpt_num' : null,
          sdp_num: args.subDepartment ? '$sdp_num' : null,
          fam_num_family: args.family ? '$fam_num_family' : null
        },
        idr_final_store: { $first: '$idr_final_store' },
        num_univers: { $first: args.sport ? '$num_univers' : null },
        dpt_num: { $first: args.department ? '$dpt_num' : null },
        sdp_num: { $first: args.subDepartment ? '$sdp_num' : null },
        fam_num_family: { $first: args.family ? '$fam_num_family' : null },
        byModel: { $first: args.family ? '$byModel' : null },
        total_items: { $sum: '$total_items' },
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
        // num_univers: { $first: args.sport ? '$num_univers' : null },
        // dpt_num: { $first: args.department ? '$dpt_num' : null },
        // sdp_num: { $first: args.subDepartment ? '$sdp_num' : null },
        // fam_num_family: { $first: args.family ? '$fam_num_family' : null },
        data: {
          $push: {
            idr_final_store: '$idr_final_store',
            num_univers: '$num_univers',
            dpt_num: '$dpt_num',
            sdp_num: '$sdp_num',
            fam_num_family: '$fam_num_family',
            byModel: '$byModel',
            total_items: '$total_items',
            total_revenue: '$total_revenue'
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

const ProductSunburstDate = new GraphQLScalarType({
  name: 'ProductSunburstDate',
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
  Query: { productSunburst },
  ProductSunburstDate: ProductSunburstDate
}

/*
db.productsunburst.aggregate([
    {
      $match: {
        idr_final_store: { $in: [33805] },
        num_univers: {$in: [5]},
        transaction_date: {
          $gte: new Date(2019, 4, 1),
          $lt: new Date(2019, 6, 1)
        }
      }
    },
    {
      $group: {
        _id: {
          idr_final_store: '$idr_final_store',
          num_univers: '$num_univers',
          dpt_num: '$dpt_num'
        },
        idr_final_store: { $first: '$idr_final_store' },
        num_univers: {$first: '$num_univers'},
        dpt_num: {$first: '$dpt_num'},
        total_items: { $sum: '$total_items' },
        total_revenue: { $sum: '$total_revenue' }
      }
    },
    {
      $sort: {
          idr_final_store: 1
      }
    },
    {
      $group: {
        _id: { idr_final_store: '$idr_final_store' },
        idr_final_store: { $first: '$idr_final_store' },
        num_univers: {$first: '$num_univers'},
        dpt_num: {$first: '$dpt_num'},
        data: {
          $push: {
            idr_final_store: '$idr_final_store',
            num_univers: '$num_univers',
            dpt_num: '$dpt_num',
            total_items: '$total_items',
            total_revenue: '$total_revenue'
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
  ])

*/
