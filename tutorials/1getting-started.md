## Aghanim

**Aghanim** is a Command Client created by [Desvelao^^](https://desvelao.github.io/profile/) for create bots with [Eris](https://github.com/abalabahaha/eris) in NodeJS based on [Yuuko](https://geo1088.github.io/yuuko)

**Version**: `v0.0.1`

### Using the package

**Aghanim's core** is only available at [Github repository](https://github.com/Desvelao/aghanim). It extends [Eris](https://github.com/abalabahaha/eris) and is basically an alternative to its CommandClient class.

### Installation

```bash
$ yarn add Desvelao/aghanim#dev # yarn
$ npm install --save Desvelao/aghanim#dev # npm
```

### Steps
1. [Create](./create-bot.html) a bot instance
2. Define your [Categories](tutorial-categories.html)
4. Add [Commands/Subcommands](tutorial-commands.html)
5. Add [Components](tutorial-components.html)
6. Connect bot

### Fast Example

```js
//index.js
const Aghanim = require('aghanim')
const { Command, Component }  = require('aghanim')

const bot = new Aghanim(
	'your_bot_token', // Token used to auth your bot account
    {
  		prefix: 'a!', // Prefix used to trigger commands
	}
)

bot.addCategory('Fun','Fun commands')

const pingCommand = new Command('ping', {
  category : 'Fun', help : 'Get Pong!', args : ''},
  function (msg,args,cmd) {
		//this = Aghanim.Client
  	msg.channel.createMessage('Pong!')
})

bot.addCommand(pingCommand)

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

bot.addComponent(MyComponent)

// Bot connent
bot.connect()
```

```bash
$ node index.js
```
