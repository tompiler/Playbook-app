import mongoose from 'mongoose'

var transactionSchemaData = new mongoose.Schema(
  {
    year: Number,
    month: Number,
    day: Number,
    total_transactions: Number,
    total_revenue: Number,
    avgBasket: Number
  },
  { timestamps: true }
)

export const transactionSchema = new mongoose.Schema(
  {
    idr_final_store: Number,
    data: [transactionSchemaData]
  },
  { timestamps: true }
)

// remember mongoose pluralises AND lowercases the first argument of mongoose.Model
// and uses whatever this is as a table name to query
export const Transaction = mongoose.model('transaction', transactionSchema)
