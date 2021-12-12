const Bill = require('../../models/CompanyBill');
const Company = require('../../models/Company');
const _  = require('lodash');
const common = require('../../services/common.js')
const moment = require('moment');
const { uuid } = require('uuidv4');

let create = async (req,res) => {

    let newBill = new Bill({
        ...req.body,
        orgId:req.loggedInUser.orgId,
        uuid:uuid()
    });

    try{
        const foundCompany = await Company.findOne({uuid:newBill.company_uuid})

        const due_date = moment(req.body.trDate).add(foundCompany.dueDays, 'days').format('YYYY-MM-DD')
        newBill.due_date = due_date

        newBill.company = {
            name: foundCompany.name,
            area: foundCompany.area,
            uuid: foundCompany.uuid,
        }

        await newBill.save();
        
        await Company.updateOne({uuid:newBill.company_uuid}, {$inc: {totalBillAmount: +newBill.bill_amount}})

        res.send(newBill);

    }catch(e){
        console.log(e)
        res.status('500').send(JSON.stringify(e));
    }
};

let getAllBills = async (req,res) => {
  
    const result = await common.getDataWithFilter(req,'bill_amount', 'bill_date', 'CompanyBill')
    res.send(result)
       
};


let getBillsByCustomer = async (req,res) => {

    let uuid = req.params.company_uuid;

    try{
        let bills = await Bill.find({['company_uuid']:uuid}).sort({bill_date:1})
        res.send(bills);
    }catch(e){
        res.status('500').send(e);
    }

};


let getBill = async (req,res) => {

    let uuid = req.params.id;

    try{
        let result = await Bill.findOne({uuid});
        res.send(result);
    }catch(e){
        res.send(e);
    }
};


let updateBill =  async (req,res) => {

    let bill = req.body;
    const date = new Date()
    try{

        const foundBill = await Bill.findOne({ uuid: req.params.id })

        if(!foundBill) return 


        const foundCustomer = await Company.findOne({uuid:foundBill.company_uuid})

        const due_date = moment(bill.trDate).add(foundCustomer.dueDays, 'days').format('YYYY-MM-DD')

        const result = await Bill.updateOne(
            { uuid: req.params.id },
            {
              $set: {
                  bill_amount: bill.bill_amount || foundBill.bill_amount,
                  bill_date: bill.bill_date || foundBill.bill_date,
                  trDate: bill.trDate || foundBill.trDate,
                  due_date:due_date || foundBill.due_date,
                  bill_no : bill.bill_no || foundBill.bill_no,
                  amount_left: bill.amount_left || foundBill.amount_left
              },
            }
          );

        
        
        let totalBillAmount = foundCustomer.totalBillAmount

        if(bill.bill_amount > foundBill.bill_amount) {
            totalBillAmount = foundCustomer.totalBillAmount + (bill.bill_amount - foundBill.bill_amount)
        }else if(bill.bill_amount < foundBill.bill_amount) {
            totalBillAmount = foundCustomer.totalBillAmount - (foundBill.bill_amount -  bill.bill_amount)
        }

        await Company.updateOne({uuid:foundBill.company_uuid}, {$set:{totalBillAmount}})

        res.send(result);

    }catch(e){
        res.send(e);
    }
};

let deleteBill = async (req,res) => {
    
    let uuid = req.params.id;

    try{

        const foundBill = await Bill.findOne({ uuid })

        if(!foundBill) return 

        const result = await Bill.deleteOne({ uuid });

        await Company.updateOne({uuid:foundBill.company_uuid}, {$inc: {totalBillAmount: -foundBill.bill_amount}})

        res.send(result);
    }catch(e){
        res.send(e);
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