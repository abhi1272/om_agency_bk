const payment = require("../controllers/payment");
const common = require("./../../app/controllers/common");
const appConfig = require("./../../config/appConfig");
const auth = require("../middleware/auth");


module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/payment`;

    app.post(`${baseUrl}/add`,auth, payment.create);

    app.get(`${baseUrl}`,payment.getAllPayment);

    app.patch(`${baseUrl}/:id`,payment.updatePayment);

    app.delete(`${baseUrl}/:id`,payment.deletePayment);
    
};
