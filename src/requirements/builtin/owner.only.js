module.exports = ({ response, responseDM, run }) => ({
	validate: (msg, args, client, command, req) => msg.author.id === client.owner.id,
	response,
	responseDM,
	run
})