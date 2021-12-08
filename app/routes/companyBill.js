const bill = require("../controllers/company/companyBill");
const appConfig = require("../../config/appConfig");
const auth = require("../middleware/auth");

module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/company-bill`;

    app.post(`${baseUrl}/add`,auth, bill.create);

    app.get(`${baseUrl}`,auth, bill.getAllBills);

    app.get(`${baseUrl}/:company_uuid`,auth, bill.getBillsByCustomer);

    app.patch(`${baseUrl}/:id`,auth, bill.updateBill);

    app.delete(`${baseUrl}/:id`,auth, bill.deleteBill);
    
};
