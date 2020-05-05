var logger = require('log4js').getLogger('monster_bot')
const moment = require('moment')
const models = require('../models/index.js').models
const trialManager = require('./trial-manager')

async function execute (diswrp, command) {
  /* logger.info('Hola es una funcion de test')
  logger.info(models.Trial)

  var trial =
    {
      user_id: 12345,
      date: moment('30/01/2020 18:30', 'DD/MM/YYYY HH:mm'),
      trial_name: 'vCR+3',
      fixed: 'no-fixed-dd',
      qty_tank: 2,
      qty_healer: 2,
      qty_dd_ranged: 4,
      qty_dd_melee: 4,
      guild_id: 123456,
      channel_id: 1234
    }

  await models.Trial.upsert(trial)

  var qresult = await models.Trial.Model.find({}).exec()
  logger.info(qresult) */
  diswrp.selectChannel('trial-jueves-progresion')
  const trial = await trialManager.getTrialParams(diswrp)
  console.log(trial)
}

module.exports = {
  command: 'test',
  help: '**!trial test**: solo para pruebas internas.. sin utilidad real',
  execute: execute
}
