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
2. *(optional)* Load [Custom Extensions](./custom-extensions.html)
3. *(optional)* Set custom events to Eris events
3. Define your Categories
4. Add Commands.
5. *(optional)* Add subcommands
6. Connect bot

### Fast Example

```js
//index.js
const Aghanim = require('aghanim')
const { Command, Event }  = require('aghanim')

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

// Event: executed for no commands actions. Same Eris.
const simpleEvent = new Event(
  'simpleEvent', // Event's name
  'messageCreate', // Event's event (same ErisJS)
  function(msg,args,command){
		//this = Aghanim.Client
	  if(msg.channel.type === 0){console.log('Message received in a guild!')}
	})

bot.addEvent(simpleEvent)

bot.connect()
```

```bash
$ node index.js
```
