module.exports = ({permissions, response, responseDM, run}) => ({
    validate: (msg, args, client, command, req) => {
        const guild = msg.channel.guild
        if(!guild){ return null }
		const member = guild.members.get(msg.author.id)
        if (!member){ return null }
		return !Object.keys(req.permissions)
			.map(p => ({name : p, enable : req.permissions[p]}))
			.some(p => member.permission.json[p.name] !== p.enable)
    },
    permissions,
    response,
    responseDM,
    run
})