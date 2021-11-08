const excelToJson = require('convert-excel-to-json');
const _ = require('lodash');
const uuid = require("uuid")

const mongoCustomerArr = [];

module.exports.convertIntoJson = (sourceFile) => {
    return excelToJson({
        sourceFile,
        columnToKey: {
            '*': '{{columnHeader}}'
        }
    });
};

module.exports.covertIntoCustomerObj = (data) => {
    data && data.STATEMENT.map(item => {
        item['Area'] && mongoCustomerArr.push(createCustomer(item));
    });
    return uniqueCustomerData();
};

const createCustomer = (item) => {
    return {
        uuid: uuid(),
        name : item['Name of The Party'],
        address : item['Address of the Party'],
        area : item['Area'],
        uniqueName:item['Name of The Party'] + ' ' +  item['Area'],
        bills:[]
    }
};

const uniqueCustomerData = () => {
    return mongoCustomerArr.filter((thing, index, self) =>
        index === self.findIndex((t) => (
        t.uniqueName === thing.uniqueName 
        ))
  );
};

module.exports.customerBillMapper = (billData, customerData) => {
    let arr = [];
    billData && billData.STATEMENT.map(bill => {
        const uniqueName = bill['Name of The Party'] + ' ' +  bill['Area']
        if (uniqueName) {
            customerData.forEach((customer, index) => {
                if (uniqueName === customer.uniqueName) {
                    customerData[index].bills.push(createBillSchema(bill));
                }
            })
        }
    });
    return customerData;
};

const createBillSchema = bill => {
    return {
        uuid: uuid(),
        bill_no: bill["Bill Number"],
        basic_amount: bill["Basic Amount"],
        bill_amount: bill["Invoice Value"],
        type: bill["Type"],
        date: bill["Date"],
        customer_name:bill['Name of The Party'],
        place:bill['Area'],
        firm_name:'OMEX PHARMA',
        bill_date: covertDateIntoTimeStamp(bill["Date"]),
        payments:[]
    };
};

const covertDateIntoTimeStamp = date => {
    const myDate = date.split("/");
    const newDate = new Date( myDate[2], myDate[1] - 1, myDate[0]);
    return newDate.getTime()
};