require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const User = require('./models/userModel')
const Company = require('./models/companyModel')
const Review = require('./models/reviewModel')

const UserController = require('./controllers/userController')
const CompanyController = require('./controllers/companyController')
const CategoryController = require('./controllers/categoryController')
const ReviewController = require('./controllers/reviewController')
const InboxController = require('./controllers/inboxController')

const { register, login } = require('./controllers/authController')

app.use(express.json())
app.use(cors())

app.use('/api', (req, res) => {
	return res.status(200).send('Welcome to review app')
})

app.use('/signup', register)
app.use('/login', login)
app.use('/user', UserController)
app.use('/company', CompanyController)
app.use('/reviews', ReviewController)
app.use('/category', CategoryController)
app.use('/inbox', InboxController)

app.get('/count', async (req, res) => {
	try {
		const user = await User.countDocuments()
		const company = await Company.countDocuments()
		const reviews = await Review.countDocuments()
		return res.status(200).send({ user, company, reviews })
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})

module.exports = app
