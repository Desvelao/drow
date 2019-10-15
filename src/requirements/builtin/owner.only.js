module.exports = ({response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => msg.author.id === client.owner.id,
    response,
    responseDM,
    run
})