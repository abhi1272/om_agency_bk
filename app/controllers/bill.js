const Bill = require('../models/Bill');
const Customer = require('../models/Customer');
const response = require('../libs/responseLib');
const common = require('../services/common.js')
const { uuid } = require('uuidv4');

let create = async (req,res) => {

    let newBill = new Bill({
        ...req.body,
        orgId:req.loggedInUser.orgId,
        uuid:uuid()
    });

    try{
        const foundCustomer = await Customer.findOne({uuid:newBill.customer_uuid})

        newBill.customer = {
            name: foundCustomer.name,
            area: foundCustomer.area,
            uuid: foundCustomer.uuid,
            place:foundCustomer.place,
            type: foundCustomer.type || ''
        }

        await newBill.save();
        
        await Customer.updateOne({uuid:newBill.customer_uuid}, {$inc: {totalBillAmount: +newBill.bill_amount}})
        let apiResponse = response.generate(false, 'Bill successfully created', 200, newBill);
        res.send(apiResponse);

    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse);
    }
};

let getAllBills = async (req,res) => {
    
    const result = await common.getDataWithFilter(req,'bill_amount', 'bill_date', 'Bill')
    res.send(result)
       
};


let getBillsByCustomer = async (req,res) => {

    let uuid = req.params.customer_uuid;

    try{
        let bills = await Bill.find({['customer_uuid']:uuid}).sort({bill_date:-1})
        let apiResponse = response.generate(false, `Bill found for customer id: ${uuid}`, 200, bills);
        res.send(apiResponse);
    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse);
    }

};


let getBill = async (req,res) => {

    let uuid = req.params.id;

    try{
        let result = await Bill.findOne({uuid});
        let apiResponse = response.generate(false, `Bill found`, 200, result);
        res.send(apiResponse);
    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse);
    }
};


let updateBill =  async (req,res) => {

    let bill = req.body;
    const date = new Date()
    try{

        const foundBill = await Bill.findOne({ uuid: req.params.id })

        if(!foundBill) return 

        const result = await Bill.updateOne(
            { uuid: req.params.id },
            {
              $set: {
                  bill_amount: bill.bill_amount || foundBill.bill_amount,
                  bill_date: bill.bill_date || foundBill.bill_date,
                  bill_no : bill.bill_no || foundBill.bill_no,
                  amount_left: bill.amount_left || foundBill.amount_left
              },
            }
          );

        
        const foundCustomer = await Customer.findOne({uuid:foundBill.customer_uuid})
        
        let totalBillAmount = foundCustomer.totalBillAmount

        if(bill.bill_amount > foundBill.bill_amount) {
            totalBillAmount = foundCustomer.totalBillAmount + (bill.bill_amount - foundBill.bill_amount)
        }else if(bill.bill_amount < foundBill.bill_amount) {
            totalBillAmount = foundCustomer.totalBillAmount - (foundBill.bill_amount -  bill.bill_amount)
        }

        await Customer.updateOne({uuid:foundBill.customer_uuid}, {$set:{totalBillAmount}})

        let apiResponse = response.generate(false, `Bill Updated Successfully`, 200, result);
        res.send(apiResponse);

    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse);
    }
};

let deleteBill = async (req,res) => {
    
    let uuid = req.params.id;

    try{

        const foundBill = await Bill.findOne({ uuid })

        if(!foundBill) return 

        const result = await Bill.deleteOne({ uuid });

        await Customer.updateOne({uuid:foundBill.customer_uuid}, {$inc: {totalBillAmount: -foundBill.bill_amount}})

        let apiResponse = response.generate(false, `Bill Deleted Successfully`, 200, result);
        res.send(apiResponse);
    }catch(e){
        let apiResponse = response.generate(true, 'some error occurred', 500, e);
        res.status('500').send(apiResponse);
    }
};

module.exports = {
    create,
    getBillsByCustomer,
    getBill,
    updateBill,
    deleteBill,
    getAllBills
};