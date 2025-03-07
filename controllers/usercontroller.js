const User = require('../models/user');
const Blacklist = require('../models/blacklist');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Product = require('../models/product');
const order = require('../models/order');
const payment = require('../models/payment');

const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


module.exports.signup = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Check if name, email, and password are provided
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all the required fields' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Check if the user already exists
        const userAlreadyExist = await User.findOne({ email });
        if (userAlreadyExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // If no role is provided, set a default role (e.g., 'user')
        const userRole = role || 'user';

        // Create the new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole, // Add role to the user model
        });

        // Save the user to the database
        const savedUser = await user.save();

        // Generate JWT token
        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
            // Optional: Set token expiry time
           

        // Respond with the success message, user data, and token
        res.status(201).json({
            message: 'User created successfully',
            user: savedUser,
            token,
        });
    } catch (err) {
        console.error(err); // Log error for better debugging
        res.status(500).json({ message: 'Error creating user', error: err.message });
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
        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
         // Optional: Set token expiry time
        

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
            console.log('Inside isprofile handler');  // Log when this function is called
        
            try {
                const user = req.user;  // This should be set by the isauthenticated middleware
                if (!user) {
                    console.error('User not found in profile handler');
                    return res.status(404).json({ message: 'User not found' });
                }
        
                console.log('User profile:', user);  // Log the user to verify it's correct
        
                // Send the profile data back in the response
                res.status(200).json({ profile: user });
        
            } catch (err) {
                console.error('Error in isprofile handler:', err);  // Log the error details
                res.status(500).json({ message: 'Error getting user profile', err: err });
            }
        };
        

        module.exports.allproducts = async (req, res) => {
            try {
                const products = await Product.find(); // Fetch all products
                
                if (!products) {
                    // If no products found, send a response and exit the function early
                    return res.status(404).json({ message: 'No products found' });
                }
                
                // Send the products as a response
                return res.status(200).json({products}); // The return here ensures only one response is sent
            } catch (err) {
                console.error(err);
                // If there is an error, send a response and exit the function
                return res.status(500).json({ message: 'Error retrieving products', error: err.message });
            }
        };
        
        module.exports.product = async (req, res) => {
            try {
                const product = await Product.findById(req.params.id);
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
                const product = await Product.findById(req.params.id);
                const option = {
                    amount :product.amount*100,
                    currency:"INR",
                    reciept:product._id,
                }
                const order = await instance.orders.create(option);
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

