module.exports = ({time, response, responseDM, run}) => {
	const req = {
		condition: (msg, args, client, command, req) => {
			if(msg.channel.type === 1){ return null }
			const cooldown = (req.cooldowns[msg.channel.id] || 0) - Math.round(new Date().getTime() / 1000)
			return [ cooldown < 0, { cooldown, channel: msg.channel.name, user: msg.author.username } ]
		},
		cooldowns : {},
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
	if(response){
		if(typeof(response) === 'string'){
			req.response = (msg, args, client, command, req, ctx) => replacement(response, ctx)
		}else if(typeof(response) === 'function'){
			req.response = (msg, args, client, command, req, ctx) => replacement(response(msg, args, client, command, req, ctx), ctx)
		}
	}
	if(responseDM){
		if(typeof(responseDM) === 'string'){
			req.responseDM = (msg, args, client, command, req, ctx) => replacement(responseDM, ctx)
		}else if(typeof(responseDM) === 'function'){
			req.responseDM = (msg, args, client, command, req, ctx) => replacement(responseDM(msg, args, client, command, req, ctx), ctx)
		}
	}
	return req
}

const replacement = (response, {cooldown, channel, user}) => 
	response.replace(new RegExp('%cd%', 'g'), cooldown)
		.replace(new RegExp('%channel%', 'g'), channel)
		.replace(new RegExp('%user%', 'g'), user)
