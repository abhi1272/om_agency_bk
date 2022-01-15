const appConfig = require("./../../config/appConfig");
const auth = require('../middleware/auth')
const customer = require('../controllers/customer')

module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/customer`;

    app.post(`${baseUrl}/add`,auth, customer.createModel);

    app.get(`${baseUrl}/:id`,auth, customer.readModel);

    app.get(`${baseUrl}`,auth, customer.readModelByFilter);

    app.patch(`${baseUrl}/:id`,auth, customer.updateModel);

    app.delete(`${baseUrl}/:id`,auth, customer.deleteModel);
    
};


