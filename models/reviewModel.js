const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema(
	{
		companyID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'company',
			required: true,
		},
		reviewerName: { type: String, required: true },
		reviewTitle: { type: String, required: true },
		reviewMessage: { type: String, required: false },
		userPhoto: {
			type: String,
			required: false,
			default: 'https://reviews-app.s3.ap-northeast-1.amazonaws.com/1705055202734',
		},
		rating: { type: Number, required: false, default: 0 },
		reply: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'reviewReply',
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

const Reviews = mongoose.model('review', ReviewSchema)

module.exports = Reviews
