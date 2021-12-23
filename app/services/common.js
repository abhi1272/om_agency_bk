const appConfig = require('../../config/appConfig')
const Model = require('../../config/models')

const getDataWithFilter = async (req, field, sortField, model) => {
    console.log('----hello-----', req.query)
  try {
    const responseObj = {
      data: [],
      count: 0,
      totalAmount: 0,
    };
    let filterObj = {};
    let limitSize = 10000;
    let key 
    let value

    let start_date = null
    let end_date = null
    if(req.query.start_date && req.query.end_date){
      start_date = req.query.start_date
      end_date = req.query.end_date
      filterObj = {
        due_date: { $gte: new Date(start_date), $lte: new Date(end_date) },
      };
    }

    if (Object.keys(req.query).length > 0) {
      key = Object.keys(req.query)[0].toString();
      value = Object.values(req.query)[0].toString();
      if (req.query.bill_date) {
        filterObj = { [key]: new Date(req.query.bill_date) };
        limitSize = 0;
      } 
      else if(key !== 'type' && key !== 'start_date' && key !== 'end_date'){
        filterObj = { [key]: [value] };
        limitSize = 0;
      }
    }
    filterObj.orgId = req.loggedInUser.orgId

    if(req.query.type){
      filterObj['customer.type'] = req.query.type
    }
    console.log('model', model)
  
    const result = await Model[model].find(filterObj).limit(limitSize).sort({[sortField] : -1})
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
