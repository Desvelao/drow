const { Command } = require('aghanim')

module.exports = new Command('ping',{
  category : 'Owner', help : 'Pong!', args : '',
  ownerOnly : true, hide : true},
  function(msg, args, command){
    // let self = this //this representing Aghanim.Client
    const date = new Date().getTime()
    msg.reply(`Ping: ${date - msg.timestamp} ms`).then((m) => {setTimeout(() => {m.delete()},5000)})
  })
