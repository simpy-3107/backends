const express = require('express');
const router = express.Router();

const authentication = require('../middleware/auth');
const upload = require('../config/multerconfig');
const Product = require('../controllers/productcontroller');


router.use(authentication.isauthenticated).use(authentication.isAdmin);

router.post('/createproduct', upload.any(),Product.create);


module.exports = router;