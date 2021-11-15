const appConfig = require("./../../config/appConfig");
const auth = require('../middleware/auth')
const customer = require('../controllers/customer')

module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/customer`;

    app.post(`${baseUrl}/add`,customer.createModel);

    app.get(`${baseUrl}/:id`,customer.readModel);

    app.get(`${baseUrl}`,customer.readModelByFilter);

    app.patch(`${baseUrl}/:id`,customer.updateModel);

    app.delete(`${baseUrl}/:id`,customer.deleteModel);
    
};


