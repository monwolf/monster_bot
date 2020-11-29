var logger = require('log4js').getLogger('monster_bot')
const models = require('../models/index.js').models
const commandName = 'dps'
const RE_DPS = /^\d+[kK]/

const PERMITTED_ROLES = ['trial-leader', 'administrador', 'administrator', 'moderador', 'moderator', 'trial leader']

async function add (diswrp, command) {
  const userId = diswrp.getUserId()
  const guildId = diswrp.getGuildId()
  const userName = diswrp.getUserName()
  if (!command.match(RE_DPS)) {
    diswrp.send('DPS No Valido', { messageType: diswrp.RESPONSE_TYPE.DM })
  }
  const damage = parseInt(command)
  await models.Recruit.upsert({ user_id: userId, guild_id: guildId, pending_dps: damage, user_name: userName })
  diswrp.send('Añadido DPS para ser revisado por la guild.', { messageType: diswrp.RESPONSE_TYPE.DM })
}
async function remove (diswrp, command) {
  const userId = diswrp.getUserId()
  const guildId = diswrp.getGuildId()
  await models.Recruit.Model.findOneAndRemove({ user_id: userId, guild_id: guildId })
  diswrp.send('Se han limpiado los registros de tu daño.', { messageType: diswrp.RESPONSE_TYPE.DM })
}

async function approve (diswrp, command) {
  if (!diswrp.memberHasAnyRole(PERMITTED_ROLES)) {
    diswrp.send('No puedes pasaaar!', { messageType: diswrp.RESPONSE_TYPE.DM, extraOptions: { files: ['https://media.giphy.com/media/P726XW1pK3Luo/giphy.gif'] } })
  }

  const guildId = diswrp.getGuildId()
  const userName = command

  var qresult = await models.Recruit.Model.find({ user_name: userName, guild_id: guildId, pending_dps: { $gt: 0 } }).exec()
  if (qresult.length <= 0) {
    diswrp.send('No se ha encontrado usuario para aprovar.', { messageType: diswrp.RESPONSE_TYPE.DM })
    return
  }
  const recruit = qresult[0]

  recruit.max_dps = recruit.pending_dps
  recruit.pending_dps = 0
  recruit.approver = diswrp.getUserId()
  await recruit.save()

  diswrp.send('Se ha aprobado.', { messageType: diswrp.RESPONSE_TYPE.DM })
}

async function list (diswrp, command) {
  if (!diswrp.memberHasAnyRole(PERMITTED_ROLES)) {
    diswrp.send('No puedes pasaaar!', { messageType: diswrp.RESPONSE_TYPE.DM, extraOptions: { files: ['https://media.giphy.com/media/P726XW1pK3Luo/giphy.gif'] } })
    return
  }
  var recruits = await models.Recruit.Model.find({}).exec()
  let pending = ''
  let approved = ''
  for (const recruit of recruits) {
    if (recruit.pending_dps && recruit.pending_dps !== 0) {
      pending = pending + `**${recruit.user_name}**: ${recruit.max_dps ? recruit.max_dps + 'K' : 'N/A'} --> ${recruit.pending_dps}K \n`
    } else { approved = approved + `**${recruit.user_name}**: ${recruit.max_dps} \n` }
  }

  diswrp.send(`
\`\`\`diff
- Pendientes
\`\`\`
  Usuario: Actual (DPS) --> Pendiente (DPS)
  ${pending}
\`\`\`diff
- Aprobados
\`\`\`
  Usuario: Actual (DPS)
  ${approved}
  `, { messageType: diswrp.RESPONSE_TYPE.DM })
}

const controller = {
  add: add,
  list: list,
  remove: remove,
  approve: approve

}

async function execute (diswrp, command) {
  logger.info('dps-manger execute')
  command = command.slice(commandName.length).trim()
  try {
    const subcommand = command.split(' ')[0]
    command = command.slice(subcommand.length).trim()
    controller[subcommand](diswrp, command)
  } catch (error) {
    logger.info('Funcion no implmenentada: ' + command + error)
    diswrp.send('Funcion no implmenentada', { messageType: diswrp.RESPONSE_TYPE.DM })
  }
}

module.exports = {
  command: commandName,
  help: `**!trial dps**: solo para pruebas internas.. sin utilidad real
        -->  !trial dps add <dps>K
        -->  !trial dps remove
        -->  !trial dps list
        -->  !trial dps approve <@id>
  `,
  execute: execute
}
