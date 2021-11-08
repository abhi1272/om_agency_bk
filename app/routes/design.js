const common = require("./../../app/controllers/common");
const appConfig = require("./../../config/appConfig");


module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/design`;

    app.post(`${baseUrl}/add`,common.createModel);

    // app.get(`${baseUrl}`,common.readAllModel);

    app.get(`${baseUrl}`,common.readModelByFilter);

    app.patch(`${baseUrl}/:id`,common.updateModel);

    app.delete(`${baseUrl}/:id`,common.deleteModel);
    
};
