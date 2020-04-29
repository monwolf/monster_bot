// var logger = require('log4js').getLogger('monster_bot')
const utils = require('../helpers/utils.js')

const RE_ROLE_COMMAND = /^role\s+(add|remove)\s+([a-zA-Z0-9\-_]+)\s+(dd-melee|dd-ranged|healer|tank|suplente)/
const trialManager = require('./trial-manager')

function parseRoles (diswrp, content) {
  let result = diswrp.extractMetadata(content)
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

async function execute (diswrp, command) {
  var matches = command.match(RE_ROLE_COMMAND)
  if (!matches) {
    diswrp.send('Hay un error en el comando, revisa la sintaxi', { isReply: true })
    return
  }

  const event = 'trial'
  const action = matches[1]
  const channelName = event + '-' + matches[2]
  const role = matches[3]

  try {
    diswrp.selectChannel(channelName)
  } catch (ex) {
    diswrp.send('Lo sentimos, no hay ' + event + ' disponible', { isReply: true })
    return
  }

  const trial = await trialManager.getTrialParams(diswrp)

  if (typeof trial === 'undefined' || Object.keys(trial).length === 0) {
    diswrp.send('Lo sentimos, no hay ' + event + ' disponible', { isReply: true })
    return
  }

  const messages = await diswrp.getMessages('role')
  const lastRoleMessage = messages[messages.length - 1]

  const roles = parseRoles(diswrp, lastRoleMessage)

  const username = diswrp.getUserName()
  switch (action) {
    case 'add':
      if (isUserInRoleList(roles, username)) {
        diswrp.send('Ya estabas registrado en la trial, eliminate del role anterior', { isReply: true })
      } else if (role.startsWith('dd') && trial.value.fixed === 'no-fixed-dd-type') {
        // Da igual el tipo de dd se necesita rellenar
        const maxDamageDealer = 12 - parseInt(trial.value.qty_tank) - parseInt(trial.value.qty_healer)
        if (maxDamageDealer > roles['dd-melee'].length + roles['dd-ranged'].length) {
          roles[role].push(username)
        } else {
          diswrp.send('No hay más espacio para tu role en la trial', { isReply: true })
        }
      } else if (parseInt(trial.value['qty_' + role.replace('-', '_')]) > roles[role].length || role === 'suplente') {
        roles[role].push(username)
      } else {
        diswrp.send('No hay más espacio para tu role en la trial', { isReply: true })
      }
      break
    case 'remove':
      if (isUserInRoleList(roles, username)) {
        for (var i of Object.keys(roles)) {
          roles[i] = roles[i].filter(item => item !== username)
        }
      } else {
        diswrp.send('No estabas registrado en la trial', { isReply: true })
      }
      break
    default:
      diswrp.send('Lo siento, no tengo este comando implementado', { isReply: true })
      break
  }

  await diswrp.removeBotMessages('role')
  diswrp.send(renderRolesMessage(roles))
}

module.exports = {
  command: 'role',
  help: `***!trial role add|remove <tipo trial> dd-ranged|dd-melee|healer|tank|suplente***: Gestiona los usuarios de una trial.
    -->Ejemplo: *!trial role add jueves-progresion healer*`,
  execute: execute
}