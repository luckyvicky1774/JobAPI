const express = require('express')
const router = express.Router()

const {getAllJobs, getJob, createJob, updateJob, deleteJob} = require('../controllers/jobs')

// 当“同一个 URL 有多个 HTTP 方法”时，用 .route() 可以把它们写在一起，更清晰
router.route('/').post(createJob).get(getAllJobs)
router.route('/:id').get(getJob).delete(deleteJob).patch(updateJob)

module.exports = router

// route = 负责“URL 对应谁来处理”
// controller = 负责“具体怎么处理这件事”