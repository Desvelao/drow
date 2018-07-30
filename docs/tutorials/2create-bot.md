### Creating a bot

### Example

```js
//index.js
const Aghanim = require('aghanim')

const bot = new Aghanim(
	'your_bot_token', // Token used to auth your bot account
    {
  		prefix: 'a!', // Prefix used to trigger commands
			extensions : ['eris/message','eris/guild'], // Load Aghanim Extensions for Eris.Message and Eris.Guild {@link Command}
			helpMessage : ':information_source: __**AghanimBot help**__',
			helpDM : true, // Default help will use direct messages
			helpMessageAfterCategories : 'Use `a!help <category>` to see the others commands', //Message shown after categories in default help command
	}
)
```
