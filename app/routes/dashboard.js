const dashboard = require("./../../app/controllers/dashboard");
const appConfig = require("./../../config/appConfig");
const auth = require("../middleware/auth");


module.exports.setRouter = (app) => { 

    let baseUrl = `${appConfig.apiVersion}/dashboard`;

    app.get(`${baseUrl}/daily`,auth, dashboard.getDailyData);

    app.get(`${baseUrl}/monthly`,auth, dashboard.getMonthlyData);

    app.get(`${baseUrl}/total`,auth ,dashboard.total);


};
