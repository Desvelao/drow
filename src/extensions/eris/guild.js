const Eris = require('eris');
const { getDefaultChannel } = require('../../utils/guild')
const Extension = require('../../Extension')

module.exports = new Extension('eris-guild',function(bot){
  Eris.Guild.prototype.defaultChannel = function(canWrite){
    const client = this.shard.client
    return this.channels.map(channel => channel).reduce((defaultChannel,channel) => {
      if(channel.permissionsOf(client.user.id).has("readMessages") && (!defaultChannel || channel.position < defaultChannel.position)){
        if(!canWrite){
          return channel
        }else{
          if(channel.permissionsOf(client.user.id).has("sendMessages")){return channel}else{return defaultChannel}
        }
      }else{
        return defaultChannel
      }
    },null)
  }

  Eris.Guild.prototype.getRole = function(name,incaseSensitive){
    return this.roles.find(r => formatted(r.name,incaseSensitive) === formatted(name,incaseSensitive))
  }

  Eris.Guild.prototype.loadEmojis = function(incaseSensitive){
    let emojis = {};
    this.emojis.forEach(emoji => {emojis[formatted(emoji.name,incaseSensitive)] = '<:' + emoji.name + ':' + emoji.id + '>'})
    return emojis
  }
})

function formatted(string,incaseSensitive){return incaseSensitive ? string.toLowerCase() : string}
