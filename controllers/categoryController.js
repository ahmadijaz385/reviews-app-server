const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const Category = require('../models/categoriesModel')
const Company = require('../models/companyModel')

router.post('/create', async (req, res) => {
	try {
		const category = await Category.create(req.body)
		return res.status(201).send(category)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.get('/', async (req, res) => {
	try {
		const category = await Category.find().lean().exec()
		return res.status(200).send(category)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.get('/top', async (req, res) => {
	try {
		const result = await Company.aggregate([
			{
				$lookup: {
					from: 'catogeries',
					localField: 'category',
					foreignField: '_id',
					as: 'categoryData',
				},
			},
			{
				$unwind: '$categoryData',
			},
			{
				$group: {
					_id: '$categoryData._id',
					categoryName: { $first: '$categoryData.name' },
					totalCompanies: { $sum: 1 },
					totalReviews: { $sum: { $size: '$reviews' } },
				},
			},
			{
				$limit: 6,
			},
		])
		return res.status(200).send(result)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.get('/:id', async (req, res) => {
	try {
		const categoryId = new mongoose.Types.ObjectId(req.params.id)
		let match = {
			category: categoryId,
		}
		if (req.query.freeWord) {
			match = {
				$and: [{ category: categoryId }, { name: { $regex: new RegExp(req.query.freeWord, 'i') } }],
			}
		}
		const reviews = await Company.aggregate([
			{
				$match: match,
			},
			{
				$unwind: '$reviews',
			},
			{
				$lookup: {
					from: 'reviews',
					localField: 'reviews',
					foreignField: '_id',
					as: 'reviewData',
				},
			},
			{
				$unwind: '$reviewData',
			},
			{
				$lookup: {
					from: 'catogeries',
					localField: 'category',
					foreignField: '_id',
					as: 'categoryData',
				},
			},
			{
				$unwind: '$categoryData',
			},
			{
				$project: {
					_id: '$reviewData._id',
					companyID: '$_id',
					companyName: '$name',
					categoryName: '$categoryData.name',
					reviewerName: '$reviewData.reviewerName',
					userPhoto: '$reviewData.userPhoto',
					reviewTitle: '$reviewData.reviewTitle',
					reviewMessage: '$reviewData.reviewMessage',
					rating: '$reviewData.rating',
					createdAt: '$reviewData.createdAt',
				},
			},
		])
		return res.status(200).send(reviews)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.get('/search/reviews', async (req, res) => {
	try {
		const categoryId = new mongoose.Types.ObjectId(req.query.categoryId)
		let match
		if (categoryId) {
			match = {
				category: categoryId,
			}
		}
		if (req.query.freeWord) {
			match = {
				$or: [
					{ reviewTitle: { $regex: new RegExp(req.query.freeWord, 'i') } },
					{ reviewMessage: { $regex: new RegExp(req.query.freeWord, 'i') } },
				],
			}
		}

		if (categoryId && req.query.freeWord) {
			match = {
				category: categoryId,
				$or: [
					{ reviewTitle: { $regex: new RegExp(req.query.freeWord, 'i') } },
					{ reviewMessage: { $regex: new RegExp(req.query.freeWord, 'i') } },
				],
			}
		}

		const reviews = await Company.aggregate([
			// {
			// 	$match: match,
			// },
			{
				$unwind: '$reviews',
			},
			{
				$lookup: {
					from: 'reviews',
					localField: 'reviews',
					foreignField: '_id',
					as: 'reviewData',
				},
			},
			{
				$unwind: '$reviewData',
			},
			{
				$lookup: {
					from: 'catogeries',
					localField: 'category',
					foreignField: '_id',
					as: 'categoryData',
				},
			},
			{
				$unwind: '$categoryData',
			},
			{
				$project: {
					_id: '$reviewData._id',
					companyID: '$_id',
					companyName: '$name',
					categoryName: '$categoryData.name',
					category: '$categoryData._id',
					reviewerName: '$reviewData.reviewerName',
					userPhoto: '$reviewData.userPhoto',
					reviewTitle: '$reviewData.reviewTitle',
					reviewMessage: '$reviewData.reviewMessage',
					rating: '$reviewData.rating',
					createdAt: '$reviewData.createdAt',
				},
			},
			{
				$match: match,
			},
		])
		return res.status(200).send(reviews)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.patch('/edit/:id', async (req, res) => {
	try {
		const category = await Category.findByIdAndUpdate(req.params.id, req.body)
		return res.status(203).send(category)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.delete('/delete/:id', async (req, res) => {
	try {
		const category = await Category.findByIdAndDelete(req.params.id)
		return res.status(204).send(category)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
module.exports = router
