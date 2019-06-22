import mongoose from 'mongoose'

var newCustomerSchemaData = new mongoose.Schema(
  {
    year: Number,
    month: Number,
    day: Number,
    nb_total: Number,
    nb_online: Number,
    nb_cube_in_store: Number,
    nb_adhesion_light: Number
  },
  { timestamps: true }
)

export const newCustomerSchema = new mongoose.Schema(
  {
    idr_final_store: Number,
    data: [newCustomerSchemaData]
  },
  { timestamps: true }
)

export const NewCustomer = mongoose.model('newCustomer', newCustomerSchema)
