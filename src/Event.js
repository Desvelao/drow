const eventNames = [
	'messageCreate',
	'messageReactionAdd',
	'messageReactionRemove',
	'guildCreate',
	'guildDelete',
	'guildMemberAdd',
	'guildMemberRemove',
	'ready']

/** Class representing a Event (Eris) */
class Event {
	/**
	* Create a event.
	* @class
	* @param {string} name - The name id of the event.
	* @param {string} event - The event name corresponding to Eris events.
	* @param {object} options - The function to be called when the event is executed.
	* @param {boolean} options.enable - Enable/disable event
	* @param {function} process - The function to be called when the event is executed.
	*/
	constructor(name, event, options, process) {
		this.name = name
		// if (!this.name) throw new TypeError('Name is required')
		this.event = event
		this.process = process
		if (!eventNames.includes(this.event)) throw new TypeError(`Event with name: "${this.event}" isn't correct`)
		if (!this.event) throw new TypeError('Event is required')
		if (!this.process) throw new TypeError('Process is required')
		this.enable = options.enable || true
	}
	/**
	* [eventNames description]
	* @callback Event~process
	* @this {Aghanim}
	* @param
	*/
}


module.exports = Event
module.exports.eventNames = eventNames
