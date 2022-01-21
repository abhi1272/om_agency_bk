const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req,res,next) =>{


   try{ 
    const token = req.header('Authorization').replace('Bearer ','')
    const decode = jwt.verify(token,process.env.JWT_SECRET)
    const loggedInUser = await User.findOne({_id:decode._id,'tokens.token':token})
    if(!loggedInUser){
        throw new Error()
    }

    req.loggedInUser = loggedInUser
    req.token = token
    next()
    // client.get([decode._id],(err,reply) => {
    //     reply = JSON.parse(reply)
    //     if(reply.access_token === token){
    //         loggedInUser = true
    //     }
    //     if(!loggedInUser){
    //         throw new Error()
    //     }
    
    //     req.loggedInUser = loggedInUser
    //     req.token = token
    //     next()
    // })
    }
    catch(e){
         res.status('401').send({error:'Please Authenticate.'})
    }
}

module.exports = auth