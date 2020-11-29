var log4js = require('log4js').getLogger('monster_bot')

class DiscordWrapper {
  maxFetch = 50
  RESPONSE_TYPE = {
    REPLY: 'reply',
    CHANNEL: 'channel',
    DM: 'dm'
  }

  constructor (message, logger = null) {
    if (!logger) { this.logger = log4js }
    this._msg = message
    this._channel = null
  }

  getChannel (name = null) {
    const channel = this._msg.guild.channels.cache.find(channel =>
      channel.name === name
    )
    if (!channel) {
      throw new Error("Such channel doesn't exists")
    }
    return channel
  }

  selectChannel (name = null) {
    this._channel = this.getChannel(name)
  }

  getGuildId () {
    return this._msg.guild.id
  }

  getChannelId () {
    return this._channel.id
  }

  getContent () {
    return this._msg.content
  }

  getEmoji (alias) {
    const emoji = this._msg.guild.emojis.cache.find(emoji => emoji.name === alias)
    if (typeof emoji !== 'undefined') {
      return emoji
    } else return `:${alias}:`
  }

  async removeBotMessages (messageType = null) {
    const messages = await this._channel.messages.fetch({ limit: this.maxFetch })
    for (const item of messages) {
      const message = item[1]
      if (message.author.bot) {
        if ((messageType == null) ||
        (typeof messageType === 'string' && this.extractMetadata(message.content).message_type === messageType) ||
        (messageType instanceof RegExp && message.content.match(messageType))) {
          message.delete()
          this.logger.info('deleted message:' + message.content)
        }
      }
    }
  }

  async getMessages (messageType = null) {
    const messages = await this._channel.messages.fetch({ limit: this.maxFetch })
    let result = []
    if (messageType != null) {
      for (const item of messages) {
        const message = item[1]
        if (message.author.bot) {
          if (typeof messageType === 'string' && this.extractMetadata(message.content).message_type === messageType) {
            result.push(message)
          } else if (messageType instanceof RegExp && message.content.match(messageType)) {
            result.push(message)
          }
        }
      }
    } else { result = messages }

    return result
  }

  getRawMessage () {
    return this._msg
  }

  getUserName () {
    return this._msg.author.username
  }

  getUserId () {
    return this._msg.author.id
  }

  extractMetadata (msg) {
    var result = {}
    let text = msg

    if (typeof msg === 'undefined') {
      return result
    }
    if (typeof msg !== 'string') {
      text = msg.content
    }

    var match = text.match(/(?<=\|\|)(.*?)(?=\|\|)/)
    if (match) {
      result = JSON.parse(match[0])
    }
    return result
  }

  send (content, options = {}) {
    const args = (typeof options.extraOptions === 'undefined') ? {} : options.extraOptions
    if (options.messageType) {
      switch (options.messageType) {
        case this.RESPONSE_TYPE.DM:
          this._msg.author.send(content, args)
          break
        case this.RESPONSE_TYPE.REPLY:
          this._msg.reply(content, args)
          break
        case this.RESPONSE_TYPE.CHANNEL:
          this._channel.send(content, args)
          break
        default:
          this._msg.reply(content, args)
          break
      }
    } else {
      this._channel.send(content, args)
    }
  }

  memberHasAnyRole (roles = []) {
    return this._msg.member.roles.cache.some(role => roles.indexOf(role.name.toLowerCase()) >= 0)
  }
}

module.exports = DiscordWrapper
