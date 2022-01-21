const logger = require('../libs/loggerLib');
const check = require('../libs/checkLib');
const response = require('../libs/responseLib');
const Model = require('../../config/models')
const url = require('url');
const appConfig = require('../../config/appConfig')
const { v4: uuidv4 } = require("uuid");


let readModel = async (req, res) => {

    console.log(req.params, appConfig.model)

    Model[appConfig.model].find({uuid:req.params.id})
        .exec((err, result) => {
            if (err) {
                logger.error('some error occurred', `${appConfig.model} : readModel`, 10);
                let apiResponse = response.generate(true, 'some error occurred', 400, err);
                res.send(apiResponse);
            } else if (check.isEmpty(result)) {
                logger.info('Data is empty', `${appConfig.model} : readModel`, 5);
                let apiResponse = response.generate(true, `${appConfig.model} not found`, 500, null);
                res.send(apiResponse);
            } else {
                logger.info('Data found', `${appConfig.model} : readModel`, 2);
                let apiResponse = response.generate(false, `${appConfig.model} found`, 200, result[0]);
                res.send(apiResponse);
            }
        }
        );
};

let readModelByFilter = async (req, res) => {

    const functionName = 'readModelByFilter'

    let page_size = 100
    let skip_records = 0
    let query = {}
    let queryData = url.parse(req.url, true).query;
    if(queryData.paql){
        const fetchedQuery = JSON.parse(queryData.paql)
        logger.info('Fetched Query', `${appConfig.model} : ${functionName}: ${fetchedQuery}`, 2);
        if(fetchedQuery.pagination && Object.keys(fetchedQuery.pagination).includes('page_size') && fetchedQuery.pagination.page_size){
            page_size = fetchedQuery.pagination.page_size
            logger.info('Fetched Query', `${appConfig.model} : ${functionName}: ${fetchedQuery}`, 2);
        }
        if(fetchedQuery.pagination && Object.keys(fetchedQuery.pagination).includes('page_num') && fetchedQuery.pagination.page_num > 1){
            skip_records =  (page_size - skip_records) * (+fetchedQuery.pagination.page_num - 1)
            logger.info('Fetched Query', `${appConfig.model} : ${functionName}: ${fetchedQuery}`, 2);
        }
        if(fetchedQuery.filters && fetchedQuery.filters.length > 0){
            fetchedQuery.filters.map((filter) => {
                console.log(filter.value)
                query[filter.name] = { $regex: filter.value, $options: 'i'}
            })
        }
    }else{
        query = queryData
    }

    const count = await Model[appConfig.model].countDocuments()
    Model[appConfig.model].find(query).limit(+page_size).skip(skip_records)
        .exec((err, result) => {
            if (err) {
                logger.error('some error occurred', 'commonController : readModelByFilter', 10);
                let apiResponse = response.generate(true, 'some error occured', 400, err);
                res.send(apiResponse);
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, `${appConfig.model} not found`, 500, null);
                res.send(apiResponse);
            } else {
                let apiResponse = response.generate(false, `${appConfig.model} found`, 200, result);
                apiResponse.total = count
                if(Model[appConfig.model]){
                    apiResponse.paths = Model[appConfig.model].schema.paths
                }
                res.send(apiResponse);
            }
        }
        );
};



// let readAllModel = (req, res) => {

//     Model[appConfig.model].find({})
//         .exec((err, result) => {
//             if (err) {
//                 logger.error('some error occured', 'productController : getProduct', 10);
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

    let Product = Model[appConfig.model]({
        ...req.body,
        uuid:uuidv4()
    });

    Product.save((err, result) => {
        if (err) {
            logger.error('some error occurred', 'productController : addProduct', 10);
            let apiResponse = response.generate(true, 'some error occurred', 400, err);
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
    Model[appConfig.model].updateOne({ uuid: req.params.id},options,(err, result) => {
        if (err) {
            logger.error('some error occurred', 'commonController: updateModel');
            let apiResponse = response.generate(true, 'some error occurred', 400, err);
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

    Model[appConfig.model].deleteOne({uuid:req.params.id},(err,result)=>{
        if(err){
            logger.error('error occurred','commonController : deleteProduct',10);
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
