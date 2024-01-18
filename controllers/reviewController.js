const express = require('express')
const router = express.Router()
const Review = require('../models/reviewModel')

router.get('/', async (req, res) => {
	try {
		const review = await Review.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.populate({
				path: 'companyID',
				select: 'name',
				populate: {
					path: 'category',
					select: 'name',
				},
			})
			.lean()
			.exec()
		return res.status(200).send(review)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.get('/:id', async (req, res) => {
	try {
		const reviews = await Review.find({
			companyID: req.params.id,
		})
			.sort({ createdAt: -1 })
			.limit(2)
			.populate({
				path: 'companyID',
				select: 'name',
				populate: {
					path: 'category',
					select: 'name',
				},
			})
			.lean()
			.exec()
		return res.status(200).send(reviews)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.post('/', async (req, res) => {
	try {
		const review = await Review.create(req.body)
		return res.status(201).send({ review })
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.patch('/:id', async (req, res) => {
	try {
		const review = await Review.findByIdAndUpdate(req.params.id, req.body)
		return res.status(203).send({ review })
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.delete('/:id', async (req, res) => {
	try {
		const review = await Review.findByIdAndDelete(req.params.id)
		return res.status(204).send(review)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
module.exports = router
