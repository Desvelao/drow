const Eris = require('eris');
const Extension = require('../../Extension')

module.exports = new Extension('eris-client',function(bot){
	Eris.Message.prototype.reply = function(message,file){
		return new Promise((resolve,reject) => {
			this.channel.createMessage(message,file).then(m => resolve(m)).catch(err => reject(err))
		})
	}

	Eris.Message.prototype.replyDM = function(content,file){
		return new Promise((resolve,reject) => {
			this.author.getDMChannel().then(channel => channel.createMessage(content,file)).then(m => resolve(m)).catch(err => reject(err))
		})
	}
	Eris.Message.prototype.replyTest = function(content,file){
		return new Promise((resolve,reject) => {
			this.author.getDMChannel().then(channel => channel.createMessage(content,file)).then(m => resolve(m)).catch(err => reject(err))
		})
	}
})
