module.exports = ({cooldowns = {}, time, response = "Not yet! Ready in **%cd%**s", run}) => ({
    condition: (msg, args, client, command, req) => {
		const cooldown = (req.cooldowns[msg.author.id] || 0) - Math.round(new Date().getTime() / 1000)
		console.log('CD', cooldown, cooldown < 0)
		return [ cooldown < 0, { cooldown } ]
    },
	cooldowns,
	time,
    response: (msg, args, client, command, req, {cooldown}) => response.replace(new RegExp('%cd%', 'g'), cooldown).replace(new RegExp('%username%', 'g'), msg.author.username),
	run,
	init: (client, command, req) => {
		// Add hook to after command execute
		command.hooks.executed.push((msg, args, client, command) => {
			req.cooldowns[msg.author.id] = Math.round(new Date().getTime() / 1000) + req.time
		})
	} 
})

class Cooldown{
	constructor(config = {}){
		this.store = {}
		this.time = options.time
		this.message = options.message
	}
	get(id){
		return this.store[id] - Math.round(new Date().getTime() / 1000)
	}
	set(id, cd){
		this.store[id] = cd !== undefined ?
			cd : Math.round(new Date().getTime() / 1000) + this.time
	}
	get active(){
		return this.time && true
	}
}