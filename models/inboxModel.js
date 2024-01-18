const mongoose = require('mongoose')

const InboxSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		subject: { type: String, required: false },
		message: { type: String, required: false },
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

const Inbox = mongoose.model('inbox', InboxSchema)

module.exports = Inbox
