const common = require("./../../app/controllers/common");
const appConfig = require("./../../config/appConfig");
const auth = require("../middleware/auth");


module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/place`;

    app.post(`${baseUrl}/add`,auth, common.createModel);

    app.get(`${baseUrl}`,auth, common.readModelByFilter);

    app.get(`${baseUrl}/:id`,auth, common.readModel);

    app.patch(`${baseUrl}/:id`,auth, common.updateModel);

    app.delete(`${baseUrl}/:id`,auth, common.deleteModel);
    
};
