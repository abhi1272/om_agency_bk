const logger = require('../libs/loggerLib');
const check = require('../libs/checkLib');
const response = require('../libs/responseLib');
const Customer = require('../models/Customer')
const appConfig = require('../../config/appConfig')
const { v4: uuidv4 } = require("uuid");


let readModel = async (req, res) => {

    console.log(req.params, appConfig.model)

    Customer.find({uuid:req.params.id})
        .exec((err, result) => {
            if (err) {
                logger.error('some error occurred', 'productController : getProduct', 10);
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
    let query = {active: true, orgId: req.loggedInUser.orgId}
    const place_uuids = req.loggedInUser.place.map(item => item.uuid)
    if(place_uuids && place_uuids.length){
        query["place.uuid"] = {$in:place_uuids}
    }
    const count = await Customer.countDocuments()
    console.log('model', appConfig.model)
    Customer.find(query).limit(+page_size).skip(skip_records)
        .exec((err, result) => {
            if (err) {
                console.log('error', err)
                logger.error('some error occured', 'productController : getProduct', 10);
                let apiResponse = response.generate(true, 'some error occured', 400, err);
                res.send(apiResponse);
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, `${appConfig.model} not found`, 500, []);
                res.send(apiResponse);
            } else {
                let apiResponse = response.generate(false, `${appConfig.model} found`, 200, result);
                apiResponse.total = count
                // apiResponse.paths = Customer.schema.paths
                res.send(apiResponse);
            }
        }
        );
};



// let readAllModel = (req, res) => {

//     Customer.find({})
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

    let Product = Customer({
        ...req.body,
        orgId:req.loggedInUser.orgId,
        uuid:uuidv4()
    });

    Product.save((err, result) => {
        if (err) {
            console.log('err', err)
            // logger.error('some error occured', 'productController : addProduct', 10);
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
            logger.error('some error occured', 'productController: editProduct');
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
            logger.error('error occured','productController : deleteProduct',10);
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
