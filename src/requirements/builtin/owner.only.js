module.exports = ({response, run}) => ({
    condition: (msg, req, cmd) => msg.author.id === cmd.client.owner.id,
    response,
    run
})