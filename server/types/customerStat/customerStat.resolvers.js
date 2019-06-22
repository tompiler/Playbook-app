import { CustomerStat } from './customerStat.model'

const customerStats = (_, args, ctx) => {
  const out = CustomerStat.find({ idr_final_store: args.store }).exec()
  return out
}

export default {
  Query: { customerStats }
}
