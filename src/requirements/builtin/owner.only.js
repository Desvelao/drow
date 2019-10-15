module.exports = ({response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => msg.author.id === cmd.client.owner.id,
    response,
    responseDM,
    run
})