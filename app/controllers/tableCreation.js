const fs = require('fs')
const util = require('util')
const path = require('path')
const designService = require('../services/designCreation')

const tableCreation = async (req, res) => {

       
    let model = req.body.modelName
    let modelObj = req.body.modifiedModelObj
    let lowerCaseModel = model.toLowerCase()
    let upperCaseModel = model.slice(0, 1).toUpperCase() + model.slice(1);

    let baseDir = path.join(__dirname, '../')
    let configPath = path.join(__dirname, '../../')

    console.log('baseDir',baseDir, configPath)
    fs.writeFileSync(`${baseDir}/models/${upperCaseModel}.js`, "const mongoose = require('mongoose');\n");
    fs.appendFileSync(`${baseDir}/models/${upperCaseModel}.js`, `const ${model}Schema = new mongoose.Schema(${util.inspect(modelObj)});\n`, 'utf-8');
    fs.appendFileSync(`${baseDir}/models/${upperCaseModel}.js`, `module.exports = mongoose.model('${upperCaseModel}',${model}Schema);\n`);

    try {
        fs.readFile(`${baseDir}/models/${upperCaseModel}.js`, 'utf8', function (err, data) {
            if (err) {
                return console.log('err', err);
            }

            var result = data.replace(/'String'/gi, 'String');
            var result = result.replace(/'Number'/gi, 'Number');
            var result = result.replace(/'Buffer'/gi, 'Buffer');

            fs.writeFile(`${baseDir}/models/${upperCaseModel}.js`, result, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });
    }catch(err){
        console('----error----', err)
    }



    fs.readFile(`${baseDir}/routes/place.js`, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('model name', model)
        var result = data.replace(/place/gi, lowerCaseModel);

        fs.writeFile(`${baseDir}/routes/${lowerCaseModel}.js`, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });

    fs.readFile(`${configPath}/config/models.js`, 'utf8', function readFileCallback(err, data) {
        if (err) {
          console.log(err);
        } else {
          const addData = `    ,${upperCaseModel}:require('../app/models/${upperCaseModel}')\n}`
          var result = data.replace(/[}]/g, addData);
          fs.writeFile(`${configPath}/config/models.js`, result, 'utf8', err => {
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