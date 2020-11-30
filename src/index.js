'use strict'
const fs = require('fs')
const path = require('path')
const config = require('./config.json')
const utils = require('./helpers/utils.js')
const Discord = require('discord.js')
const DiscordWrapper = require('./services/discord')
const client = new Discord.Client()
var log4js = require('log4js')

const http = require('./services/http')
log4js.configure({
  appenders: { monster_bot: { type: 'stdout' } },
  categories: {
    monster_bot: { appenders: ['monster_bot'], level: 'info' },
    default: { appenders: ['monster_bot'], level: 'info' }
  }
})

var logger = log4js.getLogger('monster_bot')
const commands = []

// eslint-disable-next-line no-extend-native
String.prototype.toCamelCase = utils.toCamelCase

fs.readdirSync(path.join(__dirname, '/commands/'))
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    const cmd = require('./commands/' + file)
    commands[cmd.command] = cmd
  })

// eslint-disable-next-line no-unused-vars
var botId = null

client.on('ready', () => {
  botId = client.user.bot_id
  logger.info(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
  if (msg.content.startsWith(config.prefix)) {
    var cmd = msg.content.slice(config.prefix.length).trim().split(/ +/)[0]
    if (cmd in commands && cmd !== 'help') {
      logger.debug('Executed command ' + cmd)
      commands[cmd].execute(new DiscordWrapper(msg), msg.content.slice(config.prefix.length).trim())
    } else {
      commands.help.execute(new DiscordWrapper(msg), commands)
    }
  }
})

client.login(config.token)

http.init(config, client)
