const User = require('../models/userModel')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { body, validationResult } = require('express-validator')

const generateToken = (user) => {
	return jwt.sign({ user }, process.env.JWT_SECRET__KEY)
}
const register = router.post(
	'/',
	body('name').trim().not().isEmpty().withMessage('Name is required'),
	body('email')
		.isEmail()
		.withMessage('Email is required')
		.not()
		.isEmpty()
		.withMessage('Email is required')
		.custom(async (value) => {
			const user = await User.findOne({ email: value })

			if (user) {
				throw new Error('Email is already taken')
			}
			return true
		}),
	body('password').trim().not().isEmpty().withMessage('Password is required'),
	async (req, res) => {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).send({ errors: errors.array() })
			}
			let user = await User.findOne({ email: req.body.email }).lean().exec()
			if (user) {
				throw new Error('Email already exists')
			}
			user = await User.create(req.body)
			const token = generateToken(user)
			return res.status(200).send({ user, token })
		} catch (error) {
			return res.status(500).send({ error: error.message })
		}
	}
)
const login = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email }).populate('company')
		if (!user) {
			throw new Error('User with that email does not exits')
		}
		if (user.status === 'inactive') {
			throw new Error('User is inactive. Please wait for admin approval')
		}
		const match = user.checkPassword(req.body.password)
		if (!match) {
			throw new Error('Wrong email or password')
		}
		const token = generateToken(user)
		const userWithoutPassword = { ...user._doc }
		delete userWithoutPassword.password
		return res.send({ user: userWithoutPassword, token })
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
}

module.exports = { register, login }
