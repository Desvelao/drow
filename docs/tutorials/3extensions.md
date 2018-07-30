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

You can create Custom extensions:

```js
//my_custom_extension.js
const { Extension } = require('aghanim')
const Eris = require('eris')

module.exports = new Extension('my_custom_extension',function(bot){
	bot.sendMessageToFixChannel = function(content,file){ //add a custom method to your bot
		return this.createMessage('channel_id',content,file) //Return a promise
	}
	Eris.Message.prototype.reply = function(content,file){ //add a custom method to Eris.Message class.
		return this.channel.createMessage(content,file)
	}
})
```

`sendMessageToFixChannel` method will be added to your bot
`reply` method will be added to Eris.Message class. That means the object message will have this custom method.

### Add your custom extension to your bot
```js
	//index.js
	//bot defined...
	const my_custom_extension = require('my_custom_extension')
	bot.addExtension(my_custom_extension)

	//You can import the file directly using addExtensionFile method
	bot.addExtensionFile(__dirname + 'my_custom_extension.js')

	//Or you can import a directory of extensions with addExtensionDir method
	bot.addExtensionDir(__dirname + 'path/to/extension_folder')
```
