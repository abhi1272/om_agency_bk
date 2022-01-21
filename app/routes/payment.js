const payment = require("../controllers/payment");
const common = require("./../../app/controllers/common");
const appConfig = require("./../../config/appConfig");
const auth = require("../middleware/auth");


module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/payment`;

    app.post(`${baseUrl}/create`,auth, payment.create);

    app.post(`${baseUrl}/add`,auth, payment.createPayment);

    app.get(`${baseUrl}`,auth, payment.getAllPayment);

    app.patch(`${baseUrl}/:id`,auth, payment.updatePayment);

    app.delete(`${baseUrl}/:id`,auth, payment.deletePayment);
    
};
