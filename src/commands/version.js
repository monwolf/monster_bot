function execute (msg, command) {
  const pkg = require('../package.json')
  msg.reply('version: ' + pkg.version)
}

module.exports = {
  command: 'version',
  help: '**!trial version**: Muestra la version que se ejecuta',
  execute: execute
}
