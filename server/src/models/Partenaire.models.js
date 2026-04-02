const mongoose = require('mongoose');

const PartenaireSchema = new mongoose.Schema({
  nom:          { type:String, required:true, trim:true },
  type:         { type:String, required:true, trim:true },
  contribution: { type:String, required:true            },
  badge:        { type:String, default:''               },
  icone:        { type:String, default:'🏛️'            },
  logoUrl:      { type:String, default:''               },
  actif:        { type:Boolean, default:true            },
  ordre:        { type:Number, default:0                },
}, { timestamps:true });

module.exports = mongoose.model('Partenaire', PartenaireSchema);