const express = require('express')
const router = express.Router()
const Inbox = require('../models/inboxModel')

router.get('/', async (req, res) => {
	try {
		const inbox = await Inbox.find().sort({ createdAt: -1 }).lean().exec()
		return res.status(200).send(inbox)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.get('/:id', async (req, res) => {
	try {
		const inbox = await Inbox.findById(req.params.id).lean().exec()
		return res.status(200).send(inbox)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.post('/', async (req, res) => {
	try {
		const inbox = await Inbox.create(req.body)
		return res.status(201).send(inbox)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.delete('/:id', async (req, res) => {
	try {
		const inbox = await Inbox.findByIdAndDelete(req.params.id)
		return res.status(204).send(inbox)
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})

module.exports = router
