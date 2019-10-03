/** Class representing a category of commands. */
class Category {
	/**
   * Create a category.
   * @param {string} name - The name of category.
   * @param {string} [help = `Help for ${this.name} category`]  - Help description
   * @param {object} options - Help description
   * @param {object} [options.hide = false] - Hide when use default help command
   */
	constructor(name, help, options = {}) {
		if (!name) { throw new Error('Name is required') }
		this.name = name
		this.help = help || `Help for ${this.name} category`
		this.hide = options.hide || false
		for (const opt in options) { /* eslint no-restricted-syntax : "off" */
			if (!this.hasOwnProperty(opt)) { /* eslint no-prototype-builtins : "off" */
				this[opt] = options[opt]
			}
		}
	}
}

module.exports = Category
