const common = require("./../../app/controllers/common");
const appConfig = require("./../../config/appConfig");


module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/category`;

    app.post(`${baseUrl}/add`,common.createModel);

    app.get(`${baseUrl}`,common.readModelByFilter);

    app.get(`${baseUrl}/:id`,common.readModel);

    app.patch(`${baseUrl}/:id`,common.updateModel);

    app.delete(`${baseUrl}/:id`,common.deleteModel);
    
};
