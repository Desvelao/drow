module.exports = ({time, response, responseDM, run}) => {
	const requirement = {
		validate: (msg, args, client, command, req) => {
			if (msg.channel.type === 1) { return null }
			const cooldown = (req.cooldowns[msg.channel.id] || 0) - Math.round(new Date().getTime() / 1000)
			args.reqChannelCooldown = { cooldown, channel: msg.channel.name, user: msg.author.username }
			return cooldown < 0
		},
		cooldowns: {},
		time,
		response,
		responseDM,
		run,
		init: (client, command, req) => {
			// Add hook to after command execute
			command.addHook('executed', (msg, args, client, command) => {
				req.cooldowns[msg.channel.id] = Math.round(new Date().getTime() / 1000) + req.time
			})
		} 
	}
	if (response) {
		if (typeof response === 'string') {
			requirement.response = (msg, args, client, command, req) => replacement(response, args.reqChannelCooldown)
		} else if (typeof response === 'function') {
			requirement.response = (msg, args, client, command, req) => replacement(response(msg, args, client, command, req), args.reqChannelCooldown)
		}
	}
	if (responseDM) {
		if (typeof responseDM === 'string') {
			requirement.responseDM = (msg, args, client, command, req) => replacement(responseDM, args.reqChannelCooldown)
		} else if (typeof responseDM === 'function') {
			requirement.responseDM = (msg, args, client, command, req) => replacement(responseDM(msg, args, client, command, req), args.reqChannelCooldown)
		}
	}
	return requirement
}

const replacement = (response, { cooldown, channel, user }) => response.replace(new RegExp('%cd%', 'g'), cooldown)
	.replace(new RegExp('%channel%', 'g'), channel)
	.replace(new RegExp('%user%', 'g'), user)
