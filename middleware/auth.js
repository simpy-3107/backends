const jwt = require('jsonwebtoken');
const User= require('../models/user');
const Blacklist = require('../models/blacklist');


module.exports.isauthenticated = async (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const blacklist = await Blacklist.findOne({ token });
        if(blacklist){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        

        const user = await User.findById(decoded.user);
        if(!user){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    
    
    }
    catch(err){
        console.log(err);
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