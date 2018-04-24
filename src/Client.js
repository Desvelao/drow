const Eris = require('eris');
const glob = require('glob');
const Command = require('./Command');
const Watcher = require('./Watcher');
const reload = require('require-reload')(require);
const extensions = require('./extensions')

Eris.Message.prototype.reply = function(message,file){ const self = this; return new Promise(function(resolve,reject){
	self.channel.createMessage(message,file).then(m => resolve(m))
})}
// const LoggerThing = require('./util.js');
let u;

/** The client. */
class Client extends Eris.Client {
	/**
	 * Create a client instance.
	 * @param {Object} options - Options to start the client with. This object is
	 *     also passed to Eris.
	 * @param {string} options.token - The token used to log into the bot.
	 * @param {string} options.prefix - The prefix the bot will respond to in
	 *     guilds for which there is no other confguration. (Currently everywhere)
	 * @param {boolean} options.allowMention - Whether or not the bot can respond
	 *     to messages starting with a mention of the bot.
	 * @param {number} options.logLevel - The minimum message level for logged
	 *     events in the console.
	 */
	constructor (token,options = {}) {
		super(token, options)

		// u = LoggerThing(options.logLevel == null ? 2 : options.logLevel)

		/**
		 * @prop {string} - The prefix the bot will respond to in guilds for which
		 *     there is no other confguration.
		 */
		this.defaultPrefix = options.prefix
		this.categories = []
		this.setup = {}
		if (this.defaultPrefix === '') {
			// u.warn('defaultPrefix is an empty string, bot will not require a prefix to run commands')
		}

		/**
		 * @prop {boolean} - Whether or not the bot can respond to messages starting
		 *     with a mention of the bot. Defaults to true.
		 */
		this.allowMention = options.allowMention == null ? false : options.allowMention

		/**
		 * @prop {boolean} - Whether or not the bot ignores messages sent from bot
		 *     accounts. Defaults to true.
		 */
		this.ignoreBots = options.ignoreBots == null ? true : options.ignoreBots

		/**
		 * @prop {Array<Command>} - An array of commands the bot will respond to.
		 *     respond to.
		 */
		this.commands = []
		this.watchers = {}
		const _events_watcher = ['messageCreate','messageReactionAdd','messageReactionRemove','guildCreate','guildDelete','guildMemberAdd','guildMemberRemove']
	  _events_watcher.forEach(event => this.watchers[event] = [])

		if(options.extensions){
			const plugins = Object.keys(options.extensions).map(ext => ({ext : ext, enable : options.extensions[ext]}))
			plugins.forEach(ext => {
				if(ext.enable && extensions[ext.ext]){
					try{
						extensions[ext.ext].call(this)
						console.log('EXTENSION loaded: ', ext.ext);
					}catch(err){
						console.log('EXTENSION ERROR: ',err);
					}
				}
			})
		}
		this.on('ready', () => {
			/**
			 * @prop {RegExp} - The RegExp used to tell whether or not a message starts
			 *     with a mention of the bot. Only present after the 'ready' event.
			 */
			this.mentionPrefixRegExp = new RegExp(`^<@!?${this.user.id}>\\s?`)

			this.getOAuthApplication().then(app => {
				/**
				 * @prop {object} - The OAuth application information returned by
				 *     Discord. Present some time after the ready event.
				 */
				this.app = app
				this.owner = Object.assign({},this.app.owner)
				this.getDMChannel(this.owner.id).then(channel => {
					this.owner.send = function(content){channel.createMessage(content)}
				})
				this.emit('postready')
			})

			// u.ok('Logged in as', u.underline(`@${this.user.username}#${this.user.discriminator}`), `- in ${this.guilds.size} guild${this.guilds.size === 1 ? '' : 's'}, ${this.commands.length} command${this.commands.length === 1 ? '' : 's'} loaded`)
		}).on('error', err => {
			console.log(err);
			// u.error('Error in client:\n', err)
		}).on('messageCreate', this.handleMessage)
		.on('messageReactionAdd',this.handleWatcherReactionAdd)
	  .on('messageReactionRemove',this.handleWatcherReactionRemove)
	  .on('guildCreate',this.handleWatcherGuildCreate)
	  .on('guildDelete',this.handleWatcherGuildDelete)
	  .on('guildMemberAdd',this.handleWatcherMemberAdd)
	  .on('guildMemberRemove',this.handleWatcherMemberRemove)

		this.setup.helpMessage = (options.helpMessage || '**Help**') + '\n\n'
		this.setup.helpMessageAferCategories = (options.helpMessageAferCategories || `**Note**: Use \`${this.defaultPrefix}help <category>\` to see those commands`) + '\n\n'
		this.setup.helpDM = options.helpDM || false
		if(!options.helpEnable){
			this.addCommand(new Command('help',{},(msg, args, prefix, command) => {
				const categories = this.categories.map(c => c.name.toLowerCase())
				const query = args.from(1).toLowerCase();
				// console.log('CATEGORIES',categories,query,query.length,categories.includes(query));
				if(categories.includes(query)){
					const helpMessage = this.getCommandsFromCategories(query)
					if(!this.setup.helpDM){
						msg.reply(helpMessage)
					}else{
						msg.author.getDMChannel().then(channel => channel.createMessage(helpMessage))
					}
				}else{
					const helpMessage = this.setup.helpMessage + this.categories.filter(c => !c.hide).map(c => `**${c.name}** \`${this.defaultPrefix}help ${c.name.toLowerCase()}\` - ${c.help}`).join('\n') + '\n\n' + this.setup.helpMessageAferCategories
					if(!this.setup.helpDM){
						msg.reply(helpMessage)
					}else{
						msg.author.getDMChannel().then(channel => channel.createMessage(helpMessage))
					}
				}
			}))
		}
	}

	/**
	 * Given a message, see if there is a command and process it if so.
	 * @param {Object} msg - The message object recieved from Eris.
	 */
	handleMessage (msg) {
		this.watchers.messageCreate.forEach(watcher => watcher.process.call(this,msg))

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
		let args = content.split(' ')
		const commandName = args[0] //.splice(0, 1)
		// console.log('ARGS',args,commandName);
		const subCommandName = args[1]
		args.prefix = prefix
		args.content = content
		args.from = (arg) => msg.content.replace(this.defaultPrefix + args.slice(0,arg).join(' ') + ' ','')
		args.until = (arg) => this.defaultPrefix + args.slice(0,arg).join(' ')
		args.after = args.from(1)
		// console.log('AFTER',args.after);
		let command = this.commandForName(commandName,subCommandName)
		// console.log('CMD',command);
		if (!command) return
		if(!command.enable) return
		if(command.guildOnly && msg.channel.type !== 0) return
		if(command.dmOnly && msg.channel.type === 0) return
		if(command.userOnly && command.userOnly.includes(msg.author.id)) return
		if(command.ownerOnly && msg.author.id !== this.owner.id) return
		if(command.check && !command.check.call(this, msg, args, command)) return
		if(command.rolesCanUse && !this.checkRolesCanUse(msg,command.rolesCanUse)) return
		if(command.permissions && !this.checkHasPermissions(msg,command.permissions)) return
		if(command.cooldown){
			const inCooldown = command.inCooldown(msg.author.id)
			if(inCooldown > 0) return msg.reply(command.cooldownMessage)
		}
		// console.log('THIS',this);
		command.process.call(this, msg, args, command)
		// u.info('did a thing:', commandName, args.join(' '))
	}

	handleWatcherReactionAdd(msg,emoji,userID){
		this.watchers.messageReactionAdd.forEach(watcher => watcher.process.call(this,msg,emoji,userID))
	}

	handleWatcherReactionRemove(msg,emoji,userID){
		this.watchers.messageReactionRemove.forEach(watcher => watcher.process.call(this,msg,emoji,userID))
	}

	handleWatcherGuildCreate(guild){
		this.watchers.guidlCreate.forEach(watcher => watcher.process.call(this,guild))
	}

	handleWatcherGuildDelete(guild){
		this.watchers.guildDelete.forEach(watcher => watcher.process.call(this,guild))
	}

	handleWatcherMemberAdd(guild,member){
		this.watchers.guildMemberAdd.forEach(watcher => watcher.process.call(this,guild,member))
	}

	handleWatcherMemberRemove(guild,member){
		this.watchers.guildMemberRemove.forEach(watcher => watcher.process.call(guild,member))
	}

	/**
	 * Register a command to the client.
	 * @param {Command} command - The command to add to the bot.
	 */
	addCommand (command) {
		if (!(command instanceof Command)) throw new TypeError('Not a command')
		const cmd = command.subcommandFrom || command.name
		const scmd = command.subcommandFrom ? command.name : undefined
		const level = this.levelIsCommand(cmd,scmd)
		if(!level){
			this.commands.push(command)
			console.log('Added Command',command.name);
		}else if(level !== 2){
			level.subcommands.push(command)
			command.upcommand = level
			console.log('Added SubCommand',command.name, 'from', command.subcommandFrom);
		}
		// if (this.commandForName(command.name) && !command.subcommandFrom) return console.log('Duplicate Command');// u.warn(`Duplicate command found (${command.name})`)
		// if (this.commandForName(command.name,command.subcommandFrom)) return console.log('Duplicate Command');
    //
		// const commandFind = this.commandForName(command.name,command.subcommandFrom)
		// if (!commandFind){}
		// else{this.commandForName(command.name).subcommands.push(command)}
		return this
	}

	levelIsCommand (command,subcommand) {
		let is = false
		const cmd = this.commands.find(c => [c.name, ...c.aliases].includes(command))
		// console.log('ISCMD',cmd,command,subcommand);
		if (cmd){
			is = cmd
			const scmd = cmd.subcommands.find(c => [c.name, ...c.aliases].includes(subcommand))
			if(scmd){is = 2}
		}
		return is
	}
	/**
	 * Load all the JS files in a directory and attempt to load them each as
	 * commands.
	 * @param {string} dirname - The location of the directory.
	 */
	addCommandDir (dirname) {
		if (!dirname.endsWith('/')) dirname += '/'
		const pattern = dirname + '*.js'
		const filenames = glob.sync(pattern)
		for (let filename of filenames) {
			this.addCommandFile(filename)
		}
		return this
	}

	/**
	 * Load a command exported from a file.
	 * @param {string} filename - The location of the file.
	 */
	addCommandFile (filename) {
		try {
			const command = reload(filename)
			command.filename = filename
			this.addCommand(command)
			// u.debug('Added command from', filename)
		} catch (e) {
			console.log(e);
			// u.warn('Command from', filename, "couldn't be loaded.\n", e)
		}
		return this
	}

	addCommandModule (dirname) {
		if (!dirname.endsWith('/')) dirname += '/'
		// const pattern = dirname + '*.js'
		// const filenames = glob.sync(pattern)
		// for (let filename of filenames) {
		// 	this.addCommandFile(filename)
		// }
		this.addCommandDir(dirname + 'commands')
		this.addCommandDir(dirname + 'subcommands')
		// this.addCommandDir(path.join(__dirname, 'subcommands'))
		return this
	}

	addCommandCategory(dirname){
		if (!dirname.endsWith('/')) dirname += '/'
		this.addCommandDir(dirname + 'commands')
	}
	/**
	 * Reloads all commands that were loaded via `addCommandFile` and
	 * `addCommandDir`. Useful for development to hot-reload commands as you work
	 * on them.
	 */
	reloadCommands () {
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
	 * @param {string} name - The name of the command to look for.
	 * @returns {Command|null}
	 */
	commandForName (command,subcommand) {
		// console.log('SEARCHING',command,subcommand);
		const commandFind = this.commands.find(c => {return [c.name, ...c.aliases].includes(command)})
		// console.log(commandFind);
		if(!commandFind) return
		if(subcommand){
			const subCommandFind = commandFind.subcommands.find(c => [c.name, ...c.aliases].includes(subcommand))
			// console.log('SCMD',subCommandFind);
			if(!subCommandFind) return commandFind
			else return subCommandFind
		}
		return commandFind
		// return this.commands.find(c => [c.name, ...c.aliases].includes(name))
	}

	/**
	 * Returns the appropriate prefix string to use for commands based on a
	 * certain message.
	 * @param {Object} msg - The message to check the prefix of.
	 * @returns {string}
	 */
	prefixForMessage (msg) {
		return this.defaultPrefix
		// TODO
		// if (msg.channel.guild) return this.defaultPrefix
		// return ''
	}

	/**
	 * Takes a message, gets the prefix based on the config of any guild it was
	 * sent in, and returns the message's content without the prefix if the
	 * prefix matches, and `null` if it doesn't.
	 * @param {Object} msg - The message to process
	 * @returns {Array<String|null>}
	 **/
	splitPrefixFromContent (msg) {
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

	defineCategories(categories){
		if(Array.isArray(categories)){
			this.categories = categories
		}
	}

	findCategories(categories){
		if(!Array.isArray(categories)){
			categories = [categories]
		}
		return this.categories.find(c => categories.includes(c.name))
	}

	getCommandsFromCategories(categories){
		if(!Array.isArray(categories)){
			categories = [categories]
		}
		// console.log('CAT',categories);
		const cmds = this.commands.filter( c => categories.includes(c.category.toLowerCase()))
		// console.log(cmds);
		if(cmds.length < 1){return};
		function sortCmdsFromCat(a,b){
	    a = a.name.toLowerCase();b = b.name.toLowerCase();
	    if(a > b){return 1}else if(a < b){return -1}else{return 0}
	  }
		function showSubcommands(cmd){
	    if(cmd.subcommands.length < 1){
	      return '';
	    }else{
	      const scmds = cmd.subcommands.map(scmd => {
	        if(scmd.hide){return};
	        return `    · \`${scmd.name}${scmd.args ? ' ' + scmd.args : ''}\` - ${scmd.help}`
	      }).filter(scmd => scmd)
	      // console.log(scmds);
	      if(scmds.length < 1){return ''};
	      return '\n' + scmds.join('\n')
	    }
	  }
		const concat = (sep,...things) => things.join(sep || '')
		// console.log('CON');
		const capitalize = (text) => text[0].toUpperCase() + text.slice(1)
		const text = concat(this.user.username + ' - Help',categories.map(cat => {
	    return `**${capitalize(cat)}**\n\n${cmds.filter(c => {return cat === c.category.toLowerCase() && !c.hide}).sort(sortCmdsFromCat).map(c => `\`${this.defaultPrefix}${c.name}${c.args ? ' ' + c.args : ''}\` - ${c.help}${showSubcommands(c)}`).join('\n')}`
	  }).join('\n\n'))
		return text
	}

	checkRolesCanUse(msg,rolesName){
		if(msg.channel.type !== 0) return
		const member = msg.channel.guild.members.get(msg.author.id)
		if(!member) return
		const roles = member.roles
		if(typeof(rolesName) === 'string'){rolesName = [rolesName]}
		rolesName = rolesName.map(r => r.toLowerCase())
		return roles.find( r => {
			return rolesName.includes(msg.channel.guild.roles.get(r).name.toLowerCase())
		})
	}

	checkHasPermissions(msg,permissions){
		if(msg.channel.type !== 0) return
		const member = msg.channel.guild.members.get(msg.author.id)
		if(!member) return
		return !Object.keys(permissions).map(p => ({name : p, enable : permissions[p]})).some(p => member.permission.json[p.name] !== p.enable)
	}

	addWatcher(event,watcher){
		if (!(watcher instanceof Watcher)) throw new TypeError('Not a watcher')
		if(!watcher.enable){return console.log(`${watcher.name} de ${watcher.event} no está activado`)}
		const events = Object.keys(this.watchers)
		if(!events.includes(event)){return console.log('ERROR adding event',event)}
		this.watchers[event].push(watcher)
		console.log('Added Watcher',watcher.name);
		console.log(this.watchers[event]);
	}

	addWatcherFile(filename){
		try {
			const watcher = reload(filename)
			watcher.filename = filename
			this.addWatcher(watcher.event,watcher)
			// u.debug('Added command from', filename)
		} catch (e) {
			console.log(e);
			// u.warn('Command from', filename, "couldn't be loaded.\n", e)
		}
		return this
	}

	addWatcherDir (dirname) {
		if (!dirname.endsWith('/')) dirname += '/'
		const pattern = dirname + '*.js'
		const filenames = glob.sync(pattern)
		for (let filename of filenames) {
			this.addWatcherFile(filename)
		}
		return this
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
