module.exports = ({cooldowns = {}, time, response = "Not yet! Ready in **%cd%**s", responseDM, run}) => ({
    condition: (msg, args, client, command, req) => {
		const cooldown = (req.cooldowns[msg.author.id] || 0) - Math.round(new Date().getTime() / 1000)
		return [ cooldown < 0, { cooldown } ]
    },
	cooldowns,
	time,
	response: (msg, args, client, command, req, {cooldown}) => response.replace(new RegExp('%cd%', 'g'), cooldown).replace(new RegExp('%username%', 'g'), msg.author.username),
	responseDM,
	run,
	init: (client, command, req) => {
		// Add hook to after command execute
		command.addHook('executed', (msg, args, client, command) => {
			req.cooldowns[msg.author.id] = Math.round(new Date().getTime() / 1000) + req.time
		})
	} 
})
