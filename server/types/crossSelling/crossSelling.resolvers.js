import { CrossSelling } from './crossSelling.model'

const crossSelling = (_, args, ctx) => {
  console.log('Cross Selling Args:', args, ctx)

  // const out = CrossSelling.paginate({
  //   univ_num_reference: args.sports
  // })
  //   .skip(args.skip)
  //   .limit(args.limit)
  //   .exec()

  var sort = []
  if (args.sortedVar) {
    args.sortedVar.forEach((d, i) => {
      sort.push([d, args.sortedDirection[i]])
    })
  }

  var query = {}
  query['univ_num_reference'] = args.sports[0]

  if (args.filteredVar) {
    args.filteredVar.forEach((d, i) => {
      query[d] = { $regex: args.filteredValue[i], $options: 'i' }
    })
  }

  console.log(query, sort)

  const out = CrossSelling.paginate(query, {
    offset: args.skip,
    limit: args.limit,
    sort: sort
  })

  return out
}

export default {
  Query: { crossSelling }
}
