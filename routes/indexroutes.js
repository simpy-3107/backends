const express = require('express');
const router = express.Router();
const indexcontroller = require('../controllers/indexcontrollers');

router.get('/',indexcontroller.index);
module.exports = router;