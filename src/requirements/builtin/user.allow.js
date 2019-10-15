module.exports = ({store = [], response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => req.store.includes(msg.author.id),
    store,
    response,
    responseDM,
    run
})