module.exports = ({channels = [], response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => !req.channels.includes(msg.channel.id),
    channels,
    response,
    responseDM,
    run
})