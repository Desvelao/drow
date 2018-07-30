/** Class representing a category of commands. */
class Category {
	/**
   * Create a category.
   * @param {string} name - The name of category.
   * @param {string} string - Help description
   * @param {object} options - Help description
   * @param {object} options.hide - Hide when use default help command
   * @param {object} options.restrict -
   */
	constructor (name, help, options) {
		if(!name){throw new Error('Name is required')}
		this.name = name || ''
		this.help = help || `Help for ${this.name} category`
		options = options || {}
		this.hide = options.hide || false
		this.restrict = options.restrict || function(){return false}
	}
}

module.exports = Category

// /**
//  * @namespace MyNamespace.MySubNamespace
//  */
//
//  (function (MyNamespace) {
//      /**
//       * Foo namespace
//       * @namespace Foo
//       * @memberOf MyNamespace.MySubNamespace
//       */
//      var Foo = {
//          /**
//           * Does something.
//           * @memberOf MyNamespace.MySubNamespace.Foo
//           * @param {object} someParam Some parameter.
//           */
//          doSomething: function (someParam) {
//              // doing it
//          }
//      };
//      MyNamespace.MySubNamespace.Foo = Foo;
//  })(window.MyNamespace)
