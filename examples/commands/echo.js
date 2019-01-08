const { Command } = require('aghanim')

module.exports = new Command('echo',{
  category : 'Owner', help : 'Echo a message', args : '',
  ownerOnly : true, hide : true},
  function(msg, args, command){
    // let self = this //this representing Aghanim.Client
    return msg.channel.createMessage(args.from(1))
  })
