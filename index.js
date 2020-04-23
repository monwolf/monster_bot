const Discord = require("discord.js")
const fs = require("fs")
const client = new Discord.Client()
const config = require('./config.json');
const utils = require("./utils.js")
const commands = [];

fs.readdirSync(__dirname + "/commands/")
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        let cmd = require('./commands/' + file);
        commands[cmd.command] = cmd;
    });

var bot_id = null;

client.on("ready", () => {
    bot_id = client.user.bot_id;
    console.log(`Logged in as ${client.user.tag}!`)
})


client.on("message", msg => {

    if (msg.content.startsWith(config.prefix)) {
        var cmd = msg.content.slice(config.prefix.length).trim().split(/ +/)[0];
        if (cmd in commands && cmd != "help") {
            commands[cmd].process_command(msg, msg.content.slice(config.prefix.length).trim())
        }
        else {
            commands["help"].process_command(msg, commands)
        }
    }

})
client.login(config.token)
