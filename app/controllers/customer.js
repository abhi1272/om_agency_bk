const logger = require('../libs/loggerLib');
const check = require('../libs/checkLib');
const response = require('../libs/responseLib');
const Customer = require('../models/Customer')
const url = require('url');
const appConfig = require('../../config/appConfig')
const { v4: uuidv4 } = require("uuid");


let readModel = async (req, res) => {

    console.log(req.params, appConfig.model)

    Customer.find({uuid:req.params.id})
        .exec((err, result) => {
            if (err) {
                console.log('error', err)
                logger.captureError('some error occurred', 'productController : getProduct', 10);
                let apiResponse = response.generate(true, 'some error occurred', 400, err);
                res.send(apiResponse);
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, `${appConfig.model} not found`, 500, null);
                res.send(apiResponse);
            } else {
                let apiResponse = response.generate(false, `${appConfig.model} found`, 200, result[0]);
                res.send(apiResponse);
            }
        }
        );
};

let readModelByFilter = async (req, res) => {

    let page_size = 1000
    let skip_records = 0
    let query = {active: true}
    let queryData = url.parse(req.url, true).query;
    if(queryData.paql){
        const fetchedQuery = JSON.parse(queryData.paql)
        console.log(fetchedQuery)
        if(fetchedQuery.pagination && Object.keys(fetchedQuery.pagination).includes('page_size') && fetchedQuery.pagination.page_size){
            page_size = fetchedQuery.pagination.page_size
        }
        if(fetchedQuery.pagination && Object.keys(fetchedQuery.pagination).includes('page_num') && fetchedQuery.pagination.page_num > 1){
            console.log(fetchedQuery.pagination.page_num)
            skip_records =  (page_size - skip_records) * (+fetchedQuery.pagination.page_num - 1)
        }
        if(fetchedQuery.filters && fetchedQuery.filters.length > 0){
            fetchedQuery.filters.map((filter) => {
                console.log(filter.value)
                query[filter.name] = { $regex: filter.value, $options: 'i'}
            })
        }
    }

    const count = await Customer.countDocuments()
    console.log('model', appConfig.model)
    Customer.find(query).limit(+page_size).skip(skip_records)
        .exec((err, result) => {
            if (err) {
                console.log('error', err)
                logger.captureError('some error occured', 'productController : getProduct', 10);
                let apiResponse = response.generate(true, 'some error occured', 400, err);
                res.send(apiResponse);
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, `${appConfig.model} not found`, 500, null);
                res.send(apiResponse);
            } else {
                let apiResponse = response.generate(false, `${appConfig.model} found`, 200, result);
                apiResponse.total = count
                apiResponse.paths = Customer.schema.paths
                res.send(apiResponse);
            }
        }
        );
};



// let readAllModel = (req, res) => {

//     Customer.find({})
//         .exec((err, result) => {
//             if (err) {
//                 logger.captureError('some error occured', 'productController : getProduct', 10);
//                 let apiResponse = response.generate(true, 'some error occured', 400, err);
//                 res.send(apiResponse);
//             } else if (check.isEmpty(result)) {
//                 let apiResponse = response.generate(true, `${appConfig.model} not found`, 500, null);
//                 res.send(apiResponse);
//             } else {
//                 let apiResponse = response.generate(false, `${appConfig.model} found`, 200, result);
//                 res.send(apiResponse);
//             }
//         }
//         );
// };



let createModel = (req, res) => {

    let Product = Customer({
        ...req.body,
        uuid:uuidv4()
    });

    Product.save((err, result) => {
        if (err) {
            console.log('err', err)
            // logger.captureError('some error occured', 'productController : addProduct', 10);
            let apiResponse = response.generate(true, 'some error occured', 400, err);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(true, `${appConfig.model} saved`, 200, result);
            res.send(apiResponse);
            console.log(result);
        }
    });


};

let updateModel = (req, res) => {

    let options = req.body;
    Customer.updateOne({ uuid: req.params.id},options,(err, result) => {
        if (err) {
            logger.captureError('some error occured', 'productController: editProduct');
            let apiResponse = response.generate(true, 'some error occured', 400, err);
            res.send(apiResponse);
        }
        else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, `${appConfig.model} not found`, 500, null);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(false, `${appConfig.model} updated successfully ${req.params.Batch}`, 200, result);
            res.send(apiResponse);
        }
    });

};

let deleteModel = (req,res) =>{

    Customer.deleteOne({uuid:req.params.id},(err,result)=>{
        if(err){
            logger.captureError('error occured','productController : deleteProduct',10);
            res.send(err);
        }else if(check.isEmpty(result)){
            let apiResponse = response.generate(true,`${appConfig.model} not found`,500,null);
            res.send(apiResponse);
        }else{
            let apiResponse = response.generate(false,`${appConfig.model} ${req.params.Batch} deleted found`,500,null);
            res.send(apiResponse);
        }
    });
    
};


module.exports = {
    readModel,
    readModelByFilter,
    createModel,
    updateModel,
    deleteModel
};
