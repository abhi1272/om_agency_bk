let appConfig = {};
console.log('process.env.MONGODB_OM_AGENCY_URL', process.env.MONGODB_OM_AGENCY_URL)
appConfig.port = process.env.PORT || 8000;
appConfig.allowedCorsOrigin = "*";
appConfig.env = "dev";
appConfig.db = {
    uri: process.env.MONGODB_OM_AGENCY_URL
};
appConfig.apiVersion = '/api/v1';
model = ''
  

module.exports = {
    port: appConfig.port,
    allowedCorsOrigin: appConfig.allowedCorsOrigin,
    environment: appConfig.env,
    db :appConfig.db,
    apiVersion : appConfig.apiVersion,
    model:model
};