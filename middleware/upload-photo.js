const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET__KEY,
  accessKeyId: process.env.AWS_ACCESS__KEY,
})

const s3 = new aws.S3()

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'reviews-app',
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, {fileName: file.fieldname})
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString())
    }
  })
})

module.exports = upload