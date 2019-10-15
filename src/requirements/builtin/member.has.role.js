module.exports = ({role, response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => {
        if(!msg.channel.guild){return false}
        const member = msg.channel.guild.members.get(msg.author.id)
        if(!member){return false}
        let { role } = req
        role = role.map(r => r.toLowerCase())
		return member.roles.some( r => roles.includes(msg.channel.guild.roles.get(r).name.toLowerCase()) )
    },
    role: Array.isArray(role) ? role : [role],
    response,
    responseDM,
    run
})