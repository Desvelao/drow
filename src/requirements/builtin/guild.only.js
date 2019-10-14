module.exports = (response) => ({
    condition: (msg, req, cmd) => msg.channel.type === 0,
    response
})