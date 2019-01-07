
/** Representing a Extension */
class Plugin {
	/**
	* Extends Client
	* @class
	* @param {Client} client - Discord Client
	* @param {object} options - Options
	*/
	constructor(client, options = {}) {
		this.client = client
		this.options = options
		this.enable = options.enable !== undefined ? options.enable : true
	}
	ready() { } /* eslint class-methods-use-this : "off" */
}

module.exports = Plugin
