var logger = require('log4js').getLogger('monster_bot')

const RE_TRIAL_COMMAND = /^role\s+(add|remove)\s+([a-zA-Z0-9\-_]+)\s+(dd-melee|dd-ranged|healer|tank|suplente)/
// const re_check_msg_roles = /^dd\-ranged:([a-zA-Z0-9\-\_\s]{0,})\ndd\-melee:([a-zA-Z0-9\-\_\s]{0,})\nhealer:([a-zA-Z0-9\-\_\s]{0,})\ntank:([a-zA-Z0-9\-\_\s]{0,})\nsuplente:([a-zA-Z0-9\-\_\s]{0,})$/m
const trialManager = require('./trial-manager')

const utils = require('../utils.js')

function parseRoles (content) {
  let result = utils.extract_metadata(content)
  if (Object.keys(result).length === 0) {
    result = { 'dd-ranged': [], 'dd-melee': [], healer: [], tank: [], suplente: [] }
  } else {
    result = result.value
  }
  return result
}
function renderRolesMessage (roles) {
  return `
\`\`\`diff
- ROLES
\`\`\`
**dd-ranged**: ${roles['dd-ranged'].join(', ')}
**dd-melee**: ${roles['dd-melee'].join(', ')}
**healer**: ${roles.healer.join(', ')}
**tank**: ${roles.tank.join(', ')}
**suplente**: ${roles.suplente.join(', ')}
### INFO BOT ###
||${JSON.stringify({ message_type: 'role', value: roles })}||
`
}
function isUserInRoleList (roles, username) {
  for (const prop in roles) {
    if (roles[prop].indexOf(username) >= 0) { return true }
  }

  return false
}

async function execute (msg, command) {
  var matches = command.match(RE_TRIAL_COMMAND)
  if (!matches) {
    msg.reply('Hay un error en el comando, revisa la sintaxi')
    return
  }

  const event = 'trial'
  const action = matches[1]
  const channelName = event + '-' + matches[2]
  const role = matches[3]

  const channel = msg.guild.channels.cache.find(channel =>
    channel.name === channelName
  )
  if (!channel) {
    msg.reply('Lo sentimos, no hay ' + event + ' disponible')
    return
  }

  const trial = await trialManager.get_trial_params(channel)

  if (typeof trial === 'undefined' | Object.keys(trial).length === 0) {
    msg.reply('Lo sentimos, no hay ' + event + ' disponible')
    return
  }

  const messages = await channel.messages.fetch({ limit: 50 })
  let lastRoleMessage = null
  for (const item of messages) {
    const message = item[1]
    if (message.author.bot && utils.extract_metadata(message.content).message_type === 'role') {
      lastRoleMessage = message
      message.delete()
      logger.info('deleted message:' + message.content)
    }
  }

  const roles = parseRoles(lastRoleMessage !== null ? lastRoleMessage.content : '')

  switch (action) {
    case 'add':
      if (isUserInRoleList(roles, msg.author.username)) {
        msg.reply('Ya estabas registrado en la trial, eliminate del role anterior')
      } else if (role.startsWith('dd') && trial.value.fixed === 'no-fixed-dd-type') {
        // Da igual el tipo de dd se necesita rellenar
        const maxDamageDealer = 12 - parseInt(trial.value.qty_tank) - parseInt(trial.value.qty_healer)
        if (maxDamageDealer > roles['dd-melee'].length + roles['dd-ranged'].length) {
          roles[role].push(msg.author.username)
        } else {
          msg.reply('No hay más espacio para tu role en la trial')
        }
      } else if (parseInt(trial.value['qty_' + role.replace('-', '_')]) > roles[role].length) {
        roles[role].push(msg.author.username)
      } else {
        msg.reply('No hay más espacio para tu role en la trial')
      }
      break
    case 'remove':
      if (isUserInRoleList(roles, msg.author.username)) {
        for (var i of Object.keys(roles)) {
          roles[i] = roles[i].filter(item => item !== msg.author.username)
        }
      } else {
        msg.reply('No estabas registrado en la trial')
      }
      break
    default:
      msg.reply('Lo siento, no tengo este comando implementado')
      break
  }
  channel.send(renderRolesMessage(roles))
}

module.exports = {
  command: 'role',
  help: `***!trial role add|remove <tipo trial> dd-ranged|dd-melee|healer|tank|suplente***: Gestiona los usuarios de una trial.
    -->Ejemplo: *!trial role add jueves-progresion healer*`,
  execute: execute
}
