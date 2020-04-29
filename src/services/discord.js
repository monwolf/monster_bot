var log4js = require('log4js').getLogger('monster_bot')

class DiscordWrapper {
  maxFetch = 50

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

  getContent () {
    return this._msg.content
  }

  getEmoji (alias) {
    const emoji = this._msg.guild.emojis.cache.find(emoji => emoji.name === alias)
    if (typeof emoji !== 'undefined') {
      return emoji
    } else return `:${alias}:`
  }

  async removeBotMessages (message_type = null) {
    const messages = await this._channel.messages.fetch({ limit: this.maxFetch })
    for (const item of messages) {
      const message = item[1]
      // eslint-disable-next-line camelcase
      if ((message.author.bot && message_type == null) || (message.author.bot && message_type && this.extractMetadata(message.content).message_type === message_type)) {
        message.delete()
        this.logger.info('deleted message:' + message.content)
      }
    }
  }

  async getMessages (message_type = null) {
    const messages = await this._channel.messages.fetch({ limit: this.maxFetch })
    let result = []
    // eslint-disable-next-line camelcase
    if (message_type != null) {
      for (const item of messages) {
        const message = item[1]
        // eslint-disable-next-line camelcase
        if (message.author.bot && this.extractMetadata(message.content).message_type === message_type) {
          result.push(message)
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
    if (typeof options.isReply !== 'undefined' && options.isReply === true) {
      this._msg.reply(content, args)
    } else {
      this._channel.send(content, args)
    }
  }

  memberHasAnyRole (roles = []) {
    return this._msg.member.roles.cache.some(role => roles.indexOf(role.name.toLowerCase()) >= 0)
  }
}

module.exports = DiscordWrapper
