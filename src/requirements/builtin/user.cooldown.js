module.exports = ({time, response, responseDM, run}) => {
	const req = {
		condition: (msg, args, client, command, req) => {
			const cooldown = (req.cooldowns[msg.author.id] || 0) - Math.round(new Date().getTime() / 1000)
			return [ cooldown < 0, { cooldown, user: msg.author.username } ]
		},
		cooldowns : {},
		time,
		response,
		responseDM,
		run,
		init: (client, command, req) => {
			// Add hook to after command execute
			command.addHook('executed', (msg, args, client, command) => {
				req.cooldowns[msg.author.id] = Math.round(new Date().getTime() / 1000) + req.time
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

const replacement = (response, {cooldown, user}) => 
	response.replace(new RegExp('%cd%', 'g'), cooldown)
		.replace(new RegExp('%user%', 'g'), user)
