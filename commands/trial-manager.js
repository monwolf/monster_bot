const permitted_roles = ["trial-leader", "administrador", "administrator", "moderador", "moderator", "trial leader"]
//const permitted_roles = ["fuu"]
//manage create <tipo trial> <date> <time> <trial_name> no-fixed-dd-type|fixed-dd-type 2t 2h 2dd-ranged 6dd-melee 
//manage create <tipo trial> 
const re_date = /^\d{2}\/\d{2}\/\d{4}$/
const re_time = /^\d{2}:\d{2}$/
const re_trial_name = /^(n|v)[A-Z]{2,3}(\+\d)?$/
const re_fixed_dd = /^(no\-fixed\-dd\-type|fixed\-dd\-type)$/

const re_qty_tank = /^\dt$/
const re_qty_healer = /^\dh$/
const re_qty_dd_ranged = /^\ddd\-ranged$/
const re_qty_dd_melee = /^\ddd\-melee$/

utils = require("../utils.js")


function remove_bot_messages(channel){
    channel.messages.fetch({ limit: 50 }).then(messages => {
        for (const item of messages) {
            let message = item[1];
            if (message.author.bot) {
                message.delete();
                console.log("deleted message:" + message.content)
            }
        }
    }).catch(console.error);
}

function create_trial_msg(args){
    return `Atencion @everyone, <@${args.user_id}> convoca una trial
    Dia ${args.date} a las ${args.time}: (${args.trial_name})
    ${args.fixed_dd==="no-fixed-dd"?"Roles para participantes (dd pueden variar)":"Roles para participantes (limite dd por tipo)"}
    :tank: ${args.qty_tank}
    :healer: ${args.qty_healer}
    :DD: ranged: ${args.qty_dd_ranged}
    :DD: melee: ${args.qty_dd_melee}
    :detective_tone1: 
    ### INFO BOT ###
    ||${JSON.stringify({"message_type" : "trial", "value": args})}||
    `
}

function process_command(msg, command){

    if(!msg.member.roles.cache.some(role => permitted_roles.indexOf(role.name.toLowerCase()) >= 0)){
        msg.reply("No puedes pasaaar!", {files: ["https://media.giphy.com/media/P726XW1pK3Luo/giphy.gif"]})
        return
    }
    var command = command.slice("manage".length).trim();


    if(command.startsWith("create")){
        var args = command.slice("create".length).trim().split(/ +/);
        var channel_name = "trial-" + args[0];
        let event_channel = msg.guild.channels.cache.find(channel =>
            channel.name === channel_name
        )
        if (!event_channel) {
            msg.reply("Lo sentimos, no hay " + channel_name + " disponible")
            return
        }
        var date = args[1]
        if(typeof date === 'undefined' || !date.match(re_date)){
            msg.reply("Fecha Incorrecta")
            return
        }
        var time = args[2]
        if(typeof time === 'undefined' || !time.match(re_time)){
            msg.reply("Hora Incorrecta")
            return
        }
        var trial_name = args[3]
        if(typeof trial_name === 'undefined' || !trial_name.match(re_trial_name)){
            msg.reply("Nombre de la trial incorrecto")
            return
        }
        var fixed_dd = args[4]
        if(typeof fixed_dd === 'undefined' || !fixed_dd.match(re_fixed_dd)){
            msg.reply("Necesito saber si los dd ranged y los melee son intercambiables")
            return
        }

        var qty_tank = args[5]
        if(typeof qty_tank === 'undefined' || !qty_tank.match(re_qty_tank)){
            msg.reply("Cantidad de tanks incorrecta")
            return
        }
        qty_tank = parseInt(qty_tank[0])

        var qty_healer = args[6]
        if(typeof qty_healer === 'undefined' || !qty_healer.match(re_qty_healer)){
            msg.reply("Cantidad de healers incorrecta")
            return
        }
        qty_healer = parseInt(qty_healer[0])

        var qty_dd_ranged = args[7]
        if(typeof qty_dd_ranged === 'undefined' || !qty_dd_ranged.match(re_qty_dd_ranged)){
            msg.reply("Cantidad de dd ranged incorrecta")
            return
        }
        qty_dd_ranged = parseInt(qty_dd_ranged[0])

        var qty_dd_melee = args[8]
        if(typeof qty_dd_melee === 'undefined' || !qty_dd_melee.match(re_qty_dd_melee)){
            msg.reply("Cantidad de dd melee incorrecta")
            return
        }
        qty_dd_melee = parseInt(qty_dd_melee[0])

        if(qty_tank + qty_dd_melee + qty_dd_ranged + qty_healer != 12){
            msg.reply("La suma de participantes debe ser 12")
            return
        }
        remove_bot_messages(event_channel);
        event_channel.send(create_trial_msg({
            "user_id": msg.author.id,
            "date": date,
            "time": time,
            "trial_name": trial_name,
            "fixed": fixed_dd,
            "qty_tank": qty_tank,
            "qty_healer": qty_healer,
            "qty_dd_ranged": qty_dd_ranged,
            "qty_dd_melee": qty_dd_melee,
        }))

    }
    else if(command.startsWith("remove")){
        var args = command.slice("remove".length).trim().split("/ +/");
        var channel_name = "trial-" + args[0];
        let event_channel = msg.guild.channels.cache.find(channel =>
            channel.name === channel_name
        )
        if (!event_channel) {
            msg.reply("Lo sentimos, no hay " + channel_name + " disponible")
            return
        }
        remove_bot_messages(event_channel)
        msg.reply("Eliminada trial");



    }

    

}

async function get_trial_params(channel){
    
    let messages = await channel.messages.fetch({ limit: 50 });
        let trial_data = {};
        for (const item of messages) {
            let message = item[1];
            if (message.author.bot) {
                let metadata = utils.extract_metadata(message.content)
                if (metadata.message_type === "trial" ){
                    trial_data = metadata
                }

            }
        }
        return trial_data;
}

module.exports = {
    command: "manage",
    process_command: process_command,
    help: `***!trial manage create|remove <tipo trial> <date> <time> <trial_name> no-fixed-dd-type|fixed-dd-type <x>t <x>h <x>dd-ranged <x>dd-melee ***: Genera un mensaje predefinido para una trial.
    -->Ejemplo: *!trial manage create jueves-progresion 10/11/2020 20:00 vAA fixed-dd-type 2t 2h 2dd-ranged 6dd-melee*`,
    get_trial_params: get_trial_params
};
  