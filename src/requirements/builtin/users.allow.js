module.exports = ({users = [], response, responseDM, run}) => ({
    condition: (msg, args, client, command, req) => req.users.includes(msg.author.id),
    users,
    response,
    responseDM,
    run
})