const jwt = require('jsonwebtoken');
const User= require('../models/user');
const Blacklist = require('../models/blacklist');
const mongoose = require('mongoose');





// Assuming User model is available

module.exports.isauthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token is missing or improperly formatted' });
        }

        const token = authHeader.split(' ')[1];  // Extract the token
        console.log('Token:', token);  // Log the token to check

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);  // Log decoded token for debugging

        const user = await User.findById(decoded._id);  // Find the user by ID
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user to the request object for future use
        req.user = user;
        console.log('Authenticated user:', req.user);  // Log the user to ensure it's correct

        next();  // Continue to the next middleware or route handler

    } catch (err) {
        console.error('JWT Verification Error:', err);  // Log error if token verification fails
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

    





    

  module.exports.isAdmin = async (req, res, next) => {
    try{
        if(req.user.role === 'seller'){
            next();
        }
        else{
            res.status(401).json({ message: 'Unauthorized' });
        }



    }
    catch(err){
       console.log(err);
    }
  };