var log4js = require('log4js').getLogger('monster_bot')
const fetch = require('node-fetch')

class DiscordApi {
  token = null

  constructor (token, logger = null) {
    if (!logger) { this.logger = log4js }
    this.token = token
  }

  getGuilds = async function () {
    const response = await fetch('https://discordapp.com/api/v6/users/@me/guilds',
      { headers: { Authorization: `Bearer ${this.token}` } })
    const guilds = await response.json()
    return guilds
  }
}

module.exports = DiscordApi
