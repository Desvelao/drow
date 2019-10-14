module.exports = ({response, responseDM, run}) => ({
    condition: (msg, req, cmd) => msg.author.id === cmd.client.owner.id,
    response,
    responseDM,
    run
})