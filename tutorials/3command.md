### Create a Command

```js
//ping.js
const { Command } = require('aghanim')

module.exports = new Command('ping', {
  category : 'Fun', help : 'Get Pong!', args : ''},
  function (msg,args,cmd) { // This function should be a function and no an arraow function to keep this = bot instance
	//this = Aghanim.Client
  	msg.channel.createMessage('Pong!')
})
```

### Add your command to your bot
```js
	//index.js
	//bot defined...
	const ping_command = require('my_component')
	bot.addCommmand(ping_command)

	//You can import the file directly using addCommandFile method
	bot.addCommandFile(__dirname + 'ping.js')

	//Or you can import a directory of commands with addCommandDir method
	bot.addCommandDir(__dirname + 'path/to/commands')
```

### Create a Subcommand
```js
//pong.js
const { Command } = require('aghanim')

module.exports = new Command('pong', {
  subcommandFrom : 'ping',
  category : 'Fun', help : 'Get Pong!', args : ''},
  function (msg,args,cmd) {
		//this = Aghanim.Client
  	msg.channel.createMessage('Pong!')
})

// This command will be fired with `[botPrefix]ping pong`
```

You need add it to bot after `ping` command.