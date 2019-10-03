/** Representing a Component */
class Component {
	/**
	* Extends Client
	* @class
	* @param {Client} client - Aghanim Client
	* @param {object} options - Options
	*/
	constructor(client, options = {}) {
		/** @prop {Client} - Client instance */
		this.client = client
		this.options = options
		/** @prop {bolean} - Enable/Disable component */
		this.enable = options.enable !== undefined ? options.enable : true
	}

	ready() { } /* eslint class-methods-use-this : "off" */
}

module.exports = Component
