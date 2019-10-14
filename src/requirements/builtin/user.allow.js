module.exports = ({users, response, run}) => ({
    condition: (msg, args, client, command, req) => req.users.includes(msg.author.id),
    response,
    users,
    run
})