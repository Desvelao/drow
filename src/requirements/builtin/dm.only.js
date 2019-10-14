module.exports = ({response, run}) => ({
    condition: (msg, req, cmd) => msg.channel.type === 1,
    response,
    run
})