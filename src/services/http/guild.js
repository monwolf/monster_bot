
var log4js = require('log4js').getLogger('monster_bot')
const models = require('../../models/index.js').models

const express = require('express')
const app = express()
const DiscordApi = require('../discord-api')

var _bot = null

var getAllowedGuilds = async function (api) {
  const userGuilds = await api.getGuilds()
  const botGuilds = _bot.guilds.cache.map(guild => guild.id)
  return userGuilds.filter(guild => botGuilds.indexOf(guild.id) !== -1)
}

var getGuild = async function (api, id) {
  var guilds = _bot.guilds.cache.map(guild => guild.id)
  var g = {}
  if (guilds.indexOf(id) !== -1) {
    var guild = _bot.guilds.cache.get(id)
    await models.Guild.upsert({ guild_id: guild.id, guild_name: guild.name })
    g = await models.Guild.Model.find({ guild_id: id }).exec()
  }
  return g
}

app.get('/api/v1/guilds', (req, res) => {
  const api = new DiscordApi(req.query.token)
  getAllowedGuilds(api)
    .then(guilds => res.json(guilds))
})

app.get('/guild/:id', (req, res) => {
  const api = new DiscordApi(req.query.token)
  getGuild(api, req.params.id)
    .then(guild => res.json(guild))
  /*getAllowedGuilds(api)
    .then(guilds => res.json(guilds))*/
})

const init = function (conf, bot) {
  _bot = bot
}

module.exports = { app: app, init: init }
