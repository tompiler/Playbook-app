import mongoose from 'mongoose'
mongoose.pluralize(null)

var sportMapSchemaData = new mongoose.Schema(
  {
    postcode_area: String,
    total_revenue: Number
  },
  { timestamps: true }
)

export const sportMapSchema = new mongoose.Schema(
  {
    data: [sportMapSchemaData]
  },
  { timestamps: true }
)

export const SportMap = mongoose.model('sportmap', sportMapSchema)
