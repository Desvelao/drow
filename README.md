**Aghanim** is a Command Client for create bots with [Eris](https://github.com/abalabahaha/eris) in JavaScript based on [Yuuko](https://geo1088.github.io/yuuko)

## Using the bot

Usage information for the bot (the usable commands, default configuration, and other help topics) can be found in the wiki [here](https://github.io/Desvelao/aghanim/wiki).

## Using the package

Aghanim's core is only available at [Github](https://github.com/Desvelao/aghanim). It extends [Eris](https://github.com/abalabahaha/eris) and is basically an alternative to its CommandClient class.

### Installation

```bash
$ yarn add Desvelao/aghanim#dev # yarn
$ npm install --save Desvelao/aghanim#dev # npm
```

### Usage

```js
const Aghanim, { Command, Watcher } = require('aghanim')

const bot = new Aghanim(
	'your_bot_token', // Token used to auth your bot account
    {
  		prefix: 'a!', // Prefix used to trigger commands
	}
)

bot.defineCategories([
  {name : 'Fun', help : 'Fun commands! :)'}
])

const pingCommand = new Command('ping', {
  category : 'Fun', help : 'Get Pong!', args : ''},
  function (msg,args,cmd) {
  	msg.channel.createMessage('Pong!')
})

bot.addCommand(pingCommand)

// Watchers: executed for no commands actions
const simpleWatcher = new Watcher(
  'my_watcher', // Watcher's name
  'messageCreate', // Watcher's event (same ErisJS)
  function(msg,args,command){
	   if(msg.channel.type === 0){console.log('Message received in a guild!')
	})

bot.addWatcher(simpleWatcher)

bot.connect()
```

```bash
$ node index.js
```
