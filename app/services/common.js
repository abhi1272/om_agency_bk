const appConfig = require('../../config/appConfig')
const Model = require('../../config/models')



const getDataWithFilter = async (req, field, sortField) => {
    console.log('hello')
  try {
    const responseObj = {
      data: [],
      count: 0,
      totalAmount: 0,
    };
    let filterObj = {};
    let limitSize = 100;
    let key 
    let value
    if (Object.keys(req.query).length > 0) {
      key = Object.keys(req.query)[0].toString();
      value = Object.values(req.query)[0].toString();
      if (req.query.bill_date) {
        filterObj = { [key]: new Date(req.query.bill_date) };
        limitSize = 0;
      } else {
        filterObj = { [key]: [value] };
        limitSize = 0;
      }
    }
    filterObj.orgId = req.loggedInUser.orgId

    console.log('model', appConfig.model)
  
    const result = await Model[appConfig.model].find(filterObj).limit(limitSize).sort({[sortField] : -1})
    if (result) {
      responseObj.data = result;
      responseObj.count = result.length;
      result.map((item) => {
        responseObj.totalAmount += item[field];
      });
      return responseObj
    } else {
      return "No Record Found";
    }
  } catch (error) {
    throw error
  }
};

module.exports = {
    getDataWithFilter
};
