const authorizeUrl = 'https://discord.com/api/oauth2/authorize?client_id=703145512244740196&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Foauth2%2Fauthorize&response_type=code&scope=identify%20guilds'
var log4js = require('log4js').getLogger('monster_bot')

module.exports = {
  app: (req, res, next) => {
    log4js.info('[SERVER] [' + req.method + '] ' + req.originalUrl)
    const urlChunks = req.url
    if (urlChunks.includes('oauth2')) {
      next()
    } else if (typeof req.cookies?.token !== 'undefined' || typeof req.headers.authorization !== 'undefined' || typeof req.query.token !== 'undefined') {
      next()
    } else {
      res.redirect(authorizeUrl)
    }
  },
  init: function (conf) { }

}
