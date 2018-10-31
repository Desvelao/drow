/** Representing a Extension */
class Extension {
	/**
	* Extends Aghanim or Eris
	* @class
	* @param {string} name - Name of Extension   [description]
	* @param {Extension~Process} process - Process of Extension
	*/
	constructor(name, process) {
		this.name = name
		this.process = process
	}

	/**
	 * [exports description]
	 * @callback Extension~Process
	 * @param bot - representing Aghanim.Client instance
	 * @param Eris - representing Eris package. It extends using
	 * Eris[structure].prototye[prop or method]
	 */
}

module.exports = Extension
