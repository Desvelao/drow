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
   * @param {string|array} [options.rolesCanUse=false] - Command only can works in guilds and members with roles
   * @param {Command~check} [options.check=null] - Command only can works if this funciton return true
   * @param {array|object} [options.permissions=null] - Command only can works if member in fuild has permissions
   * @param {number} [options.cooldown=null] - Time in seconds
   * @param {string} [options.cooldownMessage='Not yet! Ready in **<cd>**s'] - Message sent if command is in cooldown for that user
   * @param {string} [options.subcommandFrom=undefined] - Name of command that this commad is subcommand. It needs exists.
   * @param {string} [options.category='Default'] - Category from this command
   * @param {string} [options.help=''] - Description of command
   * @param {string} [options.args=''] - The command arguments
   * @param {boolean} [options.hide=false] - Hide command from default help command
   * @param {boolean} [options.enable=true] - Enable/Disable the command
   * @param {boolean} [options.await=false] - Await to resolve the command for put cooldown
	 *
   * @param {Command~process} process - The function to be called when the command is executed.
   */
	constructor (name, options, process) {
		if (Array.isArray(name)) {
			/** @prop {string} - Name of Command*/
			this.name = name.splice(0, 1)[0]
			/** @prop {string[]} - Command aliases*/
			this.aliases = name
		} else {
			this.name = name
			this.aliases = []
		}
		if (!this.name) throw new TypeError('Name is required')
		/** @prop {Command~process} - Process of command*/
		this.process = process
		if (!this.process) throw new TypeError('Process is required')
		/** @prop {string} - Description of command*/
		this.help = options.help || ''
		/** @prop {Command[]} - Subcommands of Command.*/
		this.subcommands = []
		/** @prop {Command} - Upper Command*/
		this.upcommand = undefined
		/** @prop {boolean} - Command responds to guilds messages*/
		this.guildOnly = options.guildOnly || false
		/** @prop {boolean} - Command responds to dm messages*/
		this.dmOnly = options.dmOnly || false
		/** @prop {boolean} - Command responds to specific users messages*/
		this.userOnly = typeof(options.userOnly) === 'string' ? [options.userOnly] : (Array.isArray(options.userOnly)) ? options.userOnly : false
		/** @prop {boolean} - Command responds to owner messages*/
		this.ownerOnly = options.ownerOnly || false
		/** @prop {string[]} - Command responds to specific members with roles, Message should be sent from a guild*/
		this.rolesCanUse = options.rolesCanUse || false
		/** @prop {Command~check} - Custom requirements to execute the command*/
		this.check = options.check || null
		/** @prop {string[]} - Array of permissions in strings*/
		this.permissions = options.permissions || null
		/** @prop {string} - Time in seconds that Command has cooldown for a user*/
		this.cooldown = options.cooldown || null
		this.cooldowns = {}
		/** @prop {string} - Message to responds when a Command is on cooldown. Replace "<cd>" for seconds remaining*/
		this.cooldownMessage = options.cooldownMessage || 'Not yet! Ready in **<cd>**s'
		/** @prop {string} - Name of uppercomand*/
		this.subcommandFrom = options.subcommandFrom
		/** @prop {string} - Command category. It should exist if not, will be 'Default'*/
		this.category = options.category || 'Default'
		/** @prop {string} - Arguments for a command*/
		this.args = options.args || ''
		/** @prop {boolean} - Hide for a default help Command*/
		this.hide = options.hide !== undefined ? options.hide : false //Hide command from help command
		/** @prop {boolean} - Enable/Disable the command*/
		this.enable = options.enable !== undefined ? options.enable : true //Enable or disable command
		/** @prop {boolean} - Await the execution. (cooldown purposes)*/
		this.await = options.await !== undefined ? options.await : false //Await result comand and warning if return is undefined
	}

	 /**
    * @callback Command~process
    * A function to be called when a command is executed. Accepts information
    * about the message that triggered the command as arguments.
    * @this {Client} The client instance that recieved the message triggering the
    *     command.
    * @param {Eris.Message} msg - The Eris message object that triggered the command.
    *     For more information, see the Eris documentation:
    *     {@link https://abal.moe/Eris/docs/Message}
    * @param {args} args - An array of arguments passed to the command,
    *     obtained by removing the command name and prefix from the message, then
    *     splitting on spaces. To get the raw text that was passed to the
    *     command, use `args.join(' ')`.
    * @param {Command} command - The name or alias used to call the command in
    *     the message. Will be one of the values of `this.names`.
    */

		/**
     * @callback Command~check
     * A function to be called before execute a coomand. It's a custom requirement to execute the command. It should return true or false
     * @param {Eris.Message} msg - The Eris message object that triggered the command.
     *     For more information, see the Eris documentation:
     *     {@link https://abal.moe/Eris/docs/Message}
     * @param {args} args - An array of arguments passed to the command,
     *     obtained by removing the command name and prefix from the message, then
     *     splitting on spaces. To get the raw text that was passed to the
     *     command, use `args.join(' ')`.
     * @param {Command} command - The name or alias used to call the command in
     *     the message. Will be one of the values of `this.names`.
     */

	/**
   * All names that can be used to invoke the command - its primary name in
   * addition to its aliases.
   * @return {Array<string>}
   */
	get names () {
		return [this.name, ...this.aliases]
	}
	/**
	 * Get cooldown for user
	 * @param  {string} id - User id
	 * @return {number}    - Time in seconds that command is in cooldown for that user
	 */
	getCooldown(id){
		return this.cooldowns[id] - Math.round(new Date().getTime()/1000)
	}

	/**
	 * Set cooldown for user
	 * @param {string} id - User id
	 * @param {number} [cd] - Set cooldown. If cd is defined, set to timestamp, else add cooldown to now
	 */
	setCooldown(id,cd){
		this.cooldowns[id] = cd !== undefined ? cd : Math.round(new Date().getTime()/1000) + this.cooldown
	}

	static awaitReject(){return Promise.reject()} //Evade setCooldown

	/** Throw a command error*/
	error(message){
		return Promise.reject(`<${this.name}> error: ${message}`)
		// throw new Error(`Error: ${this.name} failed!`)
	}

}

module.exports = Command
