
const fetch = require('node-fetch')
const express = require('express')
const app = express()

const getGuilds = async function (token) {
  const response = await fetch('https://discordapp.com/api/v6/users/@me/guilds',
    { headers: { Authorization: `Bearer ${token}` } })
  const guilds = await response.json()
  return guilds
}

app.get('/guilds', (req, res) => {
  getGuilds(req.query.token)
    .then(guilds => res.json(guilds))
})

const init = function (conf) {}

module.exports = { app: app, init: init }
