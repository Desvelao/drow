## Aghanim

**Aghanim** is a Command Client created by [Desvelao^^](https://desvelao.github.io/profile/) for create bots with [Eris](https://github.com/abalabahaha/eris) in NodeJS based on [Yuuko](https://geo1088.github.io/yuuko)

**Version**: `v0.1.0`

### Using the package

**Aghanim's core** is only available at [Github repository](https://github.com/Desvelao/aghanim). It extends [Eris](https://github.com/abalabahaha/eris) and is basically an alternative to its CommandClient class.

### Installation

```bash
$ yarn add Desvelao/aghanim#dev # yarn
$ npm install --save Desvelao/aghanim#dev # npm
```

### Steps
1. [Create](./tutorial-2create-bot.html) a bot instance
2. Define your [Categories](tutorial-5categories.html)
3. Add [Commands/Subcommands](tutorial-3command.html)
4. Add [Components](tutorial-4components.html)
5. Add [Command Requirements](tutorial-6comamnd-requirements.html)

### Fast Example

```js
//index.js
const Aghanim = require('aghanim')
const { Command, Component }  = require('aghanim')

const client = new Aghanim(
	'your_bot_token', // Token used to auth your bot account
    {
  		prefix: 'a!', // Prefix used to trigger commands
	}
)

client.addCategory('Fun','Fun commands')

const pingCommand = new Command('ping', {
  category : 'Fun', help : 'Get Pong!', args : ''},
  function (msg,args,cmd) {
		//this = Aghanim.Client
  	msg.channel.createMessage('Pong!')
})

client.addCommand(pingCommand)

// Component:
class MyComponent extends Component{
	constructor(client, options) {
		super(client) // this.client is Aghanim Client instance. You can use in other methods
	}
	ready(){
		console.log('My component is ready')
	}
	messageCreate(msg, args, command){
		console.log(`Message: ${msg.content}`)
		// this.client is Aghanim Client instance. You can use it here
	}
}

client.addComponent(MyComponent)

// Bot connent
client.connect()
```

```bash
$ node index.js
```
