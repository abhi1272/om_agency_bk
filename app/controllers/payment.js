const Customer = require('../models/Customer');
const PaymentModel = require('../models/Payment')
const response = require('../libs/responseLib');
const { uuid } = require('uuidv4');
const Bill = require('../models/Bill');
const {sendSms} = require('../utils/send-sms')


let create =  async (req, res) => {
    let paid_amount = +req.body.paid_amount
    const payment_date = req.body.payment_date
    const orgId = req.loggedInUser.orgId
    let paymentValueObj
    console.log('payment_date',payment_date)
    let customer_uuid = req.body.customer_uuid
    let bills
    try {
        if(customer_uuid){
            bills = await Bill.find({customer_uuid, amount_left:{$ne:0}}).sort({bill_date:1})
        }else{
            bills = await Bill.find({uuid: req.body.bill_uuid, amount_left:{$ne:0}}).sort({bill_date:1})
            customer_uuid = bills[0].customer_uuid
        }
        if(!bills) return
        bills = _.orderBy(bills, ['bill_date'],['asc']); // Use Lodash to sort array by 'name'
        let foundBillWithExactAmt = bills.find(bill => +bill.bill_amount === +req.body.paid_amount)
        if(foundBillWithExactAmt && !foundBillWithExactAmt.amount_left){
            const paymentObj = createPaymentObj(paid_amount,foundBillWithExactAmt,payment_date,0,orgId)
            paymentValueObj = paymentObj
            foundBillWithExactAmt.payments = []
            foundBillWithExactAmt.amount_left = 0
            await Bill.updateOne({uuid:foundBillWithExactAmt.uuid}, {$set:{amount_left: foundBillWithExactAmt.amount_left}}, {$push: {payments: paymentObj}})
        }else{
            for(i=0;i<bills.length;i++){
                if(!bills[i].payments){
                    bills[i].payments = []
                }
                // 485 - 2000
                if(bills[i].amount_left === 0){
                    continue
                }
                if(bills[i].amount_left?bills[i].amount_left > paid_amount:bills[i].bill_amount > paid_amount && i === 0){
                    if(bills[i].amount_left){
                        bills[i].amount_left = +bills[i].amount_left - paid_amount
                    }else{
                        bills[i].amount_left = +bills[i].bill_amount - paid_amount
                    }
                    paymentValueObj =  createPaymentObj(req.body.paid_amount,bills[i],payment_date,paid_amount, orgId)
                    await Bill.updateOne({uuid:bills[i].uuid},{$push: {payments: paymentValueObj} ,$set:{amount_left: bills[i].amount_left}})
                    break
                }else{
                    if(bills[i].amount_left?bills[i].amount_left > paid_amount:bills[i].bill_amount > paid_amount){
                        if(bills[i].amount_left){
                            bills[i].amount_left = +bills[i].amount_left - paid_amount
                        }else{
                            bills[i].amount_left = +bills[i].bill_amount - paid_amount
                        }
                        paymentValueObj = createPaymentObj(req.body.paid_amount,bills[i],payment_date,paid_amount, orgId)
                        await Bill.updateOne({uuid:bills[i].uuid},{$push: {payments: paymentValueObj} ,$set:{amount_left: bills[i].amount_left}})
                        break
                    }else{
                        let leftAmount = +bills[i].amount_left?bills[i].amount_left:bills[i].bill_amount
                        paid_amount =  +paid_amount - leftAmount
                        bills[i].amount_left = 0
                        paymentValueObj = createPaymentObj(req.body.paid_amount,bills[i],payment_date,paid_amount, orgId)
                        await Bill.updateOne({uuid:bills[i].uuid},{$push: {payments: paymentValueObj}, $set:{amount_left: bills[i].amount_left}})
                        if(paid_amount === 0){
                            break
                        }
                    }
                }
            }

        
        }
        const Payment = new PaymentModel({
            ...paymentValueObj
        })

        Payment.save()
        const updateResult = await Customer.updateOne({uuid:[customer_uuid]},{ $inc: { totalPaymentAmount: req.body.paid_amount} })
        await Bill.updateOne({uuid:[customer_uuid]},{ $push: { payments: paymentValueObj } })

        let apiResponse = response.generate(false, 'Payment added successfully', 200, updateResult);
        res.send(apiResponse);
    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse);
    }
}

function createPaymentObj(paid_amount,bill={},payment_date,adjustable_left_amount=0,orgId){
    const paymentObj  = {
        uuid:uuid(),
        paid_amount: parseInt(paid_amount),
        adjustable_left_amount:adjustable_left_amount,
        customer_uuid:bill.customer_uuid,
        customer:{
            name: bill.customer.name,
            area: bill.customer.area,
            uuid: bill.customer.uuid,
            place: bill.customer.place,
            type: bill.customer.type
        },
        bill_uuid:bill.uuid,
        bill_no:bill.bill_no,
        bill_amount:bill.bill_amount,
        create_time: new Date(),
        orgId,
        payment_date:payment_date?payment_date:new Date()
    } 
    return paymentObj

}

let createPayment = async (req, res) => {
    let newPayment = new PaymentModel({
        ...req.body,
        orgId:req.loggedInUser.orgId,
        uuid:uuid()
    });

    try{
        const foundCustomer = await Customer.findOne({uuid:newPayment.customer_uuid})

        newPayment.customer = {
            name: foundCustomer.name,
            area: foundCustomer.area,
            uuid: foundCustomer.uuid,
            place:foundCustomer.place,
            type: foundCustomer.type || ''
        }

        await newPayment.save();
        
        await Customer.updateOne({uuid:newPayment.customer_uuid}, {$inc: {totalPaymentAmount: +newPayment.paid_amount}})
        let apiResponse = response.generate(false, 'payment successfully created', 200, newPayment);
        // sendSms(`Rs.${newPayment.paid_amount} Payment Received`)
        res.send(apiResponse);
    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse);
    }
}


let getAllPayment = async (req,res) => {
    let filter = {}
    let projection = {}

    if(req.query.customer_uuid){
        filter = {customer_uuid:req.query.customer_uuid}
        projection = {payments:1}
    }else if(req.query.bill_uuid){
        filter = {["bill_uuid"]:req.query.bill_uuid}
        projection = {_id: 0, bills: {$elemMatch: {uuid: req.query.bill_uuid}}}
    }else if (req.query.payment_date) {
        filter = { payment_date: new Date(req.query.payment_date) }
    }
    if(req.query.type){
        filter['customer.type'] = req.query.type
    }
    const place_uuids = req.loggedInUser.place.map(item => item.uuid)
    if(place_uuids && place_uuids.length){
        filter["customer.place.uuid"] = {$in:place_uuids}
    }
    try{
        filter.orgId = req.loggedInUser.orgId
        const result = await PaymentModel.find(filter)
        const total = result.reduce((total, item) => {
            return total + item.paid_amount
        }, 0) 
        let apiResponse = response.generate(false, 'Payment Found', 200, result, total);
        res.send(apiResponse);
    }catch(e){
         let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse)
    }
   
};


let updatePayment =  async (req,res) => {

    let payment = req.body;
    try{
        const foundPayment = await PaymentModel.findOne({ uuid: req.params.id })

        if(!foundPayment) return 

        await PaymentModel.updateOne(
          { uuid: req.params.id },
          {
            $set: {
              paid_amount: payment.paid_amount,
              payment_date: payment.payment_date,
              notes: payment.notes
            },
          }
        );

        const foundCustomer = await Customer.findOne({uuid:foundPayment.customer_uuid})
        
        let totalPaymentAmount = foundCustomer.totalPaymentAmount

        if(payment.paid_amount > foundPayment.paid_amount) {
            totalPaymentAmount = foundCustomer.totalPaymentAmount + (payment.paid_amount - foundPayment.paid_amount)
        }else if(payment.paid_amount < foundPayment.paid_amount) {
            totalPaymentAmount = foundCustomer.totalPaymentAmount - (foundPayment.paid_amount -  payment.paid_amount)
        }

        await Customer.updateOne({uuid:foundPayment.customer_uuid}, {$set:{totalPaymentAmount}})
        let apiResponse = response.generate(false, 'Payment updated successfully', 200, result);
        res.send(apiResponse);

    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse)
    }
};

let verifyPayment =  async (req,res) => {

    try{
        const payment_uuids = req.body.payment_uuids
        
        const result = await PaymentModel.updateMany(
            { uuid: {$in:payment_uuids} },
            {
              $set: {
                  verify: true,
              },
            }
          );

        let apiResponse = response.generate(false, `Payment Verified Successfully`, 200, result);
        res.send(apiResponse);

    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse);
    }
};
let deletePayment = async (req,res) => {
    
    let uuid = req.params.id;

    try{

        const foundPayment = await PaymentModel.findOne({ uuid })

        if(!foundPayment) return 

        const result = await PaymentModel.deleteOne({ uuid });

        await Customer.updateOne({uuid:foundPayment.customer_uuid}, {$inc: {totalPaymentAmount: -foundPayment.paid_amount}})
        let apiResponse = response.generate(false, 'Payment Deleted successfully', 200, result);
        res.send(apiResponse);
    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse)
    }
};

module.exports = {
    create,
    createPayment,
    getAllPayment,
    updatePayment,
    deletePayment,
    verifyPayment
};