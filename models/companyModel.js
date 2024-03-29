const mongoose = require('mongoose')

const CompanySchema = new mongoose.Schema(
	{
		logo: { type: String, required: true },
		name: { type: String, required: true },
		description: { type: String, required: true },
		address: {
			country: { type: String, required: true },
			state: { type: String, required: true },
			city: { type: String, required: true },
			streetAddress: { type: String, required: true },
			postalCode: { type: String, required: true },
		},
		website: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		phone: { type: String, required: true },
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'catogery',
			required: true,
		},
		status: {
			type: String,
			default: 'inactive',
		},
		sociallinks: [{ url: String, platform: String }],
		reviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'review',
				required: false,
			},
		],
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

module.exports = mongoose.model('company', CompanySchema)
