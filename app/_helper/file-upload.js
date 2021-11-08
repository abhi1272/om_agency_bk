const multer = require('multer')
const ProductModel = require('../models/Product');
const logger = require('../libs/loggerLib');
const response = require('../libs/responseLib');
const sharp = require('sharp')
const imageToBase64 = require('image-to-base64')

const uploadProduct = async (req,res) =>{
     
    const data = await sharp(req.file.buffer).png().resize(1280,833).toBuffer()
    console.log(data)

    const buffer = Buffer.from(req.file.buffer).toString('base64') // Path to the image
    
    let Product = ProductModel({
        ...req.body,
        image:buffer
    });
    
    await Product.save((err,result) => {
        if (err) {
            logger.captureError('some error occured', 'productController : addProduct', 10);
            let apiResponse = response.generate(true, 'some error occured', 400, err);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(true, 'product saved', 200, result);
            res.send(apiResponse);
            console.log(result);
        }
    })
}


const callApi = async () => {
    var options = {
        host: url,
        port: 80,
        path: '/resource?id=foo&bar=baz',
        method: 'POST'
      };
      
      http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
      }).end();
}

module.exports = {
    uploadProduct,
    callApi
}


