// var logger = require('log4js').getLogger('monster_bot')
// const utils = require('../helpers/utils.js')

const RE_ROLE_COMMAND = /^role\s+(add|remove)\s+([a-zA-Z0-9\-_]+)\s+(dd-melee|dd-ranged|healer|tank|suplente)/
const RE_ROLE_MSG = /-\s+ROLES/

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
`
}
function isUserInRoleList (roles, username) {
  for (const prop in roles) {
    if (Array.isArray(roles[prop]) && roles[prop].indexOf(username) >= 0) { return true }
  }

  return false
}

async function execute (diswrp, command) {
  var matches = command.match(RE_ROLE_COMMAND)
  if (!matches) {
    diswrp.send('Hay un error en el comando, revisa la sintaxi', { messageType: diswrp.RESPONSE_TYPE.REPLY })
    return
  }

  const event = 'trial'
  const action = matches[1]
  const channelName = event + '-' + matches[2]
  const role = matches[3]

  try {
    diswrp.selectChannel(channelName)
  } catch (ex) {
    diswrp.send('Lo sentimos, no hay ' + event + ' disponible', { messageType: diswrp.RESPONSE_TYPE.REPLY })
    return
  }

  const trial = await trialManager.getTrialParams(diswrp)

  if (typeof trial === 'undefined' || trial === null || Object.keys(trial).length === 0) {
    diswrp.send('Lo sentimos, no hay ' + event + ' disponible', { messageType: diswrp.RESPONSE_TYPE.REPLY })
    return
  }
  if (typeof trial.roles === 'undefined' || Object.keys(trial.roles).length === 0) {
    const messages = await diswrp.getMessages('role')
    const lastRoleMessage = messages[messages.length - 1]
    trial.roles = parseRoles(diswrp, lastRoleMessage)
  }

  const username = diswrp.getUserName()
  switch (action) {
    case 'add':
      if (isUserInRoleList(trial.roles, username)) {
        diswrp.send('Ya estabas registrado en la trial, eliminate del role anterior', { messageType: diswrp.RESPONSE_TYPE.REPLY })
      } else if (role.startsWith('dd') && trial.fixed === 'no-fixed-dd-type') {
        // Da igual el tipo de dd se necesita rellenar
        const maxDamageDealer = 12 - parseInt(trial.qty_tank) - parseInt(trial.qty_healer)
        if (maxDamageDealer > trial.roles['dd-melee'].length + trial.roles['dd-ranged'].length) {
          trial.roles[role].push(username)
        } else {
          diswrp.send('No hay más espacio para tu role en la trial', { messageType: diswrp.RESPONSE_TYPE.REPLY })
        }
      } else if (parseInt(trial['qty_' + role.replace('-', '_')]) > trial.roles[role].length || role === 'suplente') {
        trial.roles[role].push(username)
      } else {
        diswrp.send('No hay más espacio para tu role en la trial', { messageType: diswrp.RESPONSE_TYPE.REPLY })
      }
      break
    case 'remove':
      if (isUserInRoleList(trial.roles, username)) {
        for (var i of Object.keys(trial.roles)) {
          if (Array.isArray(trial.roles[i])) {
            trial.roles[i] = trial.roles[i].filter(item => item !== username)
          }
        }
      } else {
        diswrp.send('No estabas registrado en la trial', { messageType: diswrp.RESPONSE_TYPE.REPLY })
      }
      break
    default:
      diswrp.send('Lo siento, no tengo este comando implementado', { messageType: diswrp.RESPONSE_TYPE.REPLY })
      break
  }

  await diswrp.removeBotMessages('role')
  await diswrp.removeBotMessages(RE_ROLE_MSG)
  await trial.save()
  diswrp.send(renderRolesMessage(trial.roles))
}

module.exports = {
  command: 'role',
  help: `***!trial role add|remove <tipo trial> dd-ranged|dd-melee|healer|tank|suplente***: Gestiona los usuarios de una trial.
    -->Ejemplo: *!trial role add jueves-progresion healer*`,
  execute: execute
}
