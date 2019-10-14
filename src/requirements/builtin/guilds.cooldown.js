module.exports = ({cooldowns = {}, time, response = "Not yet! Command on cooldown for this guild. Ready in **%cd%** seconds", responseDM, responseNotGuild, run}) => ({
    condition: (msg, args, client, command, req) => {
		if(!msg.channel.guild){
			return typeof(req.responseNotGuild) === 'string' ? [false, { response: req.responseNotGuild }] : null // ignore response/run
		}
		const cooldown = (req.cooldowns[msg.channel.guild.id] || 0) - Math.round(new Date().getTime() / 1000)
		return [ cooldown < 0, { cooldown, response, guild: msg.channel.guild.name } ]
    },
	cooldowns,
	time,
	response: (msg, args, client, command, req, {cooldown}) => response.replace(new RegExp('%cd%', 'g'), cooldown).replace(new RegExp('%username%', 'g'), msg.author.username),
	responseDM,
	responseNotGuild, 
	run,
	init: (client, command, req) => {
		// Add hook to after command execute
		command.addHook('executed', (msg, args, client, command) => {
			req.cooldowns[msg.channel.guild.id] = Math.round(new Date().getTime() / 1000) + req.time
		})
	} 
})
