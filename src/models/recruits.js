'use strict'
const mongoose = require('mongoose')

const name = 'Recruit'
var recruitSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  user_name: { type: String, required: true },
  guild_id: { type: Number, required: true },
  max_dps: Number,
  pending_dps: Number,
  approver: { type: Number, required: false }
})

var Recruit = mongoose.model(name, recruitSchema)

async function upsert (recruit) {
  var qresult = await Recruit.find({ user_id: recruit.user_id, guild_id: recruit.guild_id }).exec()
  if (qresult.length > 0) {
    const id = qresult[0]._id
    await Recruit.updateOne({ _id: id }, recruit, { upsert: true })
    return id
  } else {
    const obj = await new Recruit(recruit).save()
    return obj._id
  }
}

module.exports = {
  name: name,
  upsert: upsert,
  Schema: recruitSchema,
  Model: Recruit
}
