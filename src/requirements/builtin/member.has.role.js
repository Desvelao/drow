module.exports = ({role, response, responseDM, run, incaseSensitive}) => ({
    condition: (msg, args, client, command, req) => {
        if(!msg.channel.guild){return false}
        const member = msg.channel.guild.members.get(msg.author.id)
        if(!member){return false}
        let { role } = req
        role = role.map(r => toInCaseSensitive(r, req.incaseSensitive))
        return member.roles.some( r => 
            role.includes( 
                toInCaseSensitive(msg.channel.guild.roles.get(r).name, req.incaseSensitive)
            ) 
        )
    },
    role: Array.isArray(role) ? role : [role],
    response,
    responseDM,
    run,
    incaseSensitive
})

const toInCaseSensitive = (text, incase) => incase ? text.toLowerCase() : text