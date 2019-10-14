const CommandRequirements = require('./requirements')
/** Class representing a command. */
class Command {
	/**
   * Create a command.
   * @class
   * @param {string|Array} name - The name of the command. If passed as an
   *     array, the first item of the array is used as the name and the rest of
   *     the items are set as aliases.
   * @param {object} options - Options of command
   * @param {boolean} [options.guildOnly=false] - Command only can works in guilds
   * @param {boolean} [options.dmOnly=false] - Command only can works in dm messages
   * @param {string|array} [options.userOnly=false] - Command only can works in these users
   * @param {boolean} [options.ownerOnly=false] - Command only can works in bot owner
   * @param {string|array} [options.roles=false] - Command only can works in guilds
   * and members with roles
   * @param {Command~check} [options.check=null] - Command only can works if this
   * funciton return true
   * @param {array|object} [options.permissions=null] - Command only can works if member
   * in fuild has permissions
   * @param {object} [options.userCooldown={}] - User cooldown
   * @param {number} [options.userCooldown.time] - Time in seconds
   * @param {string | function} [options.userCooldown.message='Not yet! Ready in **<cd>**s'] - Message sent if command is in cooldown for that user
   * @param {object} [options.guildCooldown={}] - Guild cooldown
   * @param {number} [options.guildCooldown.time] - Time in seconds
   * @param {string | function} [options.guildCooldown.message='Not yet! Ready in **<cd>**s'] - Message sent if command is in cooldown for that guild
   * @param {object} [options.channelCooldown={}] - Guild cooldown
   * @param {number} [options.channelCooldown.time] - Time in seconds
   * @param {string | function} [options.channelCooldown.message='Not yet! Ready in **<cd>**s'] - Message sent if command is in cooldown for that guild
   * @param {string} [options.childOf=undefined] -
   * Name of command that this commad is subcommand. It needs exists.
   * @param {string} [options.category='Default'] - Category from this command
   * @param {string} [options.help=''] - Description of command
   * @param {string} [options.args=''] - The command arguments
   * @param {boolean} [options.hide=false] - Hide command from default help command
   * @param {boolean} [options.enable=true] - Enable/Disable the command
   * @param {boolean} [options.await=false] - Await to resolve the command for put cooldown
	 *
   * @param {Command~run} run - The function to be called when the command is executed.
   */
	constructor(name, options = {}, run) {
		if (Array.isArray(name)) {
			/** @prop {string} - Name of Command */
			[this.name] = name.splice(0, 1)
			/** @prop {string[]} - Command aliases */
			this.aliases = name
		} else if(typeof(name) === "string") {
			this.name = name
			this.aliases = []
		} else if(typeof(name) === "object") {
			options = name
			if (Array.isArray(options.name)) {
				[this.name] = options.name.splice(0, 1)
				this.aliases = options.name
			} else if(typeof(options.name) === "string") {
				this.name = options.name
				this.aliases = []
			}
		}
		if (!this.name) throw new Error('Name is required')
		/** @prop {Command~run} - Run function of command */
		this.run = run || options.run || async function(){}
		/** @prop {string} - Description of command */
		this.help = options.help || ''
		/** @prop {Command | undefined} - Parent Command */
		this.parent = undefined
		/** @prop {Command[]} - Subcommands of Command. */
		this.childs = []
		/** @prop {array} - Command Requirements */
		this.requirements = options.requirements || [] // TODO:secure is array or convert one to array
		/** @prop {object} - Command Hooks */
		this.hooks = options.hooks || { // TODO:secure is array or convert one to array and hooks structure
			executed: []
		}
		/** @prop {string|undefined} - Name of uppercomand */
		this.childOf = options.childOf
		/** @prop {string} - Command category. It should exist if not, will be 'Default' */
		this.category = options.category || 'Default'
		/** @prop {string} - Arguments for a command */
		this.args = options.args || ''
		/** @prop {boolean} - Hide to default help command */
		this.hide = options.hide !== undefined ? options.hide : false // Hide command from help command
		/** @prop {boolean} - Enable/Disable the command */
		this.enable = options.enable !== undefined ? options.enable : true // Enable or disable command
		/** @prop {Client} - Client instance */
		this.client = undefined
	}

	/**
    * @callback Command~run
    * A function to be called when a command is executed. Accepts information
    * about the message that triggered the command as arguments.
    * @param {Eris.Message} msg - The Eris message object that triggered the command.
    *     For more information, see the Eris documentation:
    *     {@link https://abal.moe/Eris/docs/Message}
    * @param {args} args - An array of arguments passed to the command,
    *     obtained by removing the command name and prefix from the message, then
    *     splitting on spaces. To get the raw text that was passed to the
    *     command, use `args.join(' ')`.
	* @param {Client} client client instance that recieved the message triggering the
    *     command.
    * @param {Command} command - The name or alias used to call the command in
    *     the message. Will be one of the values of `this.names`.
    */

	/**
	* @callback Command~check
	* A function to be called before execute a coomand.
	* It's a custom requirement to execute the command. It should return true or false
	* @param {Eris.Message} msg - The Eris message object that triggered the command.
	*     For more information, see the Eris documentation:
	*     {@link https://abal.moe/Eris/docs/Message}
	* @param {args} args - An array of arguments passed to the command,
	*     obtained by removing the command name and prefix from the message, then
	*     splitting on spaces. To get the raw text that was passed to the
	*     command, use `args.join(' ')`.
	* @param {Client} client client instance that recieved the message triggering the
    *     command.
	* @param {Command} command - The name or alias used to call the command in
	*     the message. Will be one of the values of `this.names`.
	*/

	/**
	* All names that can be used to invoke the command - its primary name in
	* addition to its aliases.
	* @return {Array<string>}
	*/
	get names() {
		return [this.name, ...this.aliases]
	}

	/** Register a requirement */
	addRequirement(requirement) {
		console.log(`Adding command requirement ${requirement.type} for ${this.name}`)
		requirement.remove = () => this.removeRequirement(requirement)
		this.requirements.push(requirement)
		if(requirement.init){
			requirement.init(this.client, this, requirement)
		}
	}

	/** Register a requirement */
	removeRequirement(requirement) {
		this.requirements = this.requirements.filter(requirement)
	}

	runHook(hookname, ...args){
		this.hooks[hookname].forEach(hook => hook(...args))
	}

	async checkRequirements(msg, args, client, command){
		if(!command.enable){ return false}
		return this.requirements.reduce(async (result, requirement) => {
			if(await !result){ return Promise.resolve(false) }
			if(typeof(requirement) === 'object'){
				const pass = (await requirement.condition(msg, args, client, command, requirement))
				if(pass === false || (Array.isArray(pass) && pass[0] === false)){
					const ctx = pass && pass[1]
					if(["string", "object"].includes(typeof(requirement.response))){
						await msg.channel.createMessage(requirement.response) // Response to message
					}else if(typeof(requirement.response) === "function"){
						const res = await requirement.response(msg, args, client, command, requirement, ctx) 
						await msg.channel.createMessage(res) // Response to message
					}else if(["string", "object"].includes(typeof(requirement.responseDM))){
						await msg.author.getDMChannel().then(channel => channel.createMessage(requirement.responseDM)) // Response with a dm
					}else if(typeof(requirement.response) === "function"){
						const res = await requirement.responseDM(msg, args, client, command, requirement, ctx) 
						await msg.author.getDMChannel().then(channel => channel.createMessage(res)) // Response with a dm
					}else if(typeof(requirement.run) === "function"){
						await requirement.run(msg, args, client, command, requirement, ctx) // Custom
					}
					return Promise.resolve(false)
				}
			}
			return Promise.resolve(result)
		}, Promise.resolve(true))
	}

	/** Throw a command error */
	error(message) {
		throw new Error(message)
	}
}


module.exports = Command
