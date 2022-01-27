const payment = require("../controllers/company/companyPayment");
const appConfig = require("../../config/appConfig");
const auth = require("../middleware/auth");


module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/company-payment`;

    app.post(`${baseUrl}/add`,auth, payment.createPayment);

    // app.post(`${baseUrl}/create`,auth, payment.createPayment);

    app.get(`${baseUrl}`,auth, payment.getAllPayment);

    app.patch(`${baseUrl}/:id`,auth, payment.updatePayment);

    app.delete(`${baseUrl}/:id`,auth, payment.deletePayment);
    
};
