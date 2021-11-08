
const http = require('http')

const callApi = async (request) => {
    var options = {
        host: request.url,
        port: 80,
        method: 'POST',
        paidAmount:request.paidAmount
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
    callApi
}


