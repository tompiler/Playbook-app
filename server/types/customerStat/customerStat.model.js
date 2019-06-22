import mongoose from 'mongoose'
mongoose.pluralize(null)

var customerStatSchema = new mongoose.Schema(
  {
    idr_final_store: Number,
    under_25: Number,
    btw_25_35: Number,
    btw_35_45: Number,
    btw_45_55: Number,
    over_55: Number,
    homme: Number,
    femme: Number,
    nb_users: Number,
    nb_new: Number,
    nb_active: Number
  },
  { timestamps: true }
)

export const CustomerStat = mongoose.model('customerstats', customerStatSchema)
