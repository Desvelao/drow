const Eris = require('eris')
const glob = require('glob')
const Logger = require('another-logger')
const Command = require('./Command')
const Category = require('./Category')
const Component = require('./Component')
const reload = require('require-reload')(require)

const DEFAULT_CATEGORY = 'Default'

// Logger
const logger = new Logger({
	label: 'Aghanim',
	timestamps: true,
	levels: { dev: { style: 'magenta' } },
	// ignoredLevels: [this.devLogs ? '' : 'dev']
})
/**
 * Aghanim Client extends from Eris.Client
 * @extends Eris.Client
 */
class Client extends Eris.Client {
	/**
	* Create a client instance.
	* @class
	* @param {string} token - The token used to log into the bot.
	* @param {Object} options - Options to start the client with. This object is also passed to Eris.
	* @param {string} options.prefix - The prefix the bot will respond to in
	*     guilds for which there is no other confguration. (Currently everywhere)
	* @param {boolean} [options.allowMention = false] - Whether or not the bot can respond
	*     to messages starting with a mention of the bot.
	* @param {boolean} [options.ignoreBots = true] - Whether or not the bot ignoresBots. Default: true
	* @param {number} options.logLevel - The minimum message level for logged events in the console.
	* @param {string} [options.helpMessage = '**Help**'] - Title for default command help Message
	* @param {string} [options.helpMessageAfterCategories = '**Note**: Use \`${options.prefix}help <category>\` to see those commands'] - Message after categories in default command help message are shown
	* @param {boolean} [options.helpDM = true] - Active direct message to default command help
	* @param {boolean} [options.helpEnable = true] - Enable/disable default command help
	* @param {boolean} [options.devLogs = false] - Enable/disable default command help
	*/
	constructor(token, options = {}) {
		// Attempt to load options from aghanim.config.js(on) file
		try {
			options = require(`${process.cwd()}/aghanim.config`) /* eslint import/no-dynamic-require : "off", global-require : "off", no-param-reassign : "off" */
			logger.info('Found Aghanim default config file: aghanim.config.js(on)')
		} catch (err) {
			logger.info('Not found Aghanim default config file: aghanim.config.js(on)')
		}
		super(token, options)
		this.devLogs = options.devLogs || false
		// options.disableHelp = options.disableHelp || false
		logger._config.ignoredLevels = [this.devLogs ? '' : 'dev']

		/** @prop {string} - The prefix the bot will respond to in guilds
		 * for which there is no other confguration. */
		this.defaultPrefix = options.prefix
		/** @prop {Command[]} - An array of commands the bot will respond to. */
		this.commands = []
		/** @prop {Category[]} - Categories for commands. */
		this.categories = []
		/** @prop {Object<Component>} - Componnents. */
		this.components = {}
		/** @prop {Object} - Setup */
		this.setup = {}

		this._ready = false
		if (this.defaultPrefix === '') {
			throw new Error('Prefix has not defined!')
		}
		/** @prop {boolean} - Whether or not the bot can respond to messages
		 * starting with a mention of the bot. Defaults to true. */
		this.allowMention = options.allowMention === null ? false : options.allowMention
		/** @prop {boolean} - Whether or not the bot ignores messages
		*sent from bot accounts. Defaults to true. */
		this.ignoreBots = options.ignoreBots == null ? true : options.ignoreBots

		this.on('ready', () => {
			if (this._ready) { return }
			this._ready = true
			/**
			 * @prop {RegExp} - The RegExp used to tell whether or not a message starts
			 *     with a mention of the bot. Only present after the 'ready' event.
			 */
			this.mentionPrefixRegExp = new RegExp(`^<@!?${this.user.id}>\\s?`)

			this.getOAuthApplication().then((app) => {
				/**
				 * @prop {object} - The OAuth application information returned by
				 *     Discord. Present some time after the ready event.
				 * @prop {string} description - Discord App description
				 * @prop {string} name - Discord App name
				 * @prop {string} owner - Discord App owner
				 * @prop {string} owner.id - Owner ID
				 * @prop {string} owner.username - Owner username
				 * @prop {string} owner.discriminator - Owner discriminator
				 * @prop {string} owner.avatar - Owner avatar
				 * @prop {boolean} bot_public - If app is public
				 * @prop {boolean} bot_require_code_grant -
				 * @prop {string} id - Discord App id
				 * @prop {string} icon - Discord App icon
				 */
				this.app = app
				/**
				 * [owner description]
				 * @prop {string} id - Owner ID
				 * @prop {string} username - Owner username
				 * @prop {string} discriminator - Owner discriminator
				 * @prop {string} avatar - Owner avatar
				 * @prop {ClientOwner~send} send - Send a message to Owner
				 */
				this.owner = Object.assign({}, this.app.owner)
				this.getDMChannel(this.owner.id).then((channel) => {
					/**
					 * Function to send messages to owner
					 * @callback ClientOwner~send
					 * @param  {string|object} content - Message content to send
					 * @param  {object} file - Message content to send
					 */
					this.owner.send = function ownerSend(content, file) { channel.createMessage(content, file) }
				})

				this._handleEvent('ready')()
			})		
		}).on('error', (err) => {
			logger.error(err)
			// this.emit('aghanim:error')
		}).on('messageCreate', this.handleMessage)
			.on('messageReactionAdd', this._handleEvent('messageReactionAdd'))
			.on('messageReactionRemove', this._handleEvent('messageReactionRemove'))
			.on('guildCreate', this._handleEvent('guildCreate'))
			.on('guildDelete', this._handleEvent('guildDelete'))
			.on('guildMemberAdd', this._handleEvent('guildMemberAdd'))
			.on('guildMemberRemove', this._handleEvent('guildMemberRemove'))

		this.setup.helpMessage = `${options.helpMessage || '**Help**'}\n\n`
		this.setup.helpMessageAfterCategories = `${options.helpMessageAfterCategories || `**Note**: Use \`${this.defaultPrefix}help <category>\` to see those commands`}\n\n`
		this.setup.helpDM = options.helpDM || false
		if (!options.disableHelp) {
			// Add default help command to bot
			this.addCommand(new Command('help', {}, (msg, args, command) => {
				const categories = this.categories.map(c => c.name.toLowerCase())
				const query = args.from(1).toLowerCase();
				let { helpMessage } = this.setup
				if (categories.includes(query)) {
					const cmds = this.getCommandsFromCategories(query)
					const prefix = this.defaultPrefix
					if (!cmds) {
						helpMessage += this.categories.filter((c) => !c.hide)
							.map((c) => `**${c.name}** \`${this.defaultPrefix}help ${c.name.toLowerCase()}\` - ${c.help}`)
							.join('\n') + '\n\n' + this.setup.helpMessageAfterCategories}
					else {
						helpMessage += cmds.filter(c => !c.hide).map(c => {
							return `\`${prefix}${c.name}${c.args ? ' ' + c.args : ''}\` - ${c.help}${c.subcommands.length ? '\n' + c.subcommands.filter(s => !s.hide).map(s => `  · \`${s.name}${s.args ? ' ' + s.args : ''}\` - ${s.help}`).join('\n') : ''}`
						}).join('\n')
					}
				}else {
					helpMessage += this.categories.filter(c => !c.hide).map(c => `**${c.name}** \`${this.defaultPrefix}help ${c.name.toLowerCase()}\` - ${c.help}`).join('\n') + '\n\n' + this.setup.helpMessageAfterCategories
				}
				if (!this.setup.helpDM) {
					msg.channel.createMessage(helpMessage)
				} else {
					msg.author.getDMChannel().then(channel => channel.createMessage(helpMessage))
				}
			}))
		}
	}

	/**
	 * Given a message, see if there is a command and process it if so.
	 * @param {Object} msg - The message object recieved from Eris.
	 */
	handleMessage(msg) {
		this._handleEvent('messageCreate')(msg)

		if (this.ignoreBots && msg.author.bot) return

		if (!msg.content.startsWith(this.defaultPrefix)) return
		const [prefix, content] = this.splitPrefixFromContent(msg)
		// if (!content) {
		// 	if (!prefix || !prefix.match(this.mentionPrefixRegExp)) return
		// 	// A lone mention triggers the default command with no arguments
		// 	const defaultCommand = this.commandForName(null)
		// 	if (!defaultCommand) return
		// 	defaultCommand.process.call(this, msg, [], prefix, null)
		// }
		const args = content.split(' ')
		const commandName = args[0]
		const subCommandName = args[1]
		/**
		 * Message is spit for spaces (' ')
		 * @typedef args
		 * @prop {string} prefix - Message prefix
		 * @prop {string} content - Message content
		 * @prop {function} from - Splice message content from argument number to end message
		 * @prop {function} until - Splice message content from begin until argument number
		 * @prop {function} after - Same content
		 * @prop {array} - Each word form message is in a slot
		 */
		args.prefix = prefix
		args.content = content
		args.from = arg => msg.content.replace(`${this.defaultPrefix}${args.slice(0, arg).join(' ')} `, '')
		args.until = arg => this.defaultPrefix + args.slice(0, arg).join(' ')
		args.after = args.from(1)

		const command = this.commandForName(commandName, subCommandName)
		if (!command) return
		if (!command.enable) return
		if (command.guildOnly && msg.channel.type !== 0) return
		if (command.dmOnly && msg.channel.type !== 1) return
		if (command.userOnly && !command.userOnly.includes(msg.author.id)) return
		if (command.ownerOnly && msg.author.id !== this.owner.id) return
		if (command.check && !command.check(msg, args, command, this)) return
		if (command.rolesCanUse && !this.checkRolesCanUse(msg, command.rolesCanUse)) return
		if (command.permissions && !this.checkHasPermissions(msg, command.permissions)) return
		if (command.cooldown) {
			const cd = command.getCooldown(msg.author.id)
			if (cd > 0) {
				if (typeof command.cooldownMessage === 'string') {
					return msg.channel.createMessage(command.cooldownMessage.replace(new RegExp('<cd>', 'g'), cd).replace(new RegExp('<username>', 'g'), msg.author.username))
				} else if (typeof command.cooldownMessage === 'function') {
					let cooldownMessage = command.cooldownMessage.call(this, msg, args, command, cd)
					if (typeof cooldownMessage === 'string') { msg.channel.createMessage(cooldownMessage.replace(new RegExp('<cd>', 'g'), cd).replace(new RegExp('<username>', 'g'), msg.author.username)) }
					return
				}
			}
		}
		
		try{
			Promise.resolve(command.process.call(this, msg, args, command)).then((val) => {
				// logger.log('Val Promise',val);
				if (command.cooldown) {
					command.setCooldown(msg.author.id)
				}
				if (command.cooldown || command.await) {
					if (val === undefined) { logger.warn(`${command.name} returned a promise with undefined value`) }
				}
			}).catch(err => {
				logger.warn(`<${command.name}> returned a failed promise: ${err}`)
				/**
				 * Command Error Event
				 * @event Client#aghanim:command:error
				 * @param {object} err - Error
				 * @param {object} msg - Message Object
				 * @param {object} args - Error
				 * @param {Command} command - Command that fired the error
				 */
				this.emit('aghanim:command:error', err, msg, args, command)
			})
		}catch(err){
			logger.error('Error Command TryCatched =>', err)
			this.emit('aghanim:command:error', err, msg, args, command)
		}

	}

	_handleEvent(eventname) {
		return (...args) => {
			Object.keys(this.components)
				.map((componentName) => this.components[componentName])
				.filter((component) => component[eventname] && component.enable)
				.forEach((component) => {
					try {
						component[eventname](...args)
					} catch (err) {
						logger.error(`${component.constructor.name} got an error. => ${err}`)
						/**
						 * Command Error Event
						 * @event Client#aghanim:error
						 * @param {object} err - Error
						 */
						this.emit(`aghanim:error`, err)
					}
				})
		}
	}

	/**
	 * Register a command to the client.
	 * @param {Command} command - The command to add to the bot.
	 */
	addCommand(command) {
		if (!(command instanceof Command)) throw new TypeError('Not a command')
		if (!this.categories.find(c => c.name === command.category)) { command.category = DEFAULT_CATEGORY; logger.warn(`${command.category} not found! Established as ${DEFAULT_CATEGORY} in ${command.name}`) }
		command.client = this
		if (!command.subcommandFrom) {
			const cmd = this.commands.find(c => [c.name, ...c.aliases].some(cname => [command.name, ...command.aliases].includes(cname)))
			if (cmd) {throw new Error('Command exists', command.name)}
			else { this.commands.push(command); logger.dev(`Command added: ${command.name}`) }
		} else {
			const cmd = this.commands.find(c => [c.name, ...c.aliases].includes(command.subcommandFrom))
			if (!cmd) { throw new Error('Upcommand not found', command.subcommandFrom) }
			else {
				if (command.category !== cmd.category) {
					command.category = cmd.category
					logger.warn(`${command.category} not same upcomand! Established as ${cmd.category}`)
				}
				command.upcommand = cmd
				cmd.subcommands.push(command)
				logger.dev(`Subcommand added: ${command.name} from ${cmd.name}`)
			}
		}
		return this
	}
	/**
	 * Load all the JS files in a directory and attempt to load them each as commands.
	 * @param {string} dirname - The location of the directory.
	 */
	addCommandDir(dirname) {
		if (!dirname.endsWith('/')) dirname += '/'
		const pattern = `${dirname}*.js`
		const filenames = glob.sync(pattern)
		for (const filename of filenames) {
			this.addCommandFile(filename)
		}
		return this
	}

	/**
	 * Load a command exported from a file.
	 * @param {string} filename - The location of the file.
	 */
	addCommandFile(filename) {
		try {
			const command = reload(filename)
			command.filename = filename
			this.addCommand(command)
		} catch (err) {
			logger.error(err)
		}
		return this
	}

	/**
	 * Add a Command Category {@link Category}
	 * @param {string} name - Name for Category
	 * @param {string} help - Help Message
	 * @param {object} options - Options
	 * @param {object} options.hide - Options
	 * @param {object} options.restrict - Options
	 */
	addCategory(name, help, options) {
		const category = new Category(name, help, options)
		if (this.categories.find(c => c.name === category.name)) { throw new Error(`Category ${category.name} exists`) }
		else { this.categories.push(category); logger.dev(`Category added: ${category.name}`) }
	}

	/**
	 * Add a Component
	 * @param {Component} component Component {@link Component}
	 */
	addComponent(component, options) {
		if (!(component.prototype instanceof Component)) throw new TypeError(`Not a Component => ${component}`)
		// if (component.__proto__ !== Component) throw new TypeError(`Not a Component => ${component}`)
		if (this.components[component.name]){ throw new Error(`Component exists => ${component.name}`)}
		try {
			this.components[component.name] = new component(this,options)
			logger.dev(`Component Added: ${component.name}`)
		} catch (err) {
			logger.error(err)
		}
	}

	/**
	 * Add component from file
	 * @param {string} filename Path to file
	 */
	addComponentFile(filename) {
		try {
			const component = reload(filename)
			component.filename = filename
			this.addComponent(component)
		} catch (err) {
			logger.error(err)
		}
		return this
	}

	/**
	 * Add components from a directory
	 * @param {string} dirname Path to load components
	 */
	addComponentDir(dirname) {
		if (!dirname.endsWith('/')) dirname += '/'
		const pattern = `${dirname}*.js`
		const filenames = glob.sync(pattern)
		for (let filename of filenames) {
			this.addComponentFile(filename)
		}
		return this
	}
	// addCommandCategory(dirname){
	// 	if (!dirname.endsWith('/')) dirname += '/'
	// 	this.addCommandDir(dirname + 'commands')
	// }
	/**
	 * Reloads all commands that were loaded via `addCommandFile` and
	 * `addCommandDir`. Useful for development to hot-reload commands as you work
	 * on them.
	 */
	reloadCommands() {//TODO: subcommands not supported
		let i = this.commands.length
		while (i--) {
			const command = this.commands[i]
			if (command.filename) {
				this.commands.splice(i, 1)
				this.addCommandFile(command.filename)
			}
		}
		return this
	}

	/**
	 * Checks the list of registered commands and returns one whch is known by a
	 * given name, either as the command's name or an alias of the command.
	 * @param {string} command - The name of the command to look for.
	 * @param {string} subcommand - The name of the subcommand to look for.
	 * @returns {Command|null}
	 */
	commandForName(command,subcommand) {
		const cmd = this.commands.find(c => [c.name, ...c.aliases].includes(command))
		if (!cmd) return
		if (subcommand) {
			const scmd = cmd.subcommands.find(c => [c.name, ...c.aliases].includes(subcommand))
			// console.log('SCMD',subCommandFind);
			return scmd || cmd
		}
		return cmd
	}

	/***
	 * Returns the appropriate prefix string to use for commands based on a
	 * certain message.
	 * @param {Object} msg - The message to check the prefix of.
	 * @returns {string}
	 */
	prefixForMessage(msg) {
		return this.defaultPrefix
		// TODO
		// if (msg.channel.guild) return this.defaultPrefix
		// return ''
	}

	/***
	 * Takes a message, gets the prefix based on the config of any guild it was
	 * sent in, and returns the message's content without the prefix if the
	 * prefix matches, and `null` if it doesn't.
	 * @param {Object} msg - The message to process
	 * @returns {Array<String|null>}
	 **/
	splitPrefixFromContent(msg) {
		// Traditional prefix handling - if there is no prefix, skip this rule
		const prefix = this.prefixForMessage(msg) // TODO: guild config
		if (prefix != null && msg.content.startsWith(prefix)) {
			return [prefix, msg.content.substr(prefix.length)]
		}
		// Allow mentions to be used as prefixes according to config
		const match = msg.content.match(this.mentionPrefixRegExp)
		if (this.allowMention && match) { // TODO: guild config
			return [match[0], msg.content.substr(match[0].length)]
		}
		// Allow no prefix in direct message channels
		if (!msg.channel.guild) {
			return ['', msg.content]
		}
		// we got nothing
		return [null, null]
	}

	findCategories(categories) {
		if (!Array.isArray(categories)) {
			categories = [categories]
		}
		return this.categories.find(c => categories.includes(c.name))
	}

	/**
	 * Get Commands from a Category
	 * @param  {(string|string[])} categories - Category or list of these to search commands
	 * @return {Command[]|null} - Array of {@link Command} (include subcommands)
	 */
	getCommandsFromCategories(categories) {
		if (!Array.isArray(categories)) {
			categories = [categories]
		}
		categories = categories.map(c => c.toLowerCase())
		const cmds = this.commands.filter(c => categories.includes(c.category.toLowerCase()))
		return cmds.length > 0 ? cmds : null
	}

	checkRolesCanUse(msg, rolesName) {
		if (msg.channel.type !== 0) return
		const member = msg.channel.guild.members.get(msg.author.id)
		if (!member) return
		const roles = member.roles
		if(typeof(rolesName) === 'string'){rolesName = [rolesName]}
		rolesName = rolesName.map(r => r.toLowerCase())
		return roles.find( r => {
			return rolesName.includes(msg.channel.guild.roles.get(r).name.toLowerCase())
		})
	}

	checkHasPermissions(msg,permissions) {
		if (msg.channel.type !== 0) return
		const member = msg.channel.guild.members.get(msg.author.id)
		if(!member) return
		return !Object.keys(permissions).map(p => ({name : p, enable : permissions[p]})).some(p => member.permission.json[p.name] !== p.enable)
	}

	// /**
	//  * Creates a message. If the specified message content is longer than 2000
	//  * characters, splits the message intelligently into chunks until each chunk
	//  * is less than 2000 characters, then sends each chunk as its own message.
	//  * Embeds and files are sent with the last message and are otherwise
	//  * unaffected.
	//  * @param content
	//  * @param
	//  * @TODO everything
	//  */
	// _createMessageChunked (channelId, content, file, maxLength = 2000) {
	//   let embed
	//   if (typeof content === 'object') {
	//     embed = content.embed
	//     content = content.content
	//   } else {
	//     embed = null
	//   }
	//   let self = this
	//   ;(function sendChunk (left) {
	//     console.log(left.length)
	//     if (left.length < maxLength) return self.createMessage(channelId, {content, embed}, file)
	//     let newlineIndex = left.substr(0, maxLength).lastIndexOf('\n')
	//     if (newlineIndex < 1) newlineIndex = maxLength - 1
	//     console.log(newlineIndex)
	//     left = left.split('')
	//     const chunk = left.splice(0, newlineIndex)
	//     if (!left.length) {
	//       // Interesting, the message was exactly good. We'll put the embed and stuff in now.
	//       return self.createMessage(channelId, {content: chunk, embed: embed}, file)
	//     }
	//     sendChunk(left.join(''), maxLength)
	//   }(content))
	// }
}

module.exports = Client
