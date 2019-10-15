### Create a Command

```js
// ping.js
const { Command } = require('aghanim')

module.exports = new Command('ping', // command name
	{ // options object
		category : 'Fun',
		help : 'Get Pong!',
		args : '',
		requirements: [], // Define requirements for this command. See command requirements tutorial
		hooks : { // Add hooks to commnand
			pre : [], // Array of hooks fired before command execution
			executed : [], // Array of hooks fired after command execution
			error: [] // Array of hooks fired if the command has some error
		}
		response: "Pong!", // String or function(msg, args, client, commnad)
		responseDM: "Pong by DM!", // String or function(msg, args, client, commnad)
	},
	async function (msg, args, client, command) { // run function. Only execute if not options.response or options.responseDM
		msg.channel.createMessage('Pong by run function!')
})
```
Command execute first of: `response` > `responseDM` > `run`

### Add your command to your bot
```js
	// index.js
	// bot defined...
	const ping_command = require('./ping.js')
	client.addCommmand(ping_command)

	//You can import the file directly using addCommandFile method
	client.addCommandFile(__dirname + '/ping.js')

	//Or you can import a directory of commands with addCommandDir method
	client.addCommandDir(__dirname + 'path/to/commands')
```

### Create a Subcommand
```js
// pong.js
const { Command } = require('aghanim')

module.exports = new Command('pong', 
	{
		childOf : 'ping', // Upper/Parent command Command. Parent command should be added before the subcommand
		category : 'Fun',
		help : 'Get Pong!',
		args : ''
	},
	async function (msg, args, client, command) {
		return msg.channel.createMessage('Pong!')
	}
)

// This command will be fired with `[botPrefix]ping pong`
```

### Command Object

Create a command as object too
```js
module.exports = {
	name: 'ping',
	category: 'Fun',
	help: 'Get Pong!',
	args: '',
	requirements: [], // Define requirements for this command. See command requirements tutorial
	hooks : { // Add hooks to commnand
		pre : [], // Array of hooks fired before command execution
		executed : [], // Array of hooks fired after command execution
		error: [] // Array of hooks fired if the command has some error
	}
	response: "Pong!", // String or function(msg, args, client, commnad)
	responseDM: "Pong by DM!", // String or function(msg, args, client, commnad)
	run: async (msg, args, client, command){
		return msg.channel.createMesage('Pong by run function')
	}
}
```