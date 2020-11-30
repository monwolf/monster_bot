var log4js = require('log4js').getLogger('monster_bot')

const express = require('express')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const path = require('path')
const basename = path.basename(__filename)
var hbs = require('express-hbs')
const DiscordApi = require('./discord-api')

const app = express()

var init = function (conf) {
  /* include all files */
  fs.readdirSync(path.join(__dirname, 'http'))
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
    })
    .forEach(file => {
      log4js.info('Require' + file)
      var midd = require('./http/' + file)
      midd.init(conf)
      app.use(midd.app)
    })

  hbs.express4({})
  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname, 'http', 'templates'))

  app.get('/', (req, res) => {
    const api = new DiscordApi(req.query.token)
    api.getGuilds()
      .then(guilds => res.render('index', { guilds: guilds }))
  })

  app.use('/static', express.static(path.join(__dirname, 'http', 'public')))

  app.use(cookieParser())
  app.listen(conf.http_port || 8080, () => {
    log4js.info('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    log4js.info('App listening on port ', conf.http_port || 8080)
    log4js.info('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  })
}

module.exports = {
  init: init
}
