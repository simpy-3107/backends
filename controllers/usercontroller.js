const User = require('../models/user');
const Blacklist = require('../models/blacklist');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const product = require('../models/product');
const order = require('../models/order');
const payment = require('../models/payment');

const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


module.exports.signup = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all the fields' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const userAlreadyExist = await User.findOne({ email });
        if (userAlreadyExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

   
      

        // Create user
        const user =  await User.create({ name, email, password: hashedPassword, role });

        // Generate token
        const token =  await jwt.sign({ user: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Save user to the database
        const savedUser = await user.save();

        // Respond with success message, user data, and token
        res.status(201).json({ message: 'User created successfully', user:savedUser, token });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user', err });
    }
};



module.exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        console.log(password);
        console.log(user.password);
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        console.log('Password Comparison Result: ', isPasswordCorrect);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // If password matches, generate a JWT token
        const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET
         // Optional: Set token expiry time
        );

        // Send success response with the token
        res.status(200).json({ message: 'Login successful', token });

    } catch (err) {
        // Log and send error response
        console.error(err);
        res.status(500).json({ message: 'Error logging in', err });
    }
};
    module.exports.logout = async (req, res,next) => {
        try{
                const token = req.headers.authentication.split(' ')[1];

                if (!token) {
                    return res.status(400).json({ message: 'Token is required' });
                    
                }
                const blacklist = await Blacklist.findOne({ token });
                if(blacklist){
                    return res.status(400).json({ message: 'Token has been blacklisted' });
                }
                await Blacklist.create({ token });
                res.status(200).json({ message: 'Logged out successfully' });
            }
            catch(err){
                res.status(500).json({ message: 'Error logging out', err });
            }
        };
        module.exports.isprofile = async (req, res) => {
            try {
                const user = await User.findById(req.user._id);

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                res.status(200).json(user);
            } catch (err) {
                res.status(500).json({ message: 'Error getting user profile', err });
            }
        };

        module.exports.allproducts = async (req, res) => {
            try {
                const products = await product.find({});
                res.status(200).json(products);
            }
            catch(err){
                res.status(500).json({ message: 'Error getting user profile', err });
            }
        };
        module.exports.product = async (req, res) => {
            try {
                const product = await product.findById(req.params.id);
                if (!product) {
                    return res.status(404).json({ message: 'Product not found' });
                }
                res.status(200).json(product);
            }
            catch(err){
                res.status(500).json({ message: 'Error getting user profile', err });
            }
        };

        module.exports.createorder = async (req, res) => {
            try {
                const product = await product.findById(req.params.id);
                const option = {
                    amount :product.amount*100,
                    currency:"INR",
                    reciept:product._id,
                }
                const order = await instance.order.create(option);
                 res.status(200).json(order);

                 const payment = await payment.create({
                    orderid:order.id,
                    amount :product.amount,
                    currency:"INR",
                    status :"pending" 
                 })
                }catch(err){
                    res.status(500).json({ message: 'Error creating order', err });
                }
            }
                module.exports.verifypayment = async (req, res) => {
                    try {
                        const { paymentID,orderid,signature } = req.body;
                        const secret  = process.env.RAZORPAY_KEY_SECRET;

                        const {validatePaymentVerification}= require("../node_modules/razorpay/dist/utils/razorpay-utils.js");
                        const isValid = validatePaymentVerification(paymentID,orderid,signature,secret);
                        if(isValid){
                            const payment = await payment.findById(orderid);
                            payment.status = "success";
                            await payment.save();
                            res.status(200).json({ message: 'Payment verified successfully' });
                        }else{
                            const payment = await payment.findById(orderid);
                            payment.status = "failed";
                            await payment.save();
                            res.status(200).json({ message: 'Payment verification failed' });
                        }
                    }
                    catch(err){
                        res.status(500).json({ message: 'Error verifying payment', err });
                    }
                };

