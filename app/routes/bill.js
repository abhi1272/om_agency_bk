const bill = require("./../../app/controllers/bill");
const appConfig = require("./../../config/appConfig");
const common = require("./../../app/controllers/common");
const auth = require("../middleware/auth");


module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/bill`;

    app.post(`${baseUrl}/add`,auth, bill.create);

    app.get(`${baseUrl}`,auth, bill.getAllBills);

    app.get(`${baseUrl}/:customer_uuid`,auth, bill.getBillsByCustomer);

    app.patch(`${baseUrl}/:id`,auth, bill.updateBill);

    app.delete(`${baseUrl}/:id`,auth, bill.deleteBill);
    
};
