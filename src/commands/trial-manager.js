const models = require('../models/index.js').models
const moment = require('moment')

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

const RE_TRIAL_ID = /ID: ([0-9a-fA-F]{24})/

function renderTrialMessage (diswrp, args) {
  return `Atencion @everyone, <@${args.user_id}> convoca una trial
    Dia ${args.date} a las ${args.time}: (${args.trial_name})
    ${args.fixed_dd === 'no-fixed-dd' ? 'Roles para participantes (dd pueden variar)' : 'Roles para participantes (limite dd por tipo)'}
    ${diswrp.getEmoji('tank')} ${args.qty_tank}
    ${diswrp.getEmoji('healer')} ${args.qty_healer}
    ${diswrp.getEmoji('DD')}-ranged: ${args.qty_dd_ranged}
    ${diswrp.getEmoji('DD')}-melee: ${args.qty_dd_melee}
    :detective_tone1: 
    ### INFO BOT ###
    ID: ${args.objectId}
    `
  //  ||${JSON.stringify({ message_type: 'trial', value: args })}||
}

async function execute (diswrp, command) {
  if (!diswrp.memberHasAnyRole(PERMITTED_ROLES)) {
    diswrp.send('No puedes pasaaar!', { isReply: true, extraOptions: { files: ['https://media.giphy.com/media/P726XW1pK3Luo/giphy.gif'] } })
    return
  }
  command = command.slice('manage'.length).trim()

  if (command.startsWith('create')) {
    const args = command.slice('create'.length).trim().split(/ +/)
    const channelName = 'trial-' + args[0]
    try {
      diswrp.selectChannel(channelName)
    } catch (ex) {
      diswrp.send('Lo sentimos, no hay ' + channelName + ' disponible', { isReply: true })
      return
    }

    var date = args[1]
    if (typeof date === 'undefined' || !date.match(RE_DATE)) {
      diswrp.send('Fecha Incorrecta', { isReply: true })
      return
    }
    var time = args[2]
    if (typeof time === 'undefined' || !time.match(RE_TIME)) {
      diswrp.send('Hora Incorrecta', { isReply: true })
      return
    }
    var trialName = args[3]
    if (typeof trialName === 'undefined' || !trialName.match(RE_TRIAL_NAME)) {
      diswrp.send('Nombre de la trial incorrecto', { isReply: true })
      return
    }
    var fixedDamageDealer = args[4]
    if (typeof fixedDamageDealer === 'undefined' || !fixedDamageDealer.match(RE_FIXED_DD)) {
      diswrp.send('Necesito saber si los dd ranged y los melee son intercambiables', { isReply: true })
      return
    }

    var qty_tank = args[5]
    if (typeof qty_tank === 'undefined' || !qty_tank.match(RE_QTY_TANK)) {
      diswrp.send('Cantidad de tanks incorrecta', { isReply: true })
      return
    }
    qty_tank = parseInt(qty_tank[0])

    var qty_healer = args[6]
    if (typeof qty_healer === 'undefined' || !qty_healer.match(RE_QTY_HEALER)) {
      diswrp.send('Cantidad de healers incorrecta', { isReply: true })
      return
    }
    qty_healer = parseInt(qty_healer[0])

    var qty_dd_ranged = args[7]
    if (typeof qty_dd_ranged === 'undefined' || !qty_dd_ranged.match(RE_QTY_DD_RANGED)) {
      diswrp.send('Cantidad de dd ranged incorrecta', { isReply: true })
      return
    }
    qty_dd_ranged = parseInt(qty_dd_ranged[0])

    var qty_dd_melee = args[8]
    if (typeof qty_dd_melee === 'undefined' || !qty_dd_melee.match(RE_QTY_MELEE)) {
      diswrp.send('Cantidad de dd melee incorrecta', { isReply: true })
      return
    }
    qty_dd_melee = parseInt(qty_dd_melee[0])

    if (qty_tank + qty_dd_melee + qty_dd_ranged + qty_healer != 12) {
      diswrp.send('La suma de participantes debe ser 12', { isReply: true })
      return
    }

    const trialObj = {
      user_id: diswrp.getUserId(),
      guild_id: diswrp.getGuildId(),
      channel_id: diswrp.getChannelId(),
      date: moment(`${date} ${time}`, 'DD/MM/YYYY HH:mm'),
      trial_name: trialName,
      fixed: fixedDamageDealer,
      qty_tank: qty_tank,
      qty_healer: qty_healer,
      qty_dd_ranged: qty_dd_ranged,
      qty_dd_melee: qty_dd_melee
    }
    const oid = await models.Trial.upsert(trialObj)
    trialObj.objectId = oid

    diswrp.removeBotMessages()
    diswrp.send(renderTrialMessage(diswrp, trialObj))
  } else if (command.startsWith('remove')) {
    const args = command.slice('remove'.length).trim().split('/ +/')
    const channelName = 'trial-' + args[0]
    try {
      diswrp.selectChannel(channelName)
    } catch (ex) {
      diswrp.send('Lo sentimos, no hay ' + channelName + ' disponible', { isReply: true })
      return
    }
    const trial = await getTrialParams(diswrp)
    if (typeof trial === 'undefined' || trial === null) {
      diswrp.send('No se ha encontrado trial', { isReply: true })
      return
    }

    await models.Trial.Model.deleteOne({ _id: trial._id })

    diswrp.removeBotMessages()
    diswrp.send('Eliminada trial', { isReply: true })
  }
}

async function getTrialParams (diswrp) {
  let messages = await diswrp.getMessages('trial')
  let trial = messages[messages.length - 1]
  let id = null
  // TODO: Eliminar este if cuando todas las trials esten migradas
  if (typeof trial !== 'undefined') {
    const trialObj = diswrp.extractMetadata(trial).value

    trialObj.user_id = diswrp.getUserId()
    trialObj.guild_id = diswrp.getGuildId()
    trialObj.channel_id = diswrp.getChannelId()
    trialObj.date = moment(`${trialObj.date} ${trialObj.date}`, 'DD/MM/YYYY HH:mm')
    delete trialObj.time
    id = await models.Trial.upsert(trialObj)
  }
  messages = await diswrp.getMessages(RE_TRIAL_ID)
  trial = messages[messages.length - 1]
  if (typeof trial !== 'undefined') {
    id = trial.content.match(RE_TRIAL_ID)[1]
  }
  return await models.Trial.Model.findOne({ _id: id }).exec()
}

module.exports = {
  command: 'manage',
  execute: execute,
  help: `***!trial manage create|remove <tipo trial> <date> <time> <trial_name> no-fixed-dd-type|fixed-dd-type <x>t <x>h <x>dd-ranged <x>dd-melee ***: Genera un mensaje predefinido para una trial.
    -->Ejemplo: *!trial manage create jueves-progresion 10/11/2020 20:00 vAA fixed-dd-type 2t 2h 2dd-ranged 6dd-melee*`,
  getTrialParams: getTrialParams
}
