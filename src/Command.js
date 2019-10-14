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
   * @param {string} [options.childOf=undefined] -
   * Name of command that this commad is subcommand. It needs exists.
   * @param {string} [options.category='Default'] - Category from this command
   * @param {string} [options.help=''] - Description of command
   * @param {string} [options.args=''] - The command arguments
   * @param {boolean} [options.hide=false] - Hide command from default help command
   * @param {boolean} [options.enable=true] - Enable/Disable the command
   * @param {string} [options.childOf=undefined] - Parent command name
   * @param {Array} [options.requirements=[]] - Requirements are mapped in client.addCommand
   * @param {object} run - The function to be called when the command is executed.
   * @param {string | function | EmbedMessageObject } response - Response to command. Ignore run function.
   * @param {string | function | EmbedMessageObject } responseDM - DM response to command. Ignore run function.
   * @param {object} [options.hooks = {}] - Command hooks.
   * @param {Array<function>} [options.hooks.pre=[]] - Hook pre run command.
   * @param {Array<function>} [options.hooks.executed=[]] - Hook after run command.
   * @param {Array<function>} [options.hooks.error=[]] - Hook fired when there an error with execution command.
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
		/** @prop {string | EmbedMessageObject | function } - Response of command. If it exists, ignore run function. If function (msg, args, client, commad) */
		this.response = options.response || ''
		/** @prop {string | EmbedMessageObject | function } - Response of command with a direct message. If it exists, ignore run function. If function (msg, args, client, commad) */
		this.responseDM = options.responseDM || ''
		/** @prop {Command | undefined} - Parent Command */
		this.parent = undefined
		/** @prop {Command[]} - Subcommands of Command. */
		this.childs = []
		/** @prop {array} - Command Requirements */
		this.requirements = Array.isArray(options.requirements) ? options.requirements : [] // These requirements are mapped in client.addCommand
		/** @prop {object} - Command Hooks */
		this.hooks = {
			pre: [], // Fired before run command
			executed: [], // Fired after command is run
			error: [] // Fired when there is an error running pre/executed hooks and response/run methods
		}
		if(options.hooks && typeof(options.hooks) === 'object'){
			Object.keys(this.hooks).forEach(key => {
				const hook = this.hooks[key]
				if(typeof(hook) !== 'function') throw new TypeError(`${hook} is not a function on ${this.name}`)
				this.addHook(key, hook)
			})
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
		/** @prop {object | undefined} - Custom props */
		this.custom = undefined
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

	/** Add a requirement
	* @param {object} requirement - Requirement to add. Inject a method to remove it.
	*/
	addRequirement(requirement) {
		requirement.remove = () => this.removeRequirement(requirement)
		this.requirements.push(requirement)
		if(requirement.init){
			requirement.init(this.client, this, requirement)
		}
	}

	/** Remove a requirement
	* @param {object} requirement - Requirement to remove.
	*/
	removeRequirement(requirement) {
		this.requirements = this.requirements.filter(req => req !== requirement)
	}

	/** Run a hooks by hookname
	* @param {string} hookname - Hook name.
	* @param {object} args - Arguments passed to hook
	*/
	runHook(hookname, ...args){
		this.hooks[hookname].forEach(hook => hook(...args))
	}

	/** Add a hook
	* @param {string} hookname - Hook name.
	* @param {object} hook - Hook to add.Inject a method to remove it.
	*/
	addHook(hookname, hook){
		if(!this.hooks[hookname]){throw new Error(`Add command hook error: ${hookname} not defined on ${this.name} command`)}
		hook.remove = () => this.removeHook(hookname, hook)
		this.hooks[hookname].push(hook)
	}

	/** Remove a hook
	* @param {string} hookname - Hook name.
	* @param {object} hook - Hook to remove.
	*/
	removeHook(hookname, hook){
		if(!this.hooks[hookname]){throw new Error(`Add command hook error: ${hookname} not defined on ${this.name} command`)}
		this.hooks[hookname] = this.hooks[hookname].filter(h => h !== hook)
	}

	async checkRequirements(msg, args, client, command){
		if(!command.enable){ return false}
		return this.requirements.reduce(async (result, requirement) => {
			if(!(await result)){ return Promise.resolve(false) }
			if(typeof(requirement) === 'object'){
				const pass = await requirement.condition(msg, args, client, command, requirement)
				console.log('ReqType', requirement.type, pass)
				if(pass === false || pass === null || (Array.isArray(pass) && pass[0] === false)){
					if(pass !== null){ // ignore response/run if requirement returns null
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
