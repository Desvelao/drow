# Aghanim

**Aghanim** is a Command Client for create ***Discord*** bots with [Eris](https://github.com/abalabahaha/eris) in NodeJS based on [Yuuko](https://geo1088.github.io/yuuko)

__Author__ : [Desvelao^^](https://desvelao.github.io/profile/)  __Version__: `v0.1.0`

## Features
- Support for Subcommands (Command should be exist)
- Commands with user cooldown
- Add Components that can fire at some Eris events or add custom functionality to your bot

## Using the bot

Usage information for the bot (the usable commands, default configuration, and other help topics) can be found in the wiki [here](https://desvelao.github.io/aghanim/).

## Using the package

**Aghanim's core** is only available at [Github repository](https://github.com/Desvelao/aghanim). It extends [Eris](https://github.com/abalabahaha/eris) and is basically an alternative to its CommandClient class.

### Installation

```bash
$ npm install --save Desvelao/aghanim # npm
$ yarn add Desvelao/aghanim # yarn

# Dev branch
$ npm install --save Desvelao/aghanim#dev # npm
$ yarn add Desvelao/aghanim#dev # yarn

```

### Usage

```js
//index.js
const Aghanim  = require('aghanim')
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
  function (msg, args, client, command) {
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
	messageCreate(msg, args, client, command){
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
