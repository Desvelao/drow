module.exports = (guilds, response, run) => ({
    condition: (msg, req, cmd) => msg.channel.guild && !req.guilds.includes(msg.channel.guild.id),
    guilds,
    response,
    run
})