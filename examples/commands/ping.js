const { Command } = require('aghanim')

module.exports = new Command('ping',{
  category : 'Owner', help : 'Pong!', args : '',
  ownerOnly : true, hide : true},
  function(msg, args, client, command){
    const date = new Date().getTime()
    return msg.channel.createMessage(`Ping: ${date - msg.timestamp} ms`).then((m) => {setTimeout(() => {m.delete()},5000)})
  })
