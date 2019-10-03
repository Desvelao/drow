### Creating a bot

### Example

```js
//index.js
const Aghanim = require('aghanim')

const client = new Aghanim(
	'your_bot_token', // Token used to auth your bot account
    {
  		prefix: 'a!', // Prefix used to trigger commands
		helpMessage : ':information_source: __**AghanimBot help**__',
		helpDM : true, // Default help will use direct messages
		helpMessageAfterCategories : 'Use `a!help <category>` to see the others commands', //Message shown after categories in default help command
	}
)

// if it exists aghanim.config.js/json in project root, that configuration will be loaded before option object passed to instance initiation.

// too you can do
const { Client } = requie('aghanim')
const client = new Client(token, configuration)
```
