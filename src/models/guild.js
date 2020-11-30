'use strict'
const mongoose = require('mongoose')

const name = 'Guild'
var guildSchema = new mongoose.Schema({
  guild_id: { type: Number, required: true },
  guild_name: { type: String, required: true },
  admin_roles: []
})

var Guild = mongoose.model(name, guildSchema)

async function upsert (guild) {
  var qresult = await Guild.find({ guild_id: guild.guild_id }).exec()
  if (qresult.length > 0) {
    const id = qresult[0]._id
    await Guild.updateOne({ _id: id }, guild, { upsert: true })
    return id
  } else {
    const obj = await new Guild(guild).save()
    return obj._id
  }
}

module.exports = {
  name: name,
  upsert: upsert,
  Schema: guildSchema,
  Model: Guild
}
