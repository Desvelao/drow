const Eris = require('eris') /* eslint import/no-cycle : "off" */
const Client = require('./Client');
const Command = require('./Command');
const Category = require('./Category');
const Component = require('./Component');
const Logger = require('./Logger')

module.exports = Client;
module.exports.Client = Client;
module.exports.Command = Command;
module.exports.Category = Category;
module.exports.Component = Component;
module.exports.Eris = Eris;
module.exports.Logger = Logger;
