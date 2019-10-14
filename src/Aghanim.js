const Eris = require('eris') /* eslint import/no-cycle : "off" */
const Client = require('./Client');
const Command = require('./Command');
const Category = require('./Category');
const Component = require('./Component');
const Logger = require('./Logger')
const CommandRequirementsCreators = require('./requirements')

/**
 * Aghanim module to create a Command Client for {@link https://abal.moe/Eris/docs/getting-started Eris} using nodejs!
 * @module aghanim
 * @returns {Client} Command client class
 */

module.exports = Client;
/** @prop {Client} Client - Command client class*/
module.exports.Client = Client;
/** @prop {Command} Command - Command class*/
module.exports.Command = Command;
/** @prop {Category} Category - Category class*/
module.exports.Category = Category;
/** @prop {Component} Component - Component class*/
module.exports.Component = Component;
/** @prop {Eris} Component - See {@link https://abal.moe/Eris/docs/getting-started Eris} */
module.exports.Eris = Eris;
/** @prop {Logger} Component See {@link https://github.com/Geo1088/another-logger another-logger} */
module.exports.Logger = Logger;
/** @prop {CommandRequirementsCreators} CommandRequirementsCreators See {@link https://desvelao.github.com/aghanim CommandRequirements} */
module.exports.CommandRequirementsCreators = CommandRequirementsCreators;

