'use strict'
const mongoose = require('mongoose')

const name = 'Trial'
var trialSchema = new mongoose.Schema({
  user_id: Number,
  trial_msg_id: Number,
  date: { type: Date, required: true },
  trial_name: String,
  fixed: String,
  qty_tank: Number,
  qty_healer: Number,
  qty_dd_ranged: Number,
  qty_dd_melee: Number,
  guild_id: { type: Number, required: true },
  channel_id: { type: Number, required: true },
  roles: {
    'dd-ranged': [],
    'dd-melee': [],
    healer: [],
    tank: [],
    suplente: []
  }
})

var Trial = mongoose.model(name, trialSchema)

async function upsert (trial) {
  var qresult = await Trial.find({ date: trial.date, guild_id: trial.guild_id, channel_id: trial.channel_id }).exec()
  if (qresult.length > 0) {
    const id = qresult[0]._id
    await Trial.updateOne({ _id: id }, trial, { upsert: true })
    return id
  } else {
    const obj = await new Trial(trial).save()
    return obj._id
  }
}

module.exports = {
  name: name,
  upsert: upsert,
  Schema: trialSchema,
  Model: Trial
}
