require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const UserController = require('./controllers/userController')
const CompanyController = require('./controllers/companyController')
const CategoryController = require('./controllers/categoryController')
const ReviewController = require('./controllers/reviewController')

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

module.exports = app
