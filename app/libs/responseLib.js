/* response generation library for api */
let generate = (err, message, status, data, totalAmount) => {
    let response = {
      error: err,
      message: message,
      status: status,
      data: data,
      totalAmount:totalAmount
    }
    return response
  }
  
  module.exports = {
    generate: generate
  }
  