You can extends your bot methods/funcionality or Eris structures throgh Aghanim Extension.

### At start: same time you create the bot

Add in a array for `options.extensions`, the predefined extensions to load. See [Aghanim Extensions](link)

```js
	const bot = new Aghanim({
		prefix : 'a!',
		extensions : ['eris/message','eris/guild'] // load Message and Guild extensions from extensions/eris folder
	})
```

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
	messageCreate(msg, args, command){
		console.log(`Message: ${msg.content}`)
		// this.client is Aghanim Client instance. You can use it here
	}
}
```

### Add your custom component to your bot
```js
	//index.js
	//bot defined...
	const my_custom_extension = require('my_component')
	bot.addComponent(MyComponent)

	//You can import the file directly using addComponentFile method
	bot.addComponentFile(__dirname + 'my_component.js')

	//Or you can import a directory of components with addComponentDir method
	bot.addComponentDir(__dirname + 'path/to/components_folder')
```
