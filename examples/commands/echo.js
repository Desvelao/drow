const { Command } = require('aghanim')

module.exports = new Command('echo',{
  category : 'Owner', help : 'Echo a message', args : '',
  ownerOnly : true, hide : true},
  function(msg, args, client, command){
    return msg.channel.createMessage(args.from(1))
  })
