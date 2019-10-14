module.exports = ({permissions, response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => {
        console.log('start permissions req')
        const guild = msg.channel.guild
        if(!guild){ return null }
		const member = guild.members.get(msg.author.id)
        if (!member){ return null }
        console.log(req.permissions, member.permission.json)
		return !Object.keys(req.permissions)
			.map(p => ({name : p, enable : req.permissions[p]}))
			.some(p => member.permission.json[p.name] !== p.enable)
    },
    permissions,
    response,
    responseDM,
    run
})