const express = require('express')
const Company = require('../models/companyModel')
const Reviews = require('../models/reviewModel')
const ReviewReply = require('../models/reviewReplyModel')
const upload = require('../middleware/upload-photo')
const router = express.Router()

const { body, validationResult } = require('express-validator')

router.post('/create', upload.single('logo'), async (req, res) => {
	try {
		if (req.file) {
			req.body.logo = req.file.location
		}
		const company = await Company.create(req.body)
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
		return res.status(201).send({ success: 'Review Posted' })
	} catch (err) {
		return res.status(500).send({
			statue: 'failure',
			msg: err.message,
		})
	}
})

router.delete('/:id/reviews/:idx', async (req, res) => {
	try {
		const review = await Reviews.findByIdAndDelete(req.params.idx)
		const company = await Company.findByIdAndUpdate(req.params.id, {
			$pull: { reviews: req.params.idx },
		})
		return res.status(200).send({ review: review })
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})

router.post('/:id/reviews/:reviewID/reply', async (req, res) => {
	try {
		console.log(req.body, 'req.body')
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
