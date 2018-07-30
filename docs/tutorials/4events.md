You can add events that will be executed in Eris events.

### Define your event

```js
	//custom_event.js
	const { Event } = require('aghanim')
	module.exports = new Event('custom_event','messageCreate',{},function(message,args,command){
		//this = Aghanim.Client
		console.log(`${message.author.username} wrote ${message.content}`)
	})
```

### Add your event to bot

```js
	//index.js
	//bot defined..
	const custom_event = require('custom_event.js')
	bot.addEvent(custom_event) // Add a event
```

### Events
- [messageCreate](https://abal.moe/Eris/docs/Client#event-messageCreate)
- [messageReactionAdd](https://abal.moe/Eris/docs/Client#event-messageReactionAdd)
- [messageReactionRemove](https://abal.moe/Eris/docs/Client#event-messageReactionRemove)
- [guildCreate](https://abal.moe/Eris/docs/Client#event-guildCreate)
- [guildDelete](https://abal.moe/Eris/docs/Client#event-guildDelete)
- [guildMemberAdd](https://abal.moe/Eris/docs/Client#event-guildMemberAdd)
- [guildMemberRemove](https://abal.moe/Eris/docs/Client#event-guildMemberRemove)
- [ready](https://abal.moe/Eris/docs/Client#event-ready)

For rest of events, you need create a listener in the bot:

```js
	bot.on('other_eris_event',function(params){
		//doSomething
	})
```
