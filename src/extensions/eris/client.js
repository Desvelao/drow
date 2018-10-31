const Eris = require('eris');
const { getDefaultChannel } = require('../../utils/guild')
const Extension = require('../../Extension')

/* eslint prefer-arrow-callback: "off", func-names : "off", no-unused-vars : "off" */
module.exports = new Extension('eris-client', function (bot) {
	Eris.Client.prototype.createMessageGuilds = function (content, file) {
		return Promise.all(this.guilds
			.map(guild => getDefaultChannel(guild, this, true))
			.map(channel => this.createMessage(channel.id, content, file)))
	}
})
