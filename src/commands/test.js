var logger = require('log4js').getLogger('monster_bot')
const moment = require('moment')
const models = require('../models/index.js').models

async function execute (msg, command) {
  logger.info('Hola es una funcion de test')
  logger.info(models.Trial)
  await new models.Trial.Model(
    {
      user_id: 1234,
      date: moment('30/01/2020 18:30', 'DD/MM/YYYY HH:mm'),
      trial_name: 'vCR+3',
      fixed: 'no-fixed-dd',
      qty_tank: 2,
      qty_healer: 2,
      qty_dd_ranged: 4,
      qty_dd_melee: 4
    }
  ).save()
  var qresult = await models.Trial.Model.find({}).exec()
  logger.info(qresult)
}

module.exports = {
  command: 'test',
  help: '**!trial test**: solo para pruebas internas.. sin utilidad real',
  execute: execute
}
