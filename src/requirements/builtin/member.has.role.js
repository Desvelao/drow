module.exports = ({roles, response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => {
        if(!msg.channel.guild){return false}
        const member = msg.channel.guild.members.get(msg.author.id)
        if(!member){return false}
        let { roles } = req
        if (typeof (roles) === 'string') { roles = [roles] }
        roles = roles.map(r => r.toLowerCase())
        console.log('ROLES',roles, member.roles, member.roles.map( r => msg.channel.guild.roles.get(r).name) , member.roles.some( r => roles.includes(msg.channel.guild.roles.get(r).name.toLowerCase()) ))
		return member.roles.some( r => roles.includes(msg.channel.guild.roles.get(r).name.toLowerCase()) )
    },
    roles: Array.isArray(roles) ? roles : [roles],
    response,
    responseDM,
    run
})