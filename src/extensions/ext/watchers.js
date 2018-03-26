const glob = require('glob');
const reload = require('require-reload')(require);

module.exports = function(){
  if(!this.watchers){this.watchers = {}}
  const _events_watcher = ['messageReactionAdd','messageReactionRemove','guildCreate','guildDelete','guildMemberAdd','guildMemberRemove']
  _events_watcher.forEach(event => this.watchers[event] = [])

  // this.addWatcher = function(event,watcher){
	// 	const events = Object.keys(this.watchers)
	// 	if(!events.includes(event)){return console.log('ERROR adding event')}
	// 	this.watchers[event].push(watcher)
	// 	console.log('Added Watcher',watcher.name);
	// 	console.log(this.watchers[event]);
	// }
  //
	// this.addWatcherFile = function(filename){
	// 	try {
	// 		const watcher = reload(filename)
	// 		watcher.filename = filename
	// 		this.addWatcher(watcher.event,watcher)
	// 		// u.debug('Added command from', filename)
	// 	} catch (e) {
	// 		console.log(e);
	// 		// u.warn('Command from', filename, "couldn't be loaded.\n", e)
	// 	}
	// 	return this
	// }
  //
	// this.addWatcherDir = function(dirname) {
	// 	if (!dirname.endsWith('/')) dirname += '/'
	// 	const pattern = dirname + '*.js'
	// 	const filenames = glob.sync(pattern)
	// 	for (let filename of filenames) {
	// 		this.addWatcherFile(filename)
	// 	}
	// 	return this
	// }

	this.handleWatcherReactionAdd = function(msg,emoji,userID){
		this.watchers.messageReactionAdd.forEach(watcher => watcher.process.call(this,msg,emoji,userID))
	}

	this.handleWatcherReactionRemove = function(msg,emoji,userID){
		this.watchers.messageReactionRemove.forEach(watcher => watcher.process.call(this,msg,emoji,userID))
	}

	this.handleWatcherGuildCreate = function(guild){
		this.watchers.guidlCreate.forEach(watcher => watcher.process.call(this,guild))
	}

	this.handleWatcherGuildDelete = function(guild){
		this.watchers.guildDelete.forEach(watcher => watcher.process.call(this,guild))
	}

	this.handleWatcherMemberAdd = function(guild,member){
		this.watchers.guildMemberAdd.forEach(watcher => watcher.process.call(this,guild,member))
	}

	this.handleWatcherMemberRemove = function(guild,member){
		this.watchers.guildMemberRemove.forEach(watcher => watcher.process.call(guild,member))
	}

  this.on('messageReactionAdd',this.handleWatcherReactionAdd)
  .on('messageReactionRemove',this.handleWatcherReactionRemove)
  .on('guildCreate',this.handleWatcherGuildCreate)
  .on('guildDelete',this.handleWatcherGuildDelete)
  .on('guildMemberAdd',this.handleWatcherMemberAdd)
  .on('guildMemberRemove',this.handleWatcherMemberRemove)
  //************************************************************************************
  // addWatcher = function(event,watcher){
	// 	const events = Object.keys(this.watchers)
	// 	if(!events.includes(event)){return console.log('ERROR adding event')}
	// 	this.watchers[event].push(watcher)
	// 	console.log('Added Watcher',watcher.name);
	// 	console.log(this.watchers[event]);
	// }
  //
	// addWatcherFile(filename){
	// 	try {
	// 		const watcher = reload(filename)
	// 		watcher.filename = filename
	// 		this.addWatcher(watcher.event,watcher)
	// 		// u.debug('Added command from', filename)
	// 	} catch (e) {
	// 		console.log(e);
	// 		// u.warn('Command from', filename, "couldn't be loaded.\n", e)
	// 	}
	// 	return this
	// }
  //
	// addWatcherDir (dirname) {
	// 	if (!dirname.endsWith('/')) dirname += '/'
	// 	const pattern = dirname + '*.js'
	// 	const filenames = glob.sync(pattern)
	// 	for (let filename of filenames) {
	// 		this.addWatcherFile(filename)
	// 	}
	// 	return this
	// }
  //
	// handleWatcherReactionAdd(msg,emoji,userID){
	// 	this.watchers.messageReactionAdd.forEach(watcher => watcher.process.call(this,msg,emoji,userID))
	// }
  //
	// handleWatcherReactionRemove(msg,emoji,userID){
	// 	this.watchers.messageReactionRemove.forEach(watcher => watcher.process.call(this,msg,emoji,userID))
	// }
  //
	// handleWatcherGuildCreate(guild){
	// 	this.watchers.guidlCreate.forEach(watcher => watcher.process.call(this,guild))
	// }
  //
	// handleWatcherGuildDelete(guild){
	// 	this.watchers.guildDelete.forEach(watcher => watcher.process.call(this,guild))
	// }
  //
	// handleWatcherMemberAdd(guild,member){
	// 	this.watchers.guildMemberAdd.forEach(watcher => watcher.process.call(this,guild,member))
	// }
  //
	// handleWatcherMemberRemove(guild,member){
	// 	this.watchers.guildMemberRemove.forEach(watcher => watcher.process.call(guild,member))
	// }
}
