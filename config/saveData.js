const mongoose = require('mongoose');
let currentModel = process.argv[2];
const model = require(`../app/models/${currentModel}`);
const appConfig = require('../config/appConfig');

var json = require(`../${currentModel}.json`);

mongoose.connect(appConfig.db.uri,{ useNewUrlParser:true ,useCreateIndex:true},(err,res)=>{
    if(err){
        console.log(err);
    }else{
        console.log('mongodb connected successfully');
        insertUserData();
    }
});


function insertUserData(){
    model.insertMany(json, function(err,result) {
        if (err) {
          // handle error
          console.log(err);
        } else {
           console.log('data inserted successfully');
          // handle success
        }
     });
}
