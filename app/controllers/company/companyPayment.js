const Company = require('../../models/Company');
const PaymentModel = require('../../models/CompanyPayment')
const response = require('../../libs/responseLib');
const { uuid } = require('uuidv4');
const Bill = require('../../models/CompanyBill');


let create =  async (req, res) => {
    let paid_amount = +req.body.paid_amount
    const orgId = req.loggedInUser.orgId

    try {
        if(req.body.credit_note){
            paid_amount = paid_amount + +req.body.credit_note
        }
        if(req.body.debit_note){
            paid_amount = paid_amount - +req.body.debit_note
        }
    
        let foundBill = await Bill.find({uuid: req.body.bill_uuid, amount_left:{$ne:0}}).sort({bill_date:1})
    
        if(foundBill)  { foundBill = foundBill[0] }
    
        const company_uuid = foundBill.company.uuid
    
        const adjustable_left_amount = foundBill.bill_amount - paid_amount
        await Bill.findOneAndUpdate({uuid:foundBill.uuid},{ $set: { amount_left: adjustable_left_amount } })
    
        const paymentValueObj = createPaymentObj(req.body.paid_amount, foundBill, req.body.payment_date, adjustable_left_amount, orgId,req)
        
        
        const Payment = new PaymentModel({
            ...paymentValueObj
        })
    
        Payment.save()
        const updateResult = await Company.updateOne({uuid:[company_uuid]},{ $inc: { totalPaymentAmount: paid_amount} })
        await Bill.updateOne({uuid:foundBill.uuid},{ $push: { payments: paymentValueObj } })
    
        let apiResponse = response.generate(false, 'Payment added successfully', 200, updateResult);
        res.send(apiResponse);
    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse);
    }
  

}

let createPayment =  async (req, res) => {
    let paid_amount = +req.body.paid_amount
    const orgId = req.loggedInUser.orgId

    try {
        if(req.body.credit_note){
            paid_amount = paid_amount + +req.body.credit_note
        }
        if(req.body.debit_note){
            paid_amount = paid_amount - +req.body.debit_note
        }
    
        const foundCompany = await Company.findOne({uuid:req.body.company_uuid})

        const Payment = new PaymentModel({
            uuid:uuid(),
            ...req.body,
            paid_amount: parseInt(paid_amount),
            company_uuid:foundCompany.uuid,
            company:{
                name: foundCompany.name,
                area: foundCompany.area,
                uuid: foundCompany.uuid,
            },
            orgId
        })
    
        Payment.save()
        const updateResult = await Company.updateOne({uuid:req.body.company_uuid},{ $inc: { totalPaymentAmount: paid_amount} })    
        let apiResponse = response.generate(false, 'Payment added successfully', 200, updateResult);
        res.send(apiResponse);
    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse);
    }
  

}

function createPaymentObj(paid_amount,bill={},payment_date,adjustable_left_amount=0,orgId,req){
    const paymentObj  = {
        uuid:uuid(),
        ...req.body,
        paid_amount: parseInt(paid_amount),
        adjustable_left_amount:adjustable_left_amount,
        company_uuid:bill.company_uuid,
        company:{
            name: bill.company.name,
            area: bill.company.area,
            uuid: bill.company.uuid,
        },
        bill_uuid:bill.uuid,
        bill_no:bill.bill_no,
        bill_amount:bill.bill_amount,
        orgId,
        payment_date:payment_date?payment_date:new Date()
    } 
    return paymentObj

}


let getAllPayment = async (req,res) => {

    let filter = {}
    let projection = {}

    if(req.query.company_uuid){
        filter = {company_uuid:req.query.company_uuid}
        projection = {payments:1}
    }else if(req.query.bill_uuid){
        filter = {["bill_uuid"]:req.query.bill_uuid}
        projection = {_id: 0, bills: {$elemMatch: {uuid: req.query.bill_uuid}}}
    }else if (req.query.payment_date) {
        filter = { payment_date: new Date(req.query.payment_date) }
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
              payment_date: payment.check_number,
              payment_date: payment.credit_note,
              payment_date: payment.debit_note,
              notes: payment.notes
            },
          }
        );

        const foundCustomer = await Company.findOne({uuid:foundPayment.company_uuid})
        
        let totalPaymentAmount = foundCustomer.totalPaymentAmount

        if(payment.paid_amount > foundPayment.paid_amount) {
            totalPaymentAmount = foundCustomer.totalPaymentAmount + (payment.paid_amount - foundPayment.paid_amount)
        }else if(payment.paid_amount < foundPayment.paid_amount) {
            totalPaymentAmount = foundCustomer.totalPaymentAmount - (foundPayment.paid_amount -  payment.paid_amount)
        }

        await Company.updateOne({uuid:foundPayment.company_uuid}, {$set:{totalPaymentAmount}})
        let apiResponse = response.generate(false, 'Payment updated successfully', 200, result);
        res.send(apiResponse);

    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse)
    }
};

let deletePayment = async (req,res) => {
    
    let uuid = req.params.id;

    try{

        const foundPayment = await PaymentModel.findOne({ uuid })

        if(!foundPayment) return 

        const result = await PaymentModel.deleteOne({ uuid });

        await Company.updateOne({uuid:foundPayment.company_uuid}, {$inc: {totalPaymentAmount: -foundPayment.paid_amount}})
        
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
    deletePayment
};