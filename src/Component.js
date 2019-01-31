
/** Representing a Component */
class Component {
	/**
	* Extends Client
	* @class
	* @param {Client} client - Aghanim Client
	* @param {object} options - Options
	*/
	constructor(client, options = {}) {
		this.client = client
		this.options = options
		this.enable = options.enable !== undefined ? options.enable : true
	}
	ready() { } /* eslint class-methods-use-this : "off" */
}

module.exports = Component
