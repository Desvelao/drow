You can extends your bot methods/funcionality or Eris structures throgh Aghanim Extension.

### Custom extensions: after instantiate your bot

You can create Components:

```js
//my_component.js
const { Component } = require('aghanim')

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
	messageReactionAdd(msg, emoji, userID, client){
		// do something when a reactions is added to one message
	}
}

module.exports = MyComponent
```

### Add your custom component to your bot
```js
	//index.js
	//bot defined...
	const MyComponent = require('./my_component.js')
	client.addComponent(MyComponent)

	const path = require('path')
	//You can import the file directly using addComponentFile method
	client.addComponentFile(path.join(__dirname, '/my_component.js'))

	//Or you can import a directory of components with addComponentDir method
	client.addComponentDir(path.join(__dirname + '/path/to/components_folder'))
```

### Component Object

Create a component as object
```js
//my_componnet.js
module.exports = {
	name: 'ping',
	constructor: (client, options) => {
		// do something when create component instance
	}
	ready: () => {
		console.log('My component is ready')
	}
	help: 'Get Pong!',
	messageCreate(msg, args, client, command){
		console.log(`Message: ${msg.content}`)
	}
	messageReactionAdd(msg, emoji, userID, client){
		// do something when a reactions is added to one message
	}
}
```

### Methods of events in components
These events will be fired of components:
  - `ready` (fired once)
  - `messageCreate`
  - `messageReactionAdd`
  - `messageReactionRemove`
  - `guildCreate`
  - `guildDelete`
  - `guildMemberAdd`
  - `guildMemberRemove`

For more info about client events go to [Eris](https://abal.moe/Eris/docs/Client#event-callCreate)

The arguments of these events are same Eris and added client as last. That means that if for example:
  - Eris event: messageReactionAdd(message, emoji, userID)
  - Aghanim event: messageReactionAdd(message, emoji, userID, client)

If you need listen more events of that Aghanim do by default you can do it

```js
client.on(eventName, handler)

// or if you want add Aghanim functionality through components
client.on(eventName, client.handleEvent(eventName)) // that add client as last argument to event handler of Eris event handler
```