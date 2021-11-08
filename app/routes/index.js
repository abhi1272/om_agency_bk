const appConfig = require("./../../config/appConfig");

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}`;


    app.get("/", (req, res) => {});

    app.get(baseUrl + "/", (req, res) => res.send("Working Fine."));
    
};