module.exports = (roles, response, run) => ({
    condition: (msg, req, cmd) => {
        if(!msg.channel.guild){return false}
        const member = msg.channel.guild.members.get(msg.author.id)
        if(!member){return false}
        const { roles } = req
        if (typeof (roles) === 'string') { roles = [roles] }
		roles = roles.map(r => r.toLowerCase())
		return member.roles.find( r => roles.includes(msg.channel.guild.roles.get(r).name.toLowerCase()) )
    },
    roles,
    response,
    run
})