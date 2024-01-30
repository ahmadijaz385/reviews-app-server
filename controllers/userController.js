const express = require('express')
const router = express.Router()
const User = require('../models/userModel')
const { body, validationResult } = require('express-validator')

// router.post(
//   "/create",
//   body("name").trim().not().isEmpty().withMessage("Name is required"),
//   body("password").trim().not().isEmpty().withMessage("Password is required"),
//   body("email")
//     .isEmail()
//     .custom(async (value) => {
//       const user = await User.findOne({ email: value });

//       if (user) {
//         throw new Error("Email is already taken");
//       }
//       return true;
//     }),
//   body("mobile_no")
//     .trim()
//     .not()
//     .isEmpty()
//     .withMessage("Mobile No. is required")
//     .isNumeric()
//     .withMessage("Mobile No. must be a number")
//     .isLength({ min: 10, max: 10 })
//     .withMessage("Mobile No. be of 10 digit"),
//   body("age")
//     .trim()
//     .not()
//     .isEmpty()
//     .withMessage("Age is required")
//     .isNumeric()
//     .withMessage("Age  must be a number")
//     .custom((value) => {
//       if (value < 1 || value > 100) {
//         throw new Error("Age should be between 1 - 100");
//       }
//       return true;
//     }),
//   body("gender").trim().not().isEmpty().withMessage("Gender is required"),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       //   console.log({ errors });
//       if (!errors.isEmpty()) {
//         return res.status(400).send({ errors: errors.array() });
//       }
//       const user = await User.create(req.body);
//       return res.status(201).send({ User: user });
//     } catch (error) {
//       return res.status(500).send({ error: error.message });
//     }
//   }
// );

// router.post(
//   "/create",async (req, res) => {
//     try {
//       const user = await User.create(req.body);
//       return res.status(201).send({ User: user });
//     } catch (error) {
//       return res.status(500).send({ error: error.message });
//     }
//   }
// );

router.get('/', async (req, res) => {
	try {
		const user = await User.find().lean().exec()
		return res.status(200).send({ User: user })
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.get('/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id).populate({
			path: 'company',
			populate: { path: 'reviews', populate: { path: 'reply' } }
	}).lean().exec()
		return res.status(200).send({ User: user })
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})
router.patch(
	'/:id',
	body('name').trim().not().isEmpty().withMessage('Name is required'),
	body('password').trim().not().isEmpty().withMessage('Password is required'),
	body('email')
		.isEmail()
		.custom(async (value) => {
			const user = await User.findOne({ email: value })

			if (user) {
				throw new Error('Email is already taken')
			}
			return true
		}),
	async (req, res) => {
		try {
			const errors = validationResult(req)
			//   console.log({ errors });
			if (!errors.isEmpty()) {
				return res.status(400).send({ errors: errors.array() })
			}
			const user = await User.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
			})
			return res.status(203).send({ User: user })
		} catch (error) {
			return res.status(500).send({ error: error.message })
		}
	}
)

router.post('/update/password', async (req, res) => {
	try {
		const { userID, oldPassword, newPassword } = req.body

		const user = await User.findById(userID)
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const match = user.checkPassword(oldPassword)
		if (!match) {
			throw new Error('Old password is incorrect')
		}
		user.password = newPassword
		await user.save()
		res.status(200).json({ message: 'Password updated successfully' })
	} catch (err) {
		console.error(err.message)
		res.status(500).json({ error: err.message})
	}
})

router.delete('/:id', async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id)
		return res.status(204).send({ User: user })
	} catch (error) {
		return res.status(500).send({ error: error.message })
	}
})

module.exports = router
