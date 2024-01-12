const mongoose = require('mongoose')

const ReviewReplySchema = new mongoose.Schema(
	{
		reviewID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'review',
			required: true,
		},
		replyMessage: { type: String, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

module.exports = mongoose.model('reviewReply', ReviewReplySchema)
