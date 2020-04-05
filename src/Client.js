const Eris = require('eris')
const glob = require('glob')
const path = require('path')
const Logger = require('another-logger')
const reload = require('require-reload')(require)
const Command = require('./Command')
const Category = require('./Category')
const Component = require('./Component')
const builtinCommandRequirements = require('./requirements')

const DEFAULT_CATEGORY = 'Default'

// Logger
const logger = new Logger({
	label: 'Aghanim',
	timestamps: true,
	levels: {
		dev: { style: 'magenta' },
		commandrunerror: { text: 'command:run:error', style: 'red' },
		componentrunerror: { text: 'component:run:error', style: 'red' },
		commandadderror: { text: 'command:add:error', style: 'red' },
		componentadderror: { text: 'component:add:error', style: 'red' },
		categoryadderror: { text: 'category:run:error', style: 'red' },
	},
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
	*     If there are a aghanim.config.js/json in project root, that will be loaded instead object passed to constructor.
	*     See Eris Client constructor options https://abal.moe/Eris/docs/Client
	* @param {string} [options.prefix = ''] - The prefix the bot will respond to in
	*     guilds for which there is no other confguration. (Currently everywhere)
	* @param {boolean} [options.allowMention = false] - Whether or not the bot can respond
	*     to messages starting with a mention of the bot.
	* @param {boolean} [options.ignoreBots = true] - Whether or not the bot ignoresBots. Default: true
	* @param {boolean} [options.ignoreSelf = true] - Whether or not the bot ignores self. Default: true
	* @param {string} [options.helpMessage = '**Help**'] - Title for default command help Message
	* @param {string} [options.helpMessageAfterCategories = '**Note**: Use \`${options.prefix}help <category>\` to see the commands']
	* Message after categories in default command help message are shown
	* @param {boolean} [options.helpDM = true] - Active direct message to default command help
	* @param {boolean} [options.helpEnable = true] - Enable/disable default command help
	* @param {boolean} [options.devLogs = false] - Enable/disable aghanim dev logs
	*/
	constructor(token, options = {}) {
		// Attempt to load options from aghanim.config.js(on) file
		try {
			options = require(`${process.cwd()}/aghanim.config`) /* eslint import/no-dynamic-require: "off", global-require : "off", no-param-reassign : "off" */
			logger.info('Loaded: aghanim.config.js(on)')
		} catch (err) { } /* eslint no-empty: "off" */

		super(token, options)
		options.devLogs = options.devLogs || false
		logger._config.ignoredLevels = [options.devLogs ? '' : 'dev'] /* eslint no-underscore-dangle: "off" */

		/** @prop {string} - The prefix the bot will respond to in guilds
		 * for which there is no other confguration. */
		this.prefix = options.prefix || ''
		/** @prop {Command[]} - An array of commands the bot will respond to. */
		this.commands = []
		/** @prop {Category[]} - Categories for commands. */
		this.categories = []
		/** @prop {Object<Component>} - Components. */
		this.components = {}
		/** @prop {Object} - Setup */
		this.setup = {}
		// /** @prop {Object} - Context Extension */
		// this.contextExtension = {}

		this._ready = false
		this._commandsRequirements = {}

		// /** @prop {boolean} - Whether or not the bot can respond to messages
		//  * starting with a mention of the bot. Defaults to true. */
		// this.allowMention = options.allowMention === null ? false : options.allowMention
		/** @prop {boolean} - Whether or not the bot ignores messages
		 sent from bot accounts. Defaults to true.
		 * @default true */
		this.ignoreBots = options.ignoreBots !== undefined ? options.ignoreBots : true
		/** @prop {boolean} - Ignore self
		* @default true */
		this.ignoreSelf = options.ignoreSelf !== undefined ? options.ignoreSelf : true

		this.once('ready', () => {
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
				 * Owner description
				 * @prop {string} id - Owner ID
				 * @prop {string} username - Owner username
				 * @prop {string} discriminator - Owner discriminator
				 * @prop {string} avatar - Owner avatar
				 * @prop {Ownersend} send - Send a message to Owner
				 */
				this.owner = Object.assign({}, this.app.owner)
				this.getDMChannel(this.owner.id).then((channel) => {
					/**
					 * Function to send messages to owner
					 * @callback Ownersend
					 * @param  {string|EmbedMessageObject} content - Message content to send
					 * @param  {object} file - File to send
					 */
					this.owner.send = function sendOwner(content, file) {
						channel.createMessage(content, file)
					}
				})

				this.handleEvent('ready')()
			})
		}).on('error', (err) => {
			logger.error(err)
			/**
			 * Fired when there are an error
			 * @event Client#aghanim:error
			 * @param {object} err - Error
			 * @param {Client} client - Client instance
			 */
			this.emit('aghanim:error', err, this)
		}).on('messageCreate', this.handleMessage)
			.on('messageReactionAdd', this.handleEvent('messageReactionAdd'))
			.on('messageReactionRemove', this.handleEvent('messageReactionRemove'))
			.on('guildCreate', this.handleEvent('guildCreate'))
			.on('guildDelete', this.handleEvent('guildDelete'))
			.on('guildMemberAdd', this.handleEvent('guildMemberAdd'))
			.on('guildMemberRemove', this.handleEvent('guildMemberRemove'))

		this.setup.helpMessage = `${options.helpMessage || '**Help**'}\n\n`
		this.setup.helpMessageAfterCategories = `${options.helpMessageAfterCategories || `**Note**: Use \`${this.prefix}help <category>\` to see those commands`}\n\n`
		this.setup.helpDM = options.helpDM || false
		if (!options.disableHelp) {
			// Add default help command to bot
			this.addCommand(new Command('help', {}, async (msg, args, client, command) => { /* eslint no-unused-vars: "off" */
				const categories = client.categories.map(c => c.name.toLowerCase())
				const query = args.from(1).toLowerCase()
				let { helpMessage } = client.setup
				if (categories.includes(query)) {
					const cmds = client.getCommandsOfCategories(query)
					if (!cmds) {
						helpMessage += client.categories.filter(c => !c.hide) /* eslint prefer-template: "off", max-len: "off" */
							.map(c => `**${c.name}** \`${client.prefix}help ${c.name.toLowerCase()}\` - ${c.help}`)
							.join('\n') + '\n\n' + client.setup.helpMessageAfterCategories
					} else {
						helpMessage += cmds.filter(c => !c.hide).map(c => `\`${client.prefix}${c.name}${c.args ? ' ' + c.args : ''}\` - ${c.help}${c.childs.length ? '\n' + c.childs.filter(s => !s.hide).map(s => `  · \`${s.name}${s.args ? ' ' + s.args : ''}\` - ${s.help}`).join('\n') : ''}`)
							.join('\n')
					}
				} else if (categories.length) {
					helpMessage += client.categories.filter(c => !c.hide).map(c => `**${c.name}** \`${client.prefix}help ${c.name.toLowerCase()}\` - ${c.help}`).join('\n') + '\n\n' + client.setup.helpMessageAfterCategories
				} else {
					const cmds = client.getCommandsOfCategories('Default')
					if (!cmds) {
						helpMessage += 'No commands'
					} else {
						helpMessage += cmds.filter(c => !c.hide).map(c => `\`${client.prefix}${c.name}${c.args ? ' ' + c.args : ''}\` - ${c.help}${c.childs.length ? '\n' + c.childs.filter(s => !s.hide).map(s => `  · \`${s.name}${s.args ? ' ' + s.args : ''}\` - ${s.help}`).join('\n') : ''}`)
							.join('\n')
					}
				}
				if (!client.setup.helpDM) {
					return msg.channel.createMessage(helpMessage)
				}
				return msg.author.getDMChannel().then(channel => channel.createMessage(helpMessage))
			}))
		}
	}

	/**
	 * Given a message, see if there is a command and process it if so.
	 * @param {Object} msg - The message object recieved from Eris.
	 * @return {*} - Returns
	 */
	async handleMessage(msg) {
		if (!this._ready) return
		if (!this.triggerMessageCreate(msg, this)) { return }
		this.handleEvent('messageCreate')(msg)

		if (this.ignoreBots && msg.author.bot) return
		if (this.ignoreSelf && msg.author.id === this.user.id) return

		const args = this.createCommandArgs(msg)
		if (!args) { return }
		const command = this.getCommandByName(args[0], args[1])
		if (!command) { return }
		// const context = Object.assign({
		// 	command,
		// 	client: this
		// }, this.contextExtension)
		try {
			/**
			 * Fired before a command is executed. Can't stop command of running
			 * @event Client#aghanim:command:prereq
			 * @param {object} msg - Eris Message object
			 * @param {args} args - Args object
			 * @param {Client} client - Client instance
			 * @param {Command} command - Command
			 */
			this.emit('aghanim:command:prereq', msg, args, this, command)
			await command.runHook('prereq', msg, args, this, command)
			const notpass = !(await this.checkRequirements(msg, args, this, command))
			if (notpass) return
			/**
			 * Fired before a command is executed. Can't stop command of running
			 * @event Client#aghanim:command:prerun
			 * @param {object} msg - Eris Message object
			 * @param {args} args - Args object
			 * @param {Client} client - Client instance
			 * @param {Command} command - Command
			 */
			this.emit('aghanim:command:prerun', msg, args, this, command)
			await command.runHook('prerun', msg, args, this, command)
			if (command.response) {
				switch (typeof command.response) {
				case 'string': {
					await msg.channel.createMessage(command.response)
					break
				}
				case 'function': {
					const response = command.response(msg, args, this, command)
					await msg.channel.createMessage(response)
					break
				}
				case 'object': {
					await msg.channel.createMessage(command.response)
					break
				}
				default: {}
				}
			} else if (command.responseDM) {
				switch (typeof command.responseDM) {
				case 'string': {
					await msg.channel.createMessage(command.responseDM)
					break
				}
				case 'function': {
					const responseDM = command.responseDM(msg, args, this, command)
					await msg.channel.createMessage(responseDM)
					break
				}
				case 'object': {
					await msg.channel.createMessage(command.responseDM)
					break
				}
				default: {}
				}
			} else {
				await command.run(msg, args, this, command)
			}
			/**
			 * Fired after a command is executed. Don't cant stop command of running
			 * @event Client#aghanim:command:executed
			 * @param {object} msg - Eris Message object
			 * @param {args} args - Args object
			 * @param {Client} client - Client instance
			 * @param {Command} command - Command
			 */
			this.emit('aghanim:command:executed', msg, args, this, command)
			await command.runHook('executed', msg, args, this, command)
		} catch (err) {
			/**
			 * Fired when a command got an error executing the run function
			 * @event Client#aghanim:command:error
			 * @param {object} err - Error
			 * @param {object} msg - Eris Message object
			 * @param {args} args - Args object
			 * @param {Client} client - Client instance
			 * @param {Command} command - Command
			 */
			logger.commandrunerror(`${command.name} - ${err} - ${err.stack}`)
			this.emit('aghanim:command:error', err, msg, args, this, command)
			try {
				await command.runHook('error', msg, args, this, command, err)
			} catch (errhook) {
				logger.commandrunerror(`${command.name} - ${errhook} - ${errhook.stack}`)
				this.emit('aghanim:command:error', errhook, msg, args, this, command)
			}
		}
	}

	handleEvent(eventname) {
		return (...args) => {
			Object.keys(this.components)
				.map(componentName => this.components[componentName])
				.filter(component => component[eventname] && component.enable)
				.forEach(async (component) => {
					try {
						await component[eventname](...args, this)
					} catch (err) {
						logger.componentrunerror(`${component.constructor.name} (${eventname}) - ${err}`)
						/**
						 * Fired when a component get an error to be executed
						 * @event Client#aghanim:component:error
						 * @param {object} err - Error
						 * @param {string} eventname - Name of Eris event
						 * @param {Client} client - Client instance
						 * @param {Component} component - Component
						 */
						this.emit('aghanim:component:error', err, eventname, this, component)
					}
				})
		}
	}

	/**
	 * Extend default args object.
	 * @param {args} args - Args object.
	 * @param {msg} msg - Eris Message.
	 * @param {Client} client - Client instance.
	 */
	extendCommandArgs(args, msg, client) { } /* eslint class-methods-use-this: "off" */

	_addFromDirectory(dirname, func) {
		if (!dirname.endsWith('/')) dirname += '/'
		const pattern = `${dirname}*.js`
		const filenames = glob.sync(pattern)
		filenames.forEach(filename => func(filename))
	}

	/**
	 * Register a command to the client.
	 * @param {Command | object} command - The command to add to the bot.
	 * @returns {Command} - Command added
	 */
	addCommand(command) { /* eslint consistent-return:"off" */
		if (!(command instanceof Command) && typeof command === 'object') { // allow command as object and create it
			command = new Command(command)
		}
		if (!(command instanceof Command)) throw new TypeError('Not a command') // throw error if not a Command instance or class extending of command
		if (!this.categories.find(c => c.name === command.category)) { // Check category exists or assing default category
			command.category = DEFAULT_CATEGORY
			logger.warn(`Category not found for ${command.name}. Established as ${DEFAULT_CATEGORY}`)
		}
		command.client = this // inject client on command
		const { requirements } = command
		command.requirements = [] // reset command.requirements
		mapCommandRequirement(this, command, requirements) /* eslint no-use-before-define: "off" */

		// Check if command exists already and throw error or add to client
		if (!command.childOf) {
			const commandExists = this.commands.find(c => c.names.some(cname => [command.name, ...command.aliases].includes(cname)))
			if (commandExists) {
				logger.commandadderror(`Command exists: ${command.name}`)
			} else {
				this.commands.push(command)
				logger.dev(`Command added: ${command.name}`)
				return command
			}
		} else { // Find parent command and add to client
			const parent = this.commands.find(c => c.names.includes(command.childOf))
			if (!parent) {
				throw new Error(`Parent command ${command.childOf} not found for ${command.name}`)
			} else {
				if (command.category !== parent.category) { // Set category as parent category if is different
					command.category = parent.category
					logger.warn(`${command.category} not same upcomand! Established as ${parent.category}`)
				}
				command.parent = parent
				parent.childs.push(command)
				logger.dev(`Subcommand added: ${command.name} from ${parent.name}`)
				return command
			}
		}
	}

	/**
	 * Load all the JS files in a directory and attempt to load them each as commands.
	 * @param {string} dirname - The location of the directory.
	 */
	addCommandDir(dirname) {
		this._addFromDirectory(dirname, filename => this.addCommandFile(filename))
	}

	/**
	 * Load a command exported from a file.
	 * @param {string} filename - The location of the file.
	 * @returns {Command} - Command added.
	 */
	addCommandFile(filename) {
		try {
			const commandLoaded = reload(filename)
			const command = this.addCommand(commandLoaded)
			if (command) {
				command.filename = filename
			}
			return command
		} catch (err) {
			logger.commandadderror(`${err.stack} on ${filename}`)
		}
	}

	/**
	 * Add a Command {@link Category}
	 * @param {string} name - Name for Category
	 * @param {string} help - Help Message
	 * @param {object} options - Options
	 * @param {object} options.hide - Options
	 * @param {object} options.restrict - Options
	 */
	addCategory(name, help, options) {
		const category = new Category(name, help, options)
		if (this.categories.find(c => c.name === category.name)) {
			logger.categoryadderror(`${category.name} exists`)
		} else {
			this.categories.push(category);
			logger.dev(`Category added: ${category.name}`)
		}
	}

	/**
	 * Add a Component
	 * @param {Component | object} component - Component {@link Component}
	 * @returns {Component} - Component added
	 */
	addComponent(component, options) {
		if (!(component instanceof Component) && typeof component === 'object') { // allow load components as object
			const componentObject = component
			if (!componentObject.name) throw new TypeError(`Component as object require an name => ${JSON.stringify(componentObject)}`)
			component = class extends Component {
				constructor(client, options) {
					super(client, options)
					if (typeof componentObject.constructor === 'function'){
						componentObject.constructor(client, options)
					}
				}
			}
			Object.defineProperty(component, 'name', { value: componentObject.name })
			Object.keys(componentObject).filter(key => key !== 'name').forEach(key => component.prototype[key] = componentObject[key])
		}
		if (!(component.prototype instanceof Component)) throw new TypeError(`Not a Component => ${component}`)
		if (this.components[component.name]) { throw new Error(`Component exists => ${component.name}`) }
		try {
			const instanceComponent = new component(this, options) /* eslint new-cap: "off" */
			if (instanceComponent.enable) {
				instanceComponent.name = component.name
				this.components[component.name] = instanceComponent
				logger.dev(`Component Added: ${component.name}`)
				return this.components[component.name]
			} else {
				logger.warn(`Component Disabled: ${component.name}`)
			}
		} catch (err) {
			logger.componentadderror(`${component.name} - ${err}`)
		}
	}

	/**
	 * Add component from file
	 * @param {string} filename Path to file
	 * @returns {Component} Component added
	 */
	addComponentFile(filename) {
		try {
			const componentClass = reload(filename)
			const component = this.addComponent(componentClass)
			if (component) {
				component.filename = filename
			}
			return component
		} catch (err) {
			logger.componentadderror(`${err} on ${filename}`)
		}
	}

	/**
	 * Add components from a directory
	 * @param {string} dirname Path to load components
	 */
	addComponentDir(dirname) {
		this._addFromDirectory(dirname, filename => this.addComponentFile(filename))
	}

	/**
	 * Define a requirement that can be added by commands
	 * @param  {(CommandRequirementObject|CommandRequirementFunction)} requirement - Requirement to define
	 */
	addCommandRequirement(requirement) {
		if (typeof requirement === 'object' && requirement.type) {
			this._commandsRequirements[requirement.type] = requirement
			return requirement
		} else if (typeof requirement === 'function') {
			this._commandsRequirements[requirement.name] = requirement
			return requirement
		} else {
			logger.error('Error adding command requirement')
		}
	}

	/**
	 * Add command requirement from file
	 * @param {string} filename Path to file
	 * @returns {CommandRequirement} CommandRequirement added
	 */
	addCommandRequirementFile(filename) {
		try {
			const requirementLoaded = reload(filename)
			if (typeof requirementLoaded === 'function') Object.defineProperty(requirementLoaded, 'name', { value: path.basename(filename, '.js') })
			const requirement = this.addCommandRequirement(requirementLoaded)
			if (requirement) {
				requirement.filename = filename
			}
			return requirement
		} catch (err) {
			logger.commandadderror(`${err} on ${filename}`)
		}
	}

	/**
	 * Add command requirements from a directory
	 * @param {string} dirname Path to load command requirements
	 */
	addCommandRequirementDir(dirname) {
		this._addFromDirectory(dirname, filename => this.addCommandRequirementFile(filename))
	}

	/**
	 * Reloads all commands that were loaded via `addCommandFile` and
	 * `addCommandDir`. Useful for development to hot-reload commands as you work
	 * on them.
	 */
	reloadCommands() { 
		logger.dev('Reloading commands...')
		const commands = this.commands.reduce((filenames, command) => {
			filenames.push(command.filename ? command.filename : command)
			if (command.childs.length > 0) {
				command.childs.forEach((subcommand) => {
					filenames.push(subcommand.filename ? subcommand.filename : subcommand)
				})
			}
			return filenames
		}, [])
		this.commands = []
		commands.forEach(command => typeof command === 'string' ? this.addCommandFile(command) : this.addCommand(command)) /* eslint no-confusing-arrow: 'off' */
	}

	/**
	 * Reloads all components that were loaded via `addComponentFile` and
	 * `addCommponentDir`. Useful for development to hot-reload commands as you work
	 * on them.
	 */
	reloadComponents() { 
		logger.dev('Reloading components...')
		const components = Object.keys(this.components).map(key => this.components[key]).reduce((filenames, component) => {
			if (component.filename) {
				filenames.push([component.filename, component.name || component.constructor.name])
			}
			return filenames
		}, [])

		components.forEach(([filename, name]) => {
			delete this.components[name]
			this.addComponentFile(filename)
		})
		this.handleEvent('ready')()
	}

	reloadCommandRequirements() {
		logger.dev('Reloading command requirements...')
		const filenamesRequirement = Object.keys(this._commandsRequirements).map(key => this._commandsRequirements[key]).reduce((filenames, requirement) => {
			if (requirement.filename) {
				filenames.push(requirement.filename)
			}
			return filenames
		}, [])
		// this._commandsRequirements = {}
		filenamesRequirement.forEach(filename => this.addCommandRequirementFile(filename))
	}

	/**
	 * Checks the list of registered commands and returns one whch is known by a
	 * given name, either as the command's name or an alias of the command.
	 * @param {string} command - The name of the command to look for.
	 * @param {string} subcommand - The name of the subcommand to look for.
	 * @return {Command|undefined}
	 */
	getCommandByName(command, subcommand) {
		const cmd = this.commands.find(c => c.names.includes(command))
		if (!cmd) return
		if (subcommand) {
			const scmd = cmd.childs.find(c => c.names.includes(subcommand))
			return scmd || cmd
		}
		return cmd
	}

	/***
	 * Returns the appropriate prefix string to use for commands based on a
	 * certain message.
	 * @param {Object} msg - The message to check the prefix of.
	 * @return {string}
	 */
	getPrefixForMessage(msg) {
		return this.prefix
	}

	/***
	 * Takes a message, gets the prefix based on the config of any guild it was
	 * sent in, and returns the message's content without the prefix if the
	 * prefix matches, and `null` if it doesn't.
	 * @param {Object} msg - The message to process
	 * @return {Array<String|null>}
	 **/
	splitPrefixFromContent(msg) {
		// Traditional prefix handling - if there is no prefix, skip this rule
		const prefix = this.getPrefixForMessage(msg) // TODO: guild config
		if (prefix !== undefined && msg.content.startsWith(prefix)) {
			return { prefix, content: msg.content.substr(prefix.length) }
		}
		// Allow mentions to be used as prefixes according to config
		const match = msg.content.match(this.mentionPrefixRegExp)
		if (this.allowMention && match) { // TODO: guild config
			return { prefix: match[0], content: msg.content.substr(match[0].length) }
		}
		// we got nothing
		return { prefix: undefined, content: msg.content }
	}

	/**
	 * Get Commands from a Category
	 * @param  {(string|string[])} categories - Category or list of these to search commands
	 * @return {Command[]|undefined} - Array of {@link Command} (include childs commands aka subcommands)
	 */
	getCommandsOfCategories(categories) {
		if (!Array.isArray(categories)) {
			categories = [categories]
		}
		categories = categories.map(c => c.toLowerCase())
		const cmds = this.commands.filter(c => categories.includes(c.category.toLowerCase()))
		return cmds.length > 0 ? cmds : undefined
	}

	/**
	 * If returns true, allow default commands management and messageCreate Components functions.
	 * @param  {Eris.message} msg - Eris Message object
	 * @param  {Client} client - Client instance
	 * @return {boolean} - true = allow, false = omit
	 */
	triggerMessageCreate(msg, client) {
		return true
	}

	/**
	 * @typedef EmbedMessageObject
	 * @see {@link https://abal.moe/Eris/docs/TextChannel#function-createMessage EmbedMessageObject}
	 */

	/**
	 * Creators for Command Requirements
	 * @typedef {function} CommandRequirementsCreators
	 * @param {object} config - Object with requirement config
	 * @see {@link https://desvelao.github.io/aghanim/tutorial-6command-requirements.html Command Requirements Creators} config - Object with requirement config
	 * @returns {CommandRequirementObject}
	 */

	/**
	 * Create args object and find command. Returns both.
	 * @typedef parseCommand
	 * @prop  {args} args - args object
	 * @prop  {Command|undefined} command - command
	 */

	/**
	 * Create args object and find command. Returns both.
	 * @param  {Eris.message} msg - Eris Message object
	 * @returns {parseCommand} - 
	 */
	createCommandArgs(msg) {
		const { prefix, content } = this.splitPrefixFromContent(msg)
		if (typeof prefix !== 'string' || typeof content !== 'string') return

		const args = content.split(' ').map(word => word.trim())

		/**
		 * Message is spit for spaces (' ')
		 * @typedef args
		 * @prop {string} prefix - Message prefix
		 * @prop {string} content - Message content
		 * @prop {function} from - Splice message content from argument number to end message. fn(arg:number)
		 * @prop {function} until - Splice message content from begin until argument number. fn(arg:number)
		 * @prop {function} after - Same content. fn()
		 * @prop {Client} client - Client instance
		 * @prop {string} command - Command name
		 * @prop {(string|undefined)} subcommand - Subcommand name if exists
		 * @prop {array} - Each word form message is in a slot
		 */
		args.prefix = prefix
		args.content = content
		args.from = arg => args.slice(arg).join(' ')
		args.until = arg => args.prefix + args.slice(0, arg).join(' ')
		args.after = args.from(1)
		args.client = this
		args.command = args[0]
		args.subcommand = args[1]
		this.extendCommandArgs(args, msg, this)
		return args
	}

	async checkRequirements(msg, args, client, command) {
		if (!command.enable) { return false }
		return command.requirements.reduce(async (result, requirement) => {
			if (!(await result)) { return Promise.resolve(false) }
			if (typeof requirement === 'object') {
				const pass = await requirement.validate(msg, args, client, command, requirement)
				if (pass === null) { // ignore response/responseDM/run methods
					return Promise.resolve(false)
				} else if (!pass) { // false/undefined do response/responseDM/run methods
					if (["string", "object"].includes(typeof(requirement.response))) {
						await msg.channel.createMessage(requirement.response) // Response to message
					} else if (typeof requirement.response === "function") {
						const res = await requirement.response(msg, args, client, command, requirement) 
						await msg.channel.createMessage(res) // Response to message
					} else if (["string", "object"].includes(typeof(requirement.responseDM))) {
						await msg.author.getDMChannel().then(channel => channel.createMessage(requirement.responseDM)) // Response with a dm
					} else if (typeof requirement.responseDM === "function") {
						const res = await requirement.responseDM(msg, args, client, command, requirement) 
						await msg.author.getDMChannel().then(channel => channel.createMessage(res)) // Response with a dm
					} else if (typeof requirement.run === "function") {
						await requirement.run(msg, args, client, command, requirement) // Custom
					}
					return Promise.resolve(false)
				}
			}
			return Promise.resolve(true) // result
		}, Promise.resolve(true))
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


function getCommandRequirement(client, command, req) {
	if (typeof req === 'string') {
		if (builtinCommandRequirements[req]) {
			const requirement = builtinCommandRequirements[req]({command, client})
			requirement.type = req
			return requirement
		} else if (client._commandsRequirements[req]) {
			if (typeof client._commandsRequirements[req] === "object") {
				return client._commandsRequirements[req]
			}else if(typeof client._commandsRequirements[req]  === "function"){
				return client._commandsRequirements[req]({ command, client })
			}
		} else {
			throw new Error(`String command requirement not found: ${req}`)
		}
	} else if (typeof req === 'object') {
		if (builtinCommandRequirements[req.type]) {
			const requirement = builtinCommandRequirements[req.type]({ ...req, command, client })
			requirement.type = req.type
			return requirement
		} else {
			return req
		}
	} else {
		throw new TypeError(`Requirement: ${req} on ${command.name}`)
	}
}

function mapCommandRequirement(client, command, reqs){
	reqs.forEach(req => {
		const requirement = getCommandRequirement(client, command, req)
		if(Array.isArray(requirement)){
			mapCommandRequirement(client, command, requirement)
		}else{
			command.addRequirement(requirement)
		}
	})
}

module.exports = Client
