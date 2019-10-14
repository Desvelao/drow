module.exports = ({guilds = [], response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => msg.channel.guild && !req.guilds.includes(msg.channel.guild.id),
    guilds,
    response,
    responseDM,
    run
})