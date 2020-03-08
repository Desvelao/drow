module.exports = ({time, response, responseDM, run}) => {
	const requirement = {
		validate: (msg, args, client, command, req) => {
			if (msg.channel.type !== 0) { return null }
			const cooldown = (req.cooldowns[msg.guild.id] || 0) - Math.round(new Date().getTime() / 1000)
			args.reqGuildCooldown = { cooldown, guild: msg.guild.name, user: msg.author.username }
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
				req.cooldowns[msg.guild.id] = Math.round(new Date().getTime() / 1000) + req.time
			})
		}
	}
	if (response) {
		if (typeof response === 'string') {
			requirement.response = (msg, args, client, command, req) => replacement(response, args.reqGuildCooldown)
		} else if (typeof response === 'function') {
			requirement.response = (msg, args, client, command, req) => replacement(response(msg, args, client, command, req), args.reqGuildCooldown)
		}
	}
	if (responseDM) {
		if (typeof responseDM === 'string') {
			requirement.responseDM = (msg, args, client, command, req) => replacement(responseDM, args.reqGuildCooldown)
		}else if (typeof responseDM === 'function') {
			requirement.responseDM = (msg, args, client, command, req) => replacement(responseDM(msg, args, client, command, req), args.reqGuildCooldown)
		}
	}
	return requirement
}

const replacement = (response, { cooldown, guild, user }) => response.replace(new RegExp('%cd%', 'g'), cooldown)
	.replace(new RegExp('%guild%', 'g'), guild)
	.replace(new RegExp('%user%', 'g'), user)
