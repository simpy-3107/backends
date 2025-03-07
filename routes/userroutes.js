const user = require('../controllers/usercontroller');
const express = require('express');
const router = express.Router();
const authentication = require('../middleware/auth');

router.post('/signup', user.signup);
router.post('/login', user.login);
router.post('/logout', user.logout);

router.get("/allproducts",authentication.isauthenticated,user.isprofile,user.allproducts);
router.get("product/:id",authentication.isauthenticated,user.isprofile,user.product);
router.get("/order/:id",authentication.isauthenticated,user.createorder);
router.get("/verifypayment/:id",authentication.isauthenticated,user.isprofile,user.verifypayment);
router.get('/profile', authentication.isauthenticated, user.isprofile, (req, res) => {
    console.log('Profile route accessed');
    // Send the response here after `user.isprofile` has run
    res.json({ message: 'Profile accessed', user: req.user });
});



module.exports = router;