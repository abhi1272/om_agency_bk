const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('../libs/timeLib');
const response = require('../libs/responseLib');
const logger = require('../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib');
const check = require('../libs/checkLib');
const axios = require('axios')
const moment = require('moment')
const { uuid } = require('uuidv4');


/* Models */
const User = require('../models/User');

// start user signup function 

let signUpFunction = async (req, res) => {
  
    let newUser = new User(req.body);

    try{
        let token = await newUser.generateAuthToken();
        await newUser.save();
        logger.info('You are successfully registered','userController: signup',1);
        let apiResponse = response.generate(false,'You are successfully registered',200,{newUser,token});
        res.send(apiResponse);
    }
    catch(e){
        console.log(e)
        let apiResponse = response.generate(true,e,500,null);
        logger.error('Not able to sign-up','userController:signup',5)
        res.status('500').send(apiResponse);
    }

};// end user signup function 

// start of login function 
let loginFunction = async (req, res) => {
    
    try{
        let user = await User.findByCredentials(req.body.email,req.body.password,req.body.orgId);
        const token = await user.generateAuthToken();
        setToken(res,user,token)
        logger.info(`You are successfully logged in ${user}','userController: login`,1);
        let apiResponse = response.generate(false,'You are successfully logged in',200,{user,token});
        res.send(apiResponse);
    }
    catch(e){
        let apiResponse = response.generate(false,'User id or password is wrong',500,e);
        res.status('500').send(apiResponse);
        logger.error('Not able to login','userController:login',5)
        console.log(e)
    }
};


// end of the login function 


let logout = async (req, res) => {
    console.log('logout-called',req.loggedInUser)
    try{
        req.loggedInUser.tokens = req.loggedInUser.tokens.filter((token)=>{
            return token.token !== req.token;
        });
        await req.loggedInUser.save();
        logger.info(`You are successfully logged out ${req.loggedInUser}','userController: logout`,1);
        res.status('200').send('successfully logout');
    }catch(e){
        res.status('501').send(e);
        logger.error('Not able to logout','userController:logout',5)
    }

}; // end of the logout function.

let getProfile = async (req,res) => {

    let uuid = req.params.id;

    try {
        let result = await User.findOne({uuid});
        res.send(result)
    }catch(e){
        console.log(e)
    }
};

let updateProfile = async (req,res) => {
    console.log('update profile')
    let loggedInUser = req.body.loggedInUser;
    const lastAddress = loggedInUser.address[0]
      try {
        let user = await User.findOne({_id: loggedInUser._id});
        if(loggedInUser.address && loggedInUser.address.length === 1){
            const splittedAddress = lastAddress.address.split(' ').join('+')
            const loc = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${splittedAddress}+${lastAddress.city}+${lastAddress.state}&key=AIzaSyADPRYiIo9c6t4R9aoyo4INvh_3H8taDhI`);
            loggedInUser.address[0].location =  loc.data ? loc.data.results[0].geometry.location : ''
        }
        let result = await User.findByIdAndUpdate(loggedInUser._id,loggedInUser);
        res.send(result);
    }catch(e){
        console.log(e)
    }

};

let setToken = (res, user, token) => {
  res.cookie("access_token", token, {
    httpOnly: true,
  });
};

let addUser = async(req,res) => {
    let user = User({
        ...req.body,
        orgId:req.loggedInUser.orgId,
        uuid:uuidv4()
    });

    user.save((err, result) => {
        if (err) {
            console.log('err', err)
            let apiResponse = response.generate(true, 'some error occurred', 500, err);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(true, `User saved successfully`, 200, result);
            res.send(apiResponse);
        }
    });
   
}

module.exports = {
    signUpFunction,
    loginFunction,
    logout,
    getProfile,
    updateProfile,
    addUser
}