### Create a Command

```js
//ping.js
const { Command } = require('aghanim')

module.exports = new Command('ping', {
  category : 'Fun', help : 'Get Pong!', args : ''},
  async function (msg, args, client, command) { 
  	msg.channel.createMessage('Pong!')
})
```

### Add your command to your bot
```js
	//index.js
	//bot defined...
	const ping_command = require('./ping.js')
	client.addCommmand(ping_command)

	//You can import the file directly using addCommandFile method
	client.addCommandFile(__dirname + '/ping.js')

	//Or you can import a directory of commands with addCommandDir method
	client.addCommandDir(__dirname + 'path/to/commands')
```

### Create a Subcommand
```js
//pong.js
const { Command } = require('aghanim')

module.exports = new Command('pong', {
  subcommandFrom : 'ping', // Upper/Parent command Command. It should be defined before add this subcommand
  category : 'Fun', help : 'Get Pong!', args : ''},
  async function (msg, args, client, command) {
  	msg.channel.createMessage('Pong!')
})

// This command will be fired with `[botPrefix]ping pong`
```