# Monster_bot
This is a discord bot created to manage raids of 12 persons splitted by their role in the group.

## Installation

In order to run this service you should execute: 
```
# Download and add the user
cd /opt
useradd monster_bot
git clone https://github.com/monwolf/monster_bot.git
chown -R monster_bot:monster_bot
cd monster_bot
sudo -u monster_bot npm install
cp config.example.json config.json
vi config.json
```
In this point you should add the token of you bot in discord. If you don't have it, take a look to this guide:

https://discordpy.readthedocs.io/en/latest/discord.html


Now you can install it as a service and run it:

```
#Install the service an run it
cp -rp monster_bot/extras/monster_bot.service  /usr/lib/systemd/system/monster_bot.service
systemctl enable monster_bot.service
systemctl start monster_bot.services
```