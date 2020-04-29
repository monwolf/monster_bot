function execute (msg, command) {
  const pkg = require('../../package.json')
  msg.send('version: ' + pkg.version, { isReply: true })
}

module.exports = {
  command: 'version',
  help: '**!trial version**: Muestra la version que se ejecuta',
  execute: execute
}
