var logger = require('log4js').getLogger('monster_bot')
const utils = require('../utils.js')

const PERMITTED_ROLES = ['trial-leader', 'administrador', 'administrator', 'moderador', 'moderator', 'trial leader']

// const permitted_roles = ["fuu"]
// manage create <tipo trial> <date> <time> <trial_name> no-fixed-dd-type|fixed-dd-type 2t 2h 2dd-ranged 6dd-melee
// manage create <tipo trial>
const RE_DATE = /^\d{2}\/\d{2}\/\d{4}$/
const RE_TIME = /^\d{2}:\d{2}$/
const RE_TRIAL_NAME = /^(n|v)[A-Z]{2,3}(\+\d)?$/
const RE_FIXED_DD = /^(no-fixed-dd-type|fixed-dd-type)$/

const RE_QTY_TANK = /^\dt$/
const RE_QTY_HEALER = /^\dh$/
const RE_QTY_DD_RANGED = /^\ddd-ranged$/
const RE_QTY_MELEE = /^\ddd-melee$/

function removeBotMessages (channel) {
  channel.messages.fetch({ limit: 50 }).then(messages => {
    for (const item of messages) {
      const message = item[1]
      if (message.author.bot) {
        message.delete()
        logger.info('deleted message:' + message.content)
      }
    }
  }).catch(console.error)
}

function renderTrialMessage (args) {
  return `Atencion @everyone, <@${args.user_id}> convoca una trial
    Dia ${args.date} a las ${args.time}: (${args.trial_name})
    ${args.fixed_dd === 'no-fixed-dd' ? 'Roles para participantes (dd pueden variar)' : 'Roles para participantes (limite dd por tipo)'}
    :tank: ${args.qty_tank}
    :healer: ${args.qty_healer}
    :DD: ranged: ${args.qty_dd_ranged}
    :DD: melee: ${args.qty_dd_melee}
    :detective_tone1: 
    ### INFO BOT ###
    ||${JSON.stringify({ message_type: 'trial', value: args })}||
    `
}

function execute (msg, command) {
  if (!msg.member.roles.cache.some(role => PERMITTED_ROLES.indexOf(role.name.toLowerCase()) >= 0)) {
    msg.reply('No puedes pasaaar!', { files: ['https://media.giphy.com/media/P726XW1pK3Luo/giphy.gif'] })
    return
  }
  command = command.slice('manage'.length).trim()

  if (command.startsWith('create')) {
    const args = command.slice('create'.length).trim().split(/ +/)
    const channelName = 'trial-' + args[0]
    const channel = msg.guild.channels.cache.find(channel =>
      channel.name === channelName
    )
    if (!channel) {
      msg.reply('Lo sentimos, no hay ' + channelName + ' disponible')
      return
    }
    var date = args[1]
    if (typeof date === 'undefined' || !date.match(RE_DATE)) {
      msg.reply('Fecha Incorrecta')
      return
    }
    var time = args[2]
    if (typeof time === 'undefined' || !time.match(RE_TIME)) {
      msg.reply('Hora Incorrecta')
      return
    }
    var trialName = args[3]
    if (typeof trialName === 'undefined' || !trialName.match(RE_TRIAL_NAME)) {
      msg.reply('Nombre de la trial incorrecto')
      return
    }
    var fixedDamageDealer = args[4]
    if (typeof fixedDamageDealer === 'undefined' || !fixedDamageDealer.match(RE_FIXED_DD)) {
      msg.reply('Necesito saber si los dd ranged y los melee son intercambiables')
      return
    }

    var qty_tank = args[5]
    if (typeof qty_tank === 'undefined' || !qty_tank.match(RE_QTY_TANK)) {
      msg.reply('Cantidad de tanks incorrecta')
      return
    }
    qty_tank = parseInt(qty_tank[0])

    var qty_healer = args[6]
    if (typeof qty_healer === 'undefined' || !qty_healer.match(RE_QTY_HEALER)) {
      msg.reply('Cantidad de healers incorrecta')
      return
    }
    qty_healer = parseInt(qty_healer[0])

    var qty_dd_ranged = args[7]
    if (typeof qty_dd_ranged === 'undefined' || !qty_dd_ranged.match(RE_QTY_DD_RANGED)) {
      msg.reply('Cantidad de dd ranged incorrecta')
      return
    }
    qty_dd_ranged = parseInt(qty_dd_ranged[0])

    var qty_dd_melee = args[8]
    if (typeof qty_dd_melee === 'undefined' || !qty_dd_melee.match(RE_QTY_MELEE)) {
      msg.reply('Cantidad de dd melee incorrecta')
      return
    }
    qty_dd_melee = parseInt(qty_dd_melee[0])

    if (qty_tank + qty_dd_melee + qty_dd_ranged + qty_healer != 12) {
      msg.reply('La suma de participantes debe ser 12')
      return
    }
    removeBotMessages(channel)

    channel.send(renderTrialMessage({
      user_id: msg.author.id,
      date: date,
      time: time,
      trial_name: trialName,
      fixed: fixedDamageDealer,
      qty_tank: qty_tank,
      qty_healer: qty_healer,
      qty_dd_ranged: qty_dd_ranged,
      qty_dd_melee: qty_dd_melee
    }))
  } else if (command.startsWith('remove')) {
    const args = command.slice('remove'.length).trim().split('/ +/')
    const channelName = 'trial-' + args[0]
    const channel = msg.guild.channels.cache.find(channel =>
      channel.name === channelName
    )
    if (!channel) {
      msg.reply('Lo sentimos, no hay ' + channelName + ' disponible')
      return
    }
    removeBotMessages(channel)
    msg.reply('Eliminada trial')
  }
}

async function getTrialParams (channel) {
  const messages = await channel.messages.fetch({ limit: 50 })
  let trialData = {}
  for (const item of messages) {
    const message = item[1]
    if (message.author.bot) {
      const metadata = utils.extract_metadata(message.content)
      if (metadata.message_type === 'trial') {
        trialData = metadata
      }
    }
  }
  return trialData
}

module.exports = {
  command: 'manage',
  execute: execute,
  help: `***!trial manage create|remove <tipo trial> <date> <time> <trial_name> no-fixed-dd-type|fixed-dd-type <x>t <x>h <x>dd-ranged <x>dd-melee ***: Genera un mensaje predefinido para una trial.
    -->Ejemplo: *!trial manage create jueves-progresion 10/11/2020 20:00 vAA fixed-dd-type 2t 2h 2dd-ranged 6dd-melee*`,
  getTrialParams: getTrialParams
}
