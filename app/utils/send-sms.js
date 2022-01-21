var unirest = require("unirest");

const sendSms = (message) => {
  var req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");

  req.headers({
    authorization:
     process.env.sms_auth,
  });

  req.form({
    sender_id: "TXTIND",
    message: message,
    route: "v3",
    numbers: "8170835195",
  });

  req.end(function (res) {
    if (res.error) throw new Error(res.error);

    console.log(res.body);
  });
};


module.exports = {
  sendSms
}

// ZlmFhvef7uc9pv51X8mEFenXAkf2XLQqoMqp4uBf9oh9jlyAGPkAvBtz5gwo

// var axios = require("axios").default;

// var options = {
//   method: 'POST',
//   url: 'https://clicksend.p.rapidapi.com/sms/send',
//   headers: {
//     'content-type': 'application/json',
//     authorization: 'Basic c3VwcG9ydEBhd3ppbmcuaW46QWJoaUAxMjM=',
//     'x-rapidapi-host': 'clicksend.p.rapidapi.com',
//     'x-rapidapi-key': '314c334b97msh22e13bc172d5200p1a2366jsnb528a0450b7e'
//   },
//   data: {
//     messages: [
//       {
//         source: 'mashape',
//         from: 'Test',
//         body: 'Hello , This is test Message',
//         to: '+918170835195',
//         schedule: '1452244637',
//         custom_string: 'this is a test message bro'
//       }
//     ]
//   }
// };

// axios.request(options).then(function (response) {
// 	console.log(response.data);
// }).catch(function (error) {
// 	console.error(error);
// });

