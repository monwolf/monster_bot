utils = require("../utils.js")


function process_command(msg, command){
    let channel = msg.guild.channels.cache.find(channel =>
        channel.name === "trial-jueves-progresion"
    )

    channel.messages.fetch({ limit: 50 }).then(messages => {
        for (const item of messages) {
            let message = item[1];
            if (message.author.bot) {
                console.log(utils.extract_metadata(message.content))

            }
        }
    }).catch(console.error);
}

module.exports = {
    command: "test",
    help: "**!trial test**: solo para pruebas internas.. sin utilidad real",
    process_command: process_command 
};
  