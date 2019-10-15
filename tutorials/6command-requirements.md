You can create command requirements for each command or use builtin command requirements creators

- <a href="#add-requirement">Add a requirement</a>
- <a href="#define-user-requirement">Define user builtin requirements</a>
- <a href="#builtin-requirement">Builtin requirements creators</a>

### <div id="add-requirement">Add a requirement</div>

```js
// Defining a command as object
module.exports = {
	name: "onlymecmd", // command.name
	requirements: [
		{
			type: "onlyme" // set a type/name
			condition: (msg, args, client, command, requirement) => { // function to evaluate. if returns false do first of response/responseDM/run methods
				return msg.author.id === "mydiscordid"
				// return null to ignore response/responseDM/run methods if some these aren't undefined
				// you can return a context of this function if you return an array as [passCondition, conditionReqContext]
				// for this example, you want to return author id to use in response/responseDM/run methods
				// return [msg.author.id === "mydiscordid", {authorID: msg.author.id}]
			}
			response: "You don't have permissions to execute this command" // string/function<string/embed> => reply that string
			// reponse can be a function too
			// response: (msg, args, client, command, requirement, conditionReqContext) => returns string/embed
			// response: (msg, args, client, command, requirement, conditionReqContext) => "You don't have permissions to execute this command created by function"
			responseDM: "DM: You don't have permissions to execute this command" // string/function<string/embed> => reply that string with a direct message
			// reponseDM can be a function too
			// responseDM: (msg, args, client, command, requirement, conditionReqContext) => returns string/embed
			// responseDM: (msg, args, client, command, requirement, conditionReqContext) => "DM: You don't have permissions to execute this command created by function"
			run: // custom function run(msg, args, client, command, requirement, conditionReqContext)
			init: (client, command, requirement) => { 
				// do something when this requirement is added to commnad, for example add a hook to command
			}
			// You can add other props to be accesible through requirement variable
		}
		// You can add more requirements to check. Resply with first requirement failed to pass
	]
	run: (msg, args, client, command) => msg.channel.createMessage("This is my command") // If pass all command requirements, this will be run
}
```
### <div id="define-user-requirement">Define user builtin requirements</div>
Define a custom requirement or set of them to import easily from a command definition

```js
client.defineCommandRequirement(requirement) // requirement can be a object or a function

// Requiment object
client.defineCommandRequirement({
	type: 'my.requirement', // name to inject in commands if these have it as requirement
	condition: (msg, args, client, command, requirement) => { // Returns false to run first of response/responseDM/run actions
		return msg.author.id === "mydiscordID"
		// return null to ignore response/responseDM/run methods if some of these are defined
		// return [true/false, conditionReqContext] to fail requirement and pass a context to response/responseDM/run actions
	}
	response: "You can't use this commnad"
})

// Requirement function
client.defineCommandRequirement(function guildadmin({command, client}){ // function name will be the name to inject in commands
	// should be return a requirement or array of requirement (useful to pack multiple requirements as one)
	return {
		type: 'my.requirement', // name to inject in commands if these have it as requirement
		condition: (msg, args, client, command, requirement) => { // Returns false to run first of response/responseDM/run actions
			return msg.author.id === "mydiscordID"
			// return null to ignore response/responseDM/run methods if some of these are defined
			// return [true/false, conditionReqContext] to fail requirement and pass a context to response/responseDM/run actions
		}
		response: "You can't use this commnad"
	}
	// or return array of requirements
	return [
		{
			type: 'only.for.guild',
			condition: (msg, args, client, command, requirement) => {
				return msg.channel.guild && true // remember return true/false/null/[true/false, context]
			}
			response: "Sorry this command is only avaliable in guilds"
		},
		{
			type: 'member.with.role',
			condition: (msg, args, client, command, requirement) => {
				const member = msg.channel.guild.members.get(msg.author.id)
				if(!member){return false}
				let { role } = req
				role = role.map(r => r.toLowerCase())
				return member.roles.some( r => roles.includes(msg.channel.guild.roles.get(r).name.toLowerCase()) )
			},
			role: "admin"
			response: "Sorry this command is only for admins"
		}
		// You can inject some builtin commands requirements or user defined too
	]
})

// injecting a defined command requirement in command
module.exports = {
	name: "admin", // command.name
	requirements: ["guildadmin"] // will inject requirements defined below
	run: async (msg, args, client, command) => {
		// do something
	}
}
```

### <div id="builtin-requirement">Builtin requirements creators</div>

These are functions builtin that create requirements objects. To use them:

```js
// Defining a command as object
module.exports = {
	name: "server", // command.name
	requirements: [
		{
			type: "guild.only" // "guild.only" is a builtin requirement. this requirement only allow execution if message coming from a guild.
			// This object is passed to a command requirement creator function that returns a requirement object
			response: "This command only avaliable in guild" // Resplye with that if message doesn't come from a guild
			// responseDM: or reply with a dm
			// run: or create a custom funcition 
		}
		// You can add more requirements to check. Resply with first requirement failed to pass
	]
	run: (msg, args, client, command) => msg.channel.createMessage("This is my command") // Run this pass all requirements
}
```

#### Command requirements creators:

- Channels/Guilds/Users allow/deny:
	- `channel.allow`: allow command on channels whose ids are on channels property
	- `channel.deny`: deny command on channels whose ids are on channels property
	- `guild.allow`: allow command on channels whose ids are on channels property
	- `guild.deny`: deny command on channels whose ids are on channels property
	- `user.allow`: allow command on channels whose ids are on channels property
	- `user.deny`: deny command on channels whose ids are on channels property
		```js
		{
		// command definition...
			requirements : [
				{
					type: 'channel.allow', // map to the builtin requirement creator. Same interface for requirements from below
					store: [], // array of strings channles ids
					response, // optional
					responseDM, // optional
					run, // optional
				}
			]
		}
		```
- Channels/Guilds/Users cooldown:
	- `channel.cooldown`: allow command on channels if is not in cooldown
	- `guild.cooldown`: allow command on channels if is not in cooldown
	- `user.cooldown`: allow command on channels if is not in cooldown
		```js
		{
		// command definition...
			requirements : [
				{
					type: 'channel.cooldown', // map to the builtin requirement creator. Same interface for requirements from below
					time: 60, // cooldown time in seconds. Set after a suscefully command execution
					response, // optional
					responseDM, // optional
					run, // optional
				}
			]
		}
		```

- Member
	- `member.has.permisions`: allow command on guild for member with permissions
		```js
		{
		// command definition...
			requirements : [
				{
					type: 'member.has.permisions', // map to the builtin requirement creator.
					permissions: { // permision json. See more on <a href="#add-requirement">Add a requirement</a> https://abal.moe/Eris/docs/Permission
						manageMessages: true,
					}
					response, // optional
					responseDM, // optional
					run, // optional
				}
			]
		}
		```

	- `member.has.role`: allow command on guild for member with a role or some of array of roles.
		```js
		{
		// command definition...
			requirements : [
				{
					type: 'member.has.permisions', // map to the builtin requirement creator.
					role: "Admin", // no case sensitive. Admit pass an array of role names
					response, // optional
					responseDM, // optional
					run, // optional
				}
			]
		}
		```

- Miscelaneous
	- `dm.only`: allow command on direct message only
	- `guild.only`: allow command on guild only
	- `owner.only`: allow command for bot owner only

		```js
		// object definition...
		{
			requirements : [
				{
					type: 'dm.only', // map to the builtin requirement creator.
					response, // optional
					responseDM, // optional
					run, // optional
				},
				//or
				'dm.only' // if you dont want configure responses or run methods
			]
		}
		```
