You can define your category methods. It should do before you add commands to your bot.

### Add a category

```js
	//index.js
	//bot defined...
	// Add a category with name "Fun"
	client.addCategory('Fun', // Category name
	'List of fun commands', ) // Description
	{hide: false}) // options (optional). options.hide is false by default. Hide category of help default command. 
```
