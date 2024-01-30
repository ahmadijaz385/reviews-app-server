const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: {
			type: String,
			default: 'user',
		},
		status: {
			type: String,
			default: 'inactive',
		},
		company: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'company',
			required: false,
			default: null
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

userSchema.pre('save', function (next) {
	const hash = bcrypt.hashSync(this.password, 10)
	this.password = hash
	return next()
})

userSchema.methods.checkPassword = function (password) {
	return bcrypt.compareSync(password, this.password)
}

const User = mongoose.model('user', userSchema)

module.exports = User
