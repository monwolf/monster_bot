const re_trial_command = /^role\s+(add|remove)\s+([a-zA-Z0-9\-\_]+)\s+(dd-melee|dd-ranged|healer|tank|suplente)/
const re_check_msg_roles = /^dd\-ranged:([a-zA-Z0-9\-\_\s]{0,})\ndd\-melee:([a-zA-Z0-9\-\_\s]{0,})\nhealer:([a-zA-Z0-9\-\_\s]{0,})\ntank:([a-zA-Z0-9\-\_\s]{0,})\nsuplente:([a-zA-Z0-9\-\_\s]{0,})$/m
const trial_manager = require("./trial-manager")

utils = require("../utils.js")

function parse_roles(content) {
    let result = utils.extract_metadata(content)
    if (Object.keys(result).length === 0) {
        result = { "dd-ranged": [], "dd-melee": [], "healer": [], "tank": [], "suplente": [] }
    } else {
        result = result.value
    }
    return result

}
function create_roles_msg(roles) {
    return `
\`\`\`diff
- ROLES
\`\`\`
**dd-ranged**: ${roles['dd-ranged'].join(', ')}
**dd-melee**: ${roles['dd-melee'].join(', ')}
**healer**: ${roles['healer'].join(', ')}
**tank**: ${roles['tank'].join(', ')}
**suplente**: ${roles['suplente'].join(', ')}
### INFO BOT ###
||${JSON.stringify({ "message_type": "role", "value": roles })}||
`
}
function user_in_role_list(roles, username) {

    for (const prop in roles) {
        if (roles[prop].indexOf(username) >= 0)
            return true
    }

    return false;
}

async function process_command(msg, command) {
    var matches = command.match(re_trial_command)
    if(!matches){
        msg.reply("Hay un error en el comando, revisa la sintaxi")
        return
    }

    let event = "trial";
    let action = matches[1];
    let channel_name = event + "-" + matches[2];
    let role = matches[3];

    let event_channel = msg.guild.channels.cache.find(channel =>
        channel.name === channel_name
    )
    if (!event_channel) {
        msg.reply("Lo sentimos, no hay " + event + " disponible")
        return
    }

    let trial = await trial_manager.get_trial_params(event_channel);

    if (typeof trial === "undefined"| Object.keys(trial).length == 0) {
        msg.reply("Lo sentimos, no hay " + event + " disponible")
        return
    }

    let messages = await event_channel.messages.fetch({ limit: 50 });
    let last_bot_msg = null
    for (const item of messages) {
        let message = item[1];
        if (message.author.bot && utils.extract_metadata(message.content).message_type == "role") {
            last_bot_msg = message;
            message.delete();
            console.log("deleted message:" + message.content)
        }
    }

    let roles = parse_roles(last_bot_msg !== null ? last_bot_msg.content : "")

    switch (action) {
        case "add":
            if (user_in_role_list(roles, msg.author.username)) {
                msg.reply("Ya estabas registrado en la trial, eliminate del role anterior");
                
            }
            else if (role.startsWith("dd") && trial.value.fixed == "no-fixed-dd-type") {
                // Da igual el tipo de dd se necesita rellenar
                let max_dd = 12 - parseInt(trial.value.qty_tank) - parseInt(trial.value.qty_healer);
                if (max_dd > roles["dd-melee"].length + roles["dd-ranged"].length) {
                    roles[role].push(msg.author.username)
                }
                else {
                    msg.reply("No hay más espacio para tu role en la trial");
                }

            }
            else if (parseInt(trial.value["qty_" + role.replace("-", "_")]) > roles[role].length) {
                roles[role].push(msg.author.username)
            }
            else {
                msg.reply("No hay más espacio para tu role en la trial");
            }
            break;
        case "remove":
            if (user_in_role_list(roles, msg.author.username)) {
                for (var i of Object.keys(roles)) {
                    roles[i] = roles[i].filter(item => item !== msg.author.username)
                }
            }
            else {
                msg.reply("No estabas registrado en la trial");
            }
            break;
        default:
            msg.reply("Lo siento, no tengo este comando implementado");
            break;
    }
    event_channel.send(create_roles_msg(roles))


}


module.exports = {
    command: "role",
    help: `***!trial role add|remove <tipo trial> dd-ranged|dd-melee|healer|tank|suplente***: Gestiona los usuarios de una trial.
    -->Ejemplo: *!trial role add jueves-progresion healer*`,
    process_command: process_command
};
