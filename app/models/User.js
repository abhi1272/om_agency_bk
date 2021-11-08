'use strict';
/** Module Dependencies **/
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let userSchema = new Schema({
  uuid: {
    type: String,
    default: uuidv4(),
    index: true,
    trim:true
  },
  firstName: {
    type: String,
    default: '',
    trim:true,
    required:true
  },
  lastName: {
    type: String,
    default: '',
    trim:true
  },
  password: {
    type: String,
    trim:true,
    minlength:4,
    required:true,
    validate(value){
      if(value.toLowerCase().includes('password')){
        throw new Error('Password can not contains password string');
      }
    }
  },
  email: {
    type: String,
    required:true,
    trim:true,
    unique:true,
    lowercase:true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error('Pass Valid email id');
      }
    }
  },
  mobileNumber:{
    type:Number
  },
  address:[{
    type:Object
  }],
  orders:[{
    type:Object
  }],
  tokens:[{
    token:{
      type:String,
      required:true
    }
  }],
  roleId:{
    type:String,
    default:'16babe64-c962-406f-9f3e-191180e6e206'
  },
  roleName:{
    type:String,
    default:'User'
  },
  orgId:{
    type: String,
    required:true
  },
  avatar:{
    type:Buffer
  },
},
{
  timestamps:true
}
);

// CustomerSchema.virtual('Bill',{
//   ref:'Bill',
//   localField:'_id',
//   foreignField:'owner'
// })


userSchema.methods.toJSON = function(){
  const findUser = this;

  const userObject = findUser.toObject();
  
  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

userSchema.methods.generateAuthToken = async function(){
  let newUser = this;

  let token = jwt.sign({_id:newUser._id.toString()},process.env.JWT_SECRET);
  newUser.tokens = newUser.tokens.concat({token});
  await newUser.save();
  return token;

};

userSchema.statics.findByCredentials = async (email,password) => {

  let foundUSer = await User.findOne({email});
  if(!foundUSer){
    return 'No User Found'
  }
  let isMatch = await bcrypt.compare(password,foundUSer.password);
  if(!isMatch){
    return 'Password and Email not matched'
  }else{
    return foundUSer;
  }


};

userSchema.pre('save', async function(next){
    let user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;