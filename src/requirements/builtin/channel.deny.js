module.exports = ({ channels = [], response, responseDM, run }) => ({
	validate: (msg, args, client, command, req) => !req.channels.includes(msg.channel.id),
	channels,
	response,
	responseDM,
	run
})