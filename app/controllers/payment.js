const Customer = require('../models/Customer');
const PaymentModel = require('../models/Payment')
const _ = require('lodash');
const common = require('../services/common')
const { uuid } = require('uuidv4');
const Bill = require('../models/Bill');


let create =  async (req, res) => {
    let paid_amount = +req.body.paid_amount
    const payment_date = req.body.payment_date
    const orgId = req.loggedInUser.orgId
    let paymentValueObj
    console.log('payment_date',payment_date)
    let customer_uuid = req.body.customer_uuid
    let bills
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
        // foundBillWithExactAmt.payments.push(paymentObj)
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
                // bills[i].payments.push(paymentValueObj)
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
                    // bills[i].payments.push(paymentValueObj)
                    await Bill.updateOne({uuid:bills[i].uuid},{$push: {payments: paymentValueObj} ,$set:{amount_left: bills[i].amount_left}})
                    break
                }else{
                    let leftAmount = +bills[i].amount_left?bills[i].amount_left:bills[i].bill_amount
                    paid_amount =  +paid_amount - leftAmount
                    bills[i].amount_left = 0
                    paymentValueObj = createPaymentObj(req.body.paid_amount,bills[i],payment_date,paid_amount, orgId)
                    // bills[i].payments.push(paymentValueObj)
                    await Bill.updateOne({uuid:bills[i].uuid},{$push: {payments: paymentValueObj}, $set:{amount_left: bills[i].amount_left}})
                    if(paid_amount === 0){
                        break
                    }
                }
            }
        }

      
    }
    // await Customer.update({uuid:[customer_uuid]},{ $set: { bills } })
    // const paymentValueObj = createPaymentObj(req.body.paid_amount,result,{},payment_date,null,orgId)
    if(req.body.check_number){
        paymentValueObj['check_number'] = req.body.check_number
    }
    if(req.body.credit_note){
        paymentValueObj['credit_note'] = req.body.credit_note
    }
    const Payment = new PaymentModel({
        ...paymentValueObj
    })

    Payment.save()
    const updateResult = await Customer.updateOne({uuid:[customer_uuid]},{ $inc: { totalPaymentAmount: req.body.paid_amount} })
    await Bill.updateOne({uuid:[customer_uuid]},{ $push: { payments: paymentValueObj } })


    res.send(updateResult)

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


let getAllPayment = async (req,res) => {
    const paymentResponse = {
        data : [],
        totalAmount:0
    }
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
    try{

        const result = await PaymentModel.find(filter)
        const total = result.reduce((total, item) => {
            return total + item.paid_amount
        }, 0) 
        paymentResponse.data = result
        paymentResponse.totalAmount = total
        res.send(paymentResponse)
    }catch(e){
        res.send(e);
    }
   
};


let updatePayment =  async (req,res) => {

    let payment = req.body;
    const date = new Date()
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
  
        res.send(result);

    }catch(e){
        res.send(e);
    }
};

let deletePayment = async (req,res) => {
    
    let uuid = req.params.id;

    try{

        const foundPayment = await PaymentModel.findOne({ uuid })

        if(!foundPayment) return 

        const result = await PaymentModel.deleteOne({ uuid });

        await Customer.updateOne({uuid:foundPayment.customer_uuid}, {$inc: {totalPaymentAmount: -foundPayment.paid_amount}})
        
        res.send(result);
    }catch(e){
        res.send(e);
    }
};

module.exports = {
    create,
    getAllPayment,
    updatePayment,
    deletePayment
};