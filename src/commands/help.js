function execute (msg, commands) {
  let h = '**Ayuda:**\n'
  for (const cmd in commands) {
    h = h + commands[cmd].help + '\n\n'
  }
  msg.reply(h)
}

module.exports = {
  command: 'help',
  help: '***!trial help***: Muestra esta ventana de ayuda',
  execute: execute
}
