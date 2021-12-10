const fs = require('fs')
const util = require('util')
const designService = require('../services/designCreation')

const tableCreation = async (req, res) => {

       
    let model = req.body.modelName
    let modelObj = req.body.modifiedModelObj
    let lowerCaseModel = model.toLowerCase()
    let upperCaseModel = model.slice(0, 1).toUpperCase() + model.slice(1);
    
    fs.writeFileSync(`app/models/${upperCaseModel}.js`, "const mongoose = require('mongoose');\n");
    fs.appendFileSync(`app/models/${upperCaseModel}.js`, `const ${model}Schema = new mongoose.Schema(${util.inspect(modelObj)});\n`, 'utf-8');
    fs.appendFileSync(`app/models/${upperCaseModel}.js`, `module.exports = mongoose.model('${upperCaseModel}',${model}Schema);\n`);

    try {
        fs.readFile(`app/models/${upperCaseModel}.js`, 'utf8', function (err, data) {
            if (err) {
                return console.log('err', err);
            }

            var result = data.replace(/'String'/gi, 'String');
            var result = result.replace(/'Number'/gi, 'Number');
            var result = result.replace(/'Buffer'/gi, 'Buffer');

            fs.writeFile(`app/models/${upperCaseModel}.js`, result, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });
    }catch(err){
        console('----error----', err)
    }



    fs.readFile(`app/routes/place.js`, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('model name', model)
        var result = data.replace(/place/gi, lowerCaseModel);

        fs.writeFile(`app/routes/${lowerCaseModel}.js`, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });

    fs.readFile("config/models.js", 'utf8', function readFileCallback(err, data) {
        if (err) {
          console.log(err);
        } else {
          const addData = `    ,${upperCaseModel}:require('../app/models/${upperCaseModel}')\n}`
          var result = data.replace(/[}]/g, addData);
          fs.writeFile("config/models.js", result, 'utf8', err => {
            if (err) throw err;
            console.log('File has been saved!');
          });
        }
      });
    });
    await designService.creatTableDesign(req.body)

    res.send('Table Created...')


}

module.exports = {
    tableCreation
}