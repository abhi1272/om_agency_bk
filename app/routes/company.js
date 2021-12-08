const company = require("../controllers/company/company");
const appConfig = require("../../config/appConfig");
const auth = require("../middleware/auth");


module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/company`;

    app.post(`${baseUrl}/add`,auth ,company.createModel);

    app.get(`${baseUrl}/:id`,auth, company.readModel);

    app.get(`${baseUrl}`,auth ,company.readModelByFilter);

    app.patch(`${baseUrl}/:id`,auth ,company.updateModel);

    app.delete(`${baseUrl}/:id`,auth ,company.deleteModel);
    
};


