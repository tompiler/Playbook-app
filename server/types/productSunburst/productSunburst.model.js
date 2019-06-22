import mongoose from 'mongoose'
mongoose.pluralize(null)

var productSunburstSchemaData = new mongoose.Schema(
  {
    idr_final_store: Number,
    num_univers: Number,
    dpt_num: Number,
    sdp_num: Number,
    fam_num_family: Number,
    total_items: Number,
    total_revenue: Number
  },
  { timestamps: true }
)

export const productSunburstSchema = new mongoose.Schema(
  {
    idr_final_store: Number,
    data: [productSunburstSchemaData]
  },
  { timestamps: true }
)

export const ProductSunburst = mongoose.model(
  'productsunburst',
  productSunburstSchema
)
