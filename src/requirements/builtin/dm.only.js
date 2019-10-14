module.exports = ({response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => msg.channel.type === 1,
    response,
    responseDM,
    run
})