'use strict';
const excelToJson = require('convert-excel-to-json');
const mongoose = require('mongoose')
var _ = require('lodash');
const Bill = require('../models/Bill')
const Customer = require('../models/Customer')
const { uuid } = require('uuidv4');
const appConfig = require('../../config/appConfig');
let customerArr = []
let mongoCustomerArr = []
let mongoBillArr = []
let finalCustomerData = []

const convertIntoJson = () => {
    const result = excelToJson({
        sourceFile: 'OMEX_26_March.xlsx',
        columnToKey: {
            '*': '{{columnHeader}}'
        }
    });
    covertIntoCustomerObj(result)
}

const covertIntoCustomerObj = (result) => {

    // console.log(result.STATEMENT.length)
result.STATEMENT.map(async (item, index ) => {

    try {
        if(index > 0){
           
            // Insert Customer Object in customer data from Excel 
            createCustomer(item);

            // Insert Bill Object in customer data from Excel 
            // createBills(item)
         
        }
    }catch(e){
        console.log(e)
        return false
    }
  
})
    // Insert UNIQUE Customer Data in DB 
    uniqueCustomerData()

}

const uniqueCustomerData = () => {
    let modifiedData = []

    modifiedData = mongoCustomerArr.filter((thing, index, self) =>
    index === self.findIndex((t) => (
      t.uniqueName === thing.uniqueName 
    ))
  )


    insertData(modifiedData,Customer);

}

const createCustomer = async (item) => {
    let customerObj = {
        uuid:uuid(),
        name : item['Name of The Party'],
        address : item['Address of the Party'],
        area : item['Area'],
        uniqueName:item['Name of The Party'] + ' ' +  item['Area'],
        bills:[]
    }

    if(customerObj.area !== undefined){
        mongoCustomerArr.push(customerObj)
    }
}

const createBills = async (item) => {
    let billObj = {
        uuid: uuid(),
        bill_no: item["Bill Number"],
        basic_amount: item["Basic Amount"],
        bill_amount: item["Invoice Value"],
        type: item["Type"],
        date: item["Date"],
        customer_name:item['Name of The Party'],
        place:item['Area'],
        firm_name:'OMEX PHARMA',
        bill_date: covertDateIntoTimeStamp(item["Date"]),
        payments:[]
      };

      let un = item['Name of The Party'] + ' ' +  item['Area']
      if(un !== 'undefined undefined'){
          const res = await Customer.update(
              { uniqueName: un },
              { $push: { bills: billObj } }
           )
           if(res){
               console.log('updated', res)
           }
      }
}  

const connectMongoDB = () => {
    mongoose.connect(appConfig.db.uri,{ useNewUrlParser:true ,useCreateIndex:true},(err,res)=>{
        if(err){
            console.log(err);
        }else{
            console.log('mongodb connected successfully');
            convertIntoJson()
        }
    });
}

function insertData(modifiedData,model){
    if(modifiedData.length > 0){
        model.insertMany(modifiedData, function(err,result) {
            if (err) {
              // handle error
              console.log(err);
            } else {
               console.log('data inserted successfully');
            }
         });
    }
   
}

const covertDateIntoTimeStamp = (date) => {
    let myDate = date.split("/");
    var newDate = new Date( myDate[2], myDate[1] - 1, myDate[0]);
    return newDate.getTime()
}
connectMongoDB();
