const Eris = require('eris');
const { getDefaultChannel } = require('../../utils/guild')
const Extension = require('../../Extension')

module.exports = new Extension('eris-client',function(bot){
  Eris.Client.prototype.createMessageGuilds = function(content,file){
    // this.guilds.map(guild => guild) // defaultChannel function
    // console.log(this.guilds.map(guild => getDefaultChannel(guild,this)).map(c => [c.id,c.guild.name,c.guild.id]));
    return Promise.all(this.guilds.map(guild => getDefaultChannel(guild,this,true)).map(channel => this.createMessage(channel.id,content,file)))
  }
})
