module.exports = ({store = [], response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => msg.channel.guild && !req.store.includes(msg.channel.guild.id),
    store,
    response,
    responseDM,
    run
})