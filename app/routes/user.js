const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const common = require("./../../app/controllers/common");
const appConfig = require("./../../config/appConfig");
const auth = require("../middleware/auth");

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/user`;

    app.get(`${baseUrl}`,auth,common.readModelByFilter);

    app.post(`${baseUrl}/signup`, userController.signUpFunction);

    app.post(`${baseUrl}/add`,auth, userController.addUser);

    app.post(`${baseUrl}/login`, userController.loginFunction);

    app.post(`${baseUrl}/logout`, auth, userController.logout);

    app.get(`${baseUrl}/profile/:id`, userController.getProfile);

    app.patch(`${baseUrl}/profile`, userController.updateProfile);

    app.put(`${baseUrl}/:id`, common.updateModel);

    app.delete(`${baseUrl}/:id`, common.deleteModel);


};
