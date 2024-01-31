const express = require('express')
const Company = require('../models/companyModel')
const User = require('../models/userModel')
const Reviews = require('../models/reviewModel')
const ReviewReply = require('../models/reviewReplyModel')
const upload = require('../middleware/upload-photo')
const SendMail = require('../middleware/sendEmail')

const router = express.Router()

const { body, validationResult } = require('express-validator')

router.post('/create', upload.single('logo'), async (req, res) => {
	try {
		let userID = req.body.userID
		delete req.body.userID
		if (req.file) {
			req.body.logo = req.file.location
		}
		const company = await Company.create(req.body)
		if (company) {
			await User.findByIdAndUpdate(userID, { $set: { company: company._id } })
		}
		return res.status(201).json(company)
	} catch (error) {
		console.log(error.message)
		return res.status(500).send('Error :', error.message)
	}
})

router.get('/', async (req, res) => {
	try {
		let filter = {}
		if (req.query.category) {
			filter = {
				category: req.query.category,
			}
		}
		const companies = await Company.find(filter)
			.populate('category')
			.populate({
				path: 'reviews',
				select: 'rating',
			})
			.sort({ createdAt: req.query._sort })
			.lean()
			.exec()
		return res.status(200).send(companies)
	} catch (error) {
		console.log(error.message)
		return res.status(500).send('Error :', error.message)
	}
})
router.get('/lists', async (req, res) => {
	try {
		const companies = await Company.find({}, 'name')
		return res.status(200).send(companies)
	} catch (error) {
		console.log(error.message)
		return res.status(500).send('Error :', error.message)
	}
})

router.get('/:id', async (req, res) => {
	try {
		let company
		if (req.query.categoryID) {
			company = await Company.find({
				category: req.query.categoryID,
			})
				.populate('category')
				.populate({
					path: 'reviews',
					populate: {
						path: 'reply',
					},
				})
				.lean()
				.exec()
		} else {
			company = await Company.findById(req.params.id)
				.populate('category')
				.populate({
					path: 'reviews',
					populate: {
						path: 'reply',
					},
				})
				.lean()
				.exec()
		}
		return res.status(200).send(company)
	} catch (error) {
		console.log(error.message, ' error.message')
		return res.status(500).send('Error :', error.message)
	}
})

router.patch('/:id/edit', async (req, res) => {
	try {
		const company = await Company.findByIdAndUpdate(req.params.id, req.body).lean().exec()
		return res.status(200).send(company)
	} catch (error) {
		return res.status(500).send('Error :', error.message)
	}
})

router.delete('/:id/delete', async (req, res) => {
	try {
		const company = await Company.findByIdAndDelete(req.params.id).lean().exec()
		return res.status(200).send(company)
	} catch (error) {
		return res.status(500).send('Error :', error.message)
	}
})

router.post('/:id/reviews', upload.single('userPhoto'), async (req, res) => {
	try {
		if (req.file) {
			req.body.userPhoto = req.file.location
		}
		const review = await Reviews.create(req.body)
		const company = await Company.findByIdAndUpdate(req.params.id, {
			$push: { reviews: review._id },
		})
		const emailData = {
			from: process.env.EMAIL_FROM,
			to: company.email,
			subject: `New Review Received`,
			html: `
                <h1>Dear ${company.name}</h1>

								<p>We hope this message finds you well.</p>
								<p>We wanted to inform you that a new review has been submitted regarding our company. Your attention to this matter would be greatly appreciated.</p>
								<p>Thank you for your continued dedication to maintaining the quality of our services.</p>
                <p>${process.env.CLIENT_URL}/reviews/${req.params.id}</p>
            `,
		}

		SendMail(emailData, res)
		// return res.status(201).send({ success: 'Review Posted' })
	} catch (err) {
		return res.status(500).send({
			statue: 'failure',
			msg: err.message,
		})
	}
})

router.delete('/:id/reviews/:idx', async (req, res) => {
	try {
		// const review = await Reviews.findByIdAndDelete(req.params.idx)
		const review = await Reviews.findByIdAndUpdate(req.params.idx, {
			isDeleted: true,
		})
		// const company = await Company.findByIdAndUpdate(req.params.id, {
		// 	$pull: { reviews: req.params.idx },
		// })
		return res.status(200).send({ review: review })
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})

router.post('/:id/reviews/:reviewID/reply', async (req, res) => {
	try {
		const reviewReply = await ReviewReply.create(req.body)
		const company = await Reviews.findByIdAndUpdate(req.params.reviewID, {
			reply: reviewReply._id,
		})
		return res.status(201).send(company)
	} catch (err) {
		return res.status(500).send({
			statue: 'failure',
			msg: err.message,
		})
	}
})

router.delete('/:id/reviews/:reviewID/reply/:replyID', async (req, res) => {
	try {
		await ReviewReply.findByIdAndDelete(req.params.replyID)
		await Reviews.findByIdAndDelete(req.params.reviewID, { $unset: { reply: 1 } }, { new: true })
		return res.status(200).send('Review reply deleted successfully')
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})

module.exports = router
