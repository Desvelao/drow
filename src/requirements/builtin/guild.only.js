module.exports = ({ response, responseDM, run }) => ({
	validate: (msg, args, client, command, req) => msg.channel.type === 0,
	response,
	responseDM,
	run
})