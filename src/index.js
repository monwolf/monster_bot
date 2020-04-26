// var log4js = require('log4js')
const fs = require('fs')
const path = require('path')
const config = require('./config.json')
const Discord = require('discord.js')
const client = new Discord.Client()

// var logger = log4js.getLogger('server.js')
// logger.level = 'ALL'
// logger.error('This is an error')
// logger.warn('This is a warning')
// logger.info('This is in info')
// logger.warn('This is a debug')
// logger.trace('This is a trace')
var log4js = require('log4js')
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
String.prototype.toCamelCase = function (str) {
  return str
    .replace(/\s(.)/g, function ($1) { return $1.toUpperCase() })
    .replace(/\s/g, '')
    .replace(/^(.)/, function ($1) { return $1.toLowerCase() })
}

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
      commands[cmd].execute(msg, msg.content.slice(config.prefix.length).trim())
    } else {
      commands.help.execute(msg, commands)
    }
  }
})
client.login(config.token)
