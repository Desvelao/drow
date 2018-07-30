module.exports.getDefaultChannel = function(guild,bot,canWrite){
  return guild.channels.map(channel => channel).reduce((defaultChannel,channel) => {
    if(channel.type === 0 && channel.permissionsOf(bot.user.id).has("readMessages") && (!defaultChannel || channel.position < defaultChannel.position)){
      if(!canWrite){
        return channel
      }else{
        if(channel.permissionsOf(bot.user.id).has("sendMessages")){return channel}else{return defaultChannel}
      }
    }else{
      return defaultChannel
    }
  },null)
 //   let defaultChannel;
 //     for(let channel of guild.channels.values()) {
 //       //console.log(channel.name, channel.position, channel.parentID,channel.type,channel.permissionsOf(bot.user.id).has("readMessages"));
 //       if(channel.id === guild.id){defaultChannel = channel;break}
 //       //console.log(bot.user.id);
 //       if(channel.type === 0 && channel.permissionsOf(bot.user.id).has("readMessages") && (!defaultChannel || channel.position < defaultChannel.position)){
 //         defaultChannel = channel;
 //       }
 //     }
 //     return defaultChannel
 // }
}
