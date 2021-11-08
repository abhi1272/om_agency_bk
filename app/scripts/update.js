const mongoose = require('mongoose')
const Customer = require('../models/Customer')
const PaymentModel = require("../models/Pay");
const BillModel = require('../models/Bill')
const config = require('../../config/appConfig')
const moment = require('moment')


const connection = async () => {
    mongoose.connect(config.db.uri, { useNewUrlParser: true } , (err,res) => {
        if(err) throw err
        mongoose.set('debug', true)
        console.log('Database connected successfully')
        // BillModel.dropCollection('foo', function(err, result) {
        //     if(err) throw err
        //     console.log('Bill Collection deleted', result)
        // });
        // PaymentModel.dropCollection('foo', function(err, result) {
        //     if(err) throw err
        //     console.log('Payment Collection deleted', result)
        // });

    })
}


const getData = async () => {
    await connection()
    const data = await Customer.find({}).lean()
    const billData = await BillModel.find({}).lean()

    const payData = await PaymentModel.find({}).lean()

    billData.map((bill) => {
        if(typeof bill.bill_amount === 'string'){
            console.log('bill string found', bill.bill_amount, bill.bill_date)
        }
    })

    payData.map((payment) => {
        if(typeof payment.paid_amount === 'string'){
            console.log('payment string found', payment.paid_amount, payment.payment_date)
        }
    })

    // let count = 0
    // await Customer.update(
    //     {},
    //     {$set: {"orgId": "681db437-eed3-4ade-9832-248604036256"}},
    //     {upsert:false,
    //     multi:true}) 
      
    // data.map((customer) => {

        // customer.payments.map(async (payment) => {
            // update type 
            // if(typeof payment.paid_amount === 'string'){
            //     console.log('payment string found', payment.paid_amount, payment.payment_date)
            //     // const typeResult = await Customer.update({"payments.uuid" : payment.uuid},{$set:{"payments.$.paid_amount":parseInt(payment.paid_amount)}})
            //     //  console.log(typeResult.nModified, count++)
            // }

    //          // update date type for payment
    //         // const date = moment(payment.payment_date).format('YYYY-MM-DD');
    //         // const dateResult = await Customer.update({"payments.uuid" : payment.uuid},{$set:{"payments.$.payment_date":date}})
    //         // console.log(count++);
           
    //         // update area
    //         // const customerObj = {
    //         //     name: customer.name,
    //         //     area: customer.area,
    //         //     uuid: customer.uuid,
    //         // }
    //         // const updateResult = await Customer.update({"payments.uuid" : payment.uuid},{$set:{"payments.$.customer":customerObj}})
              
    //         // payment.customer = {
    //         //   name: customer.name,
    //         //   area: customer.area,
    //         //   uuid: customer.uuid,
    //         //   place:customer.place
    //         // };
    //         // const Payment = new PaymentModel({
    //         //   ...payment,
    //         // });

    //         // Payment.save(function (err, results) {
    //         //     if(err){
    //         //         console.log(err)
    //         //     }
    //         //   console.log(results._id, count++);
    //         // });
           
    //     })
        // customer.bills.map(async (bill) => {
    //         delete bill._id
    //         delete bill.createdAt
    //         delete bill.updatedAt
    //         delete bill.__v
    //         if(typeof bill.bill_amount === 'string'){
    //             console.log('bill string found', bill.bill_amount, bill.bill_date)
    // //         //     const typeResult = await Customer.update({"bills.uuid" : bill.uuid},{$set:{"bills.$.bill_amount":parseInt(bill.bill_amount)}})
    // //         //     console.log(typeResult, count++)
    //         }
    //         // update date type for bill
    //         // const date = moment(bill.bill_date).format('YYYY-MM-DD');
    //         // const dateResult = await Customer.update({"bills.uuid" : bill.uuid},{$set:{"bills.$.bill_date":date}})
    //         // console.log(dateResult.nModified, count++)
            
    //         // const customerObj = {
    //         //     name: customer.name,
    //         //     area: customer.area,
    //         //     uuid: customer.uuid,
    //         //     place:customer.place
    //         // };
    //         // const updateResult = await Customer.update({"bills.uuid" : bill.uuid},{$set:{"bills.$.customer":customerObj}})
    //         // const Bill = new BillModel({
    //         //     ...bill
    //         //   });
              
    //         //   Bill.save(function (err, updateResult) {
    //         //     if(err) throw err
    //         //     console.log(err, updateResult._id, count++);
            //   });
        // })
    // })  

}


getData()