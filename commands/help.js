function process_command(msg, commands){
    let h = "**Ayuda:**\n"
    for (const cmd in commands) {
        h = h + commands[cmd].help + "\n";
    }
    msg.reply(h)
}

module.exports = {
    command: "help",
    help: "***!trial help***: Muestra esta ventana de ayuda",
    process_command: process_command 
};
  