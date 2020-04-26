const mongoose = require('mongoose')

const name = 'Trial'
var trialSchema = new mongoose.Schema({
  user_id: String,
  trial_msg_id: Number,
  date: Date,
  // "time": Date,
  trial_name: String,
  fixed: String,
  qty_tank: Number,
  qty_healer: Number,
  qty_dd_ranged: Number,
  qty_dd_melee: Number
})

var Trial = mongoose.model(name, trialSchema)

module.exports = {
  name: name,
  Schema: trialSchema,
  Model: Trial
}
