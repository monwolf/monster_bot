
const express = require('express')
const app = express()
const DiscordApi = require('../discord-api')

app.get('/api/v1/guilds', (req, res) => {
  const api = new DiscordApi(req.query.token)
  api.getGuilds()
    .then(guilds => res.json(guilds))
})

app.get('/guild/:id', (req, res) => {
  const api = new DiscordApi(req.query.token)
  api.getGuilds()
    .then(guilds => res.json(guilds))
})


const init = function (conf) { }

module.exports = { app: app, init: init }
