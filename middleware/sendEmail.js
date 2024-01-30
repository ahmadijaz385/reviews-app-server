const nodemailer = require('nodemailer');
require('dotenv').config()

const SendMail = (options,res) => {
	// const transporter = nodemailer.createTransport({
  //   service: "Gmail",
  //   host: "smtp.gmail.com",
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     user: process.env.YOUR_MAIL,
  //     pass: process.env.APP_PASSWORD,
  //   },
  // });
	const transporter = nodemailer.createTransport({
		//  host: config.mailService,
				service: 'gmail',
		//  port:25,
			auth: {
				user: process.env.YOUR_MAIL,
				pass: process.env.APP_PASSWORD,
			},
		});
	const mailOptions = { 
		from: process.env.YOUR_MAIL,
		to: options.to,
		subjects: options.subject,
		html: options.html,
	};
	transporter.sendMail(mailOptions, function (err, info) {
		if (err) {
		  return res.status(400).json({
          error:"Something is wrong! Please try"
        });
		} else {
			return res.json({
          message: `Review Posted. Email has been sent to ${options.to}`
        });
		}
	});
};

module.exports = SendMail;