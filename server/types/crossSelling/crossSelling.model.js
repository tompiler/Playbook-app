import mongoose from 'mongoose'
import paginate from 'mongoose-paginate'

mongoose.pluralize(null)

export const crossSellingSchema = new mongoose.Schema(
  {
    mdl_num_modele_r3_reference: String,
    name_model_reference: String,
    univ_num_reference: Number,
    mdl_num_modele_r3_associe1: String,
    name_model_associe1: String,
    univ_num_associe1: Number,
    mdl_num_modele_r3_associe2: String,
    name_model_associe2: String,
    univ_num_associe2: Number,
    mdl_num_modele_r3_associe3: String,
    name_model_associe3: String,
    univ_num_associe3: Number,
    lien_media: String
  },
  { timestamps: true }
)

crossSellingSchema.plugin(paginate)

export const CrossSelling = mongoose.model('crossselling', crossSellingSchema)
