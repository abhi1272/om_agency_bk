const PaymentModel = require("../models/Payment");
const BillModel = require("../models/Bill");
const ExpenseModel = require("../models/Bill");
const helper = require("../_helper/helper")
const moment = require("moment");

let getDailyData = async (req, res) => {
  try {
    const responseObj = {
      data : [],
      count : 0,
      totalPaymentSum: 0,
      totalBillSum: 0
    }
    let paymentArr = []
    let start_date = ''
    let end_date = ''
    if(req.query.start_date && req.query.end_date){
      start_date = req.query.start_date
      end_date = req.query.end_date
    }

    let parsedCustomerId = "";
    if (req.query.customer_uuid) {
      parsedCustomerId = JSON.parse(req.query.customer_uuid);
    }

    let parsedPlaceId = "";
    if (req.query.place_uuid) {
      parsedPlaceId = JSON.parse(req.query.place_uuid);
    }

    const paymentQuery = {
      payment_date: { $gte: new Date(start_date), $lte: new Date(end_date) },
    };

    paymentQuery.orgId = req.loggedInUser.orgId || []
    paymentQuery["customer.type"] = req.query.transaction_type


    if (parsedPlaceId.length) {
      paymentQuery['customer.place.uuid'] = { $in: parsedPlaceId };
    }

    if (parsedCustomerId.length) {
      paymentQuery.customer_uuid = { $in: parsedCustomerId };
    }

    const billQuery = {
      bill_date: { $gte: new Date(start_date), $lte: new Date(end_date) },
    };

    billQuery.orgId = req.loggedInUser.orgId || []
    billQuery["customer.type"] = req.query.transaction_type


    if (parsedCustomerId.length) {
      billQuery.customer_uuid = { $in: parsedCustomerId };
    }

    if (parsedPlaceId.length) {
      billQuery['customer.place.uuid'] = { $in: parsedPlaceId };
    }

    PaymentModel.aggregate([
      {
        $match: paymentQuery
      },
      {
        $group: {
          _id: "$payment_date",
          payment_date: { $first: "$payment_date" },
          totalPaymentAmount: { $sum: "$paid_amount" },
        },
      },
      { $sort: { _id: -1 } },
    ]).exec((err, payments) => {
      if (err) throw err;
      paymentArr = payments;
      BillModel.aggregate([
        {
          $match: billQuery
        },
        {
          $group: {
            _id: "$bill_date",
            bill_date: { $first: "$bill_date" },
            totalBillAmount: { $sum: "$bill_amount" },
          },
        },
        { $sort: { _id: -1 } },
      ]).exec((err, bills) => {
        if (err) throw err;
        bills.map((bill) => {
          paymentArr.map((payment) => {
            if ( moment(bill.bill_date).format("YYYY-MM-DD") == 
            moment(payment.payment_date).format("YYYY-MM-DD")) 
            {
              payment.totalBillAmount = bill.totalBillAmount || 0;
            }
          });
        });


        responseObj.data = paymentArr
        responseObj.count = paymentArr.length
        paymentArr.map((item) => {
          item.totalPaymentAmount = item.totalPaymentAmount ? item.totalPaymentAmount : 0
          item.totalBillAmount = item.totalBillAmount ? item.totalBillAmount : 0
          responseObj.totalPaymentSum += item.totalPaymentAmount ? item.totalPaymentAmount : 0
          responseObj.totalBillSum += item.totalBillAmount ? item.totalBillAmount : 0
        })
        paymentArr.push({payment_date: 'Total',totalPaymentAmount: responseObj.totalPaymentSum, totalBillAmount: responseObj.totalBillSum })
        responseObj.count = paymentArr.length
        res.send(responseObj)
      });
    });
  } catch (error) {
    console.log(error)
    res.send(error);
  }
};

let total = async (req, res) => {
  try {
    const responseObj = {
      totalSales: 0,
      totalPayment: 0,
      totalDues: 0,
      totalExpenses: 0,
      totalSalesInWords: 0,
      totalPaymentInWords: 0,
      totalDuesInWords: 0,
      totalExpensesInWords: 0,
    };

    if (req.query.customer_uuid) {
      query = {
        $match: {
          customer_uuid: { $in: ["cb0f9176-685e-434d-bb0b-9fb426758b01"] }
        },
      };
    }

    const billResult = await BillModel.aggregate([
      {
        $match: {
          orgId: req.loggedInUser.orgId || [],
          "customer.type" : req.query.transaction_type
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$bill_amount",
          },
        },
      }
    ]);
    const paymentResult = await PaymentModel.aggregate([
      {
        $match: {
          orgId: req.loggedInUser.orgId || [],
          "customer.type" : req.query.transaction_type
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$paid_amount",
          },
        },
      },
    ]);

    const expenseResult = await ExpenseModel.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);
    responseObj.totalSales = billResult[0] ? billResult[0].total : 0;
    responseObj.totalPayment = paymentResult[0] ? paymentResult[0].total : 0;
    responseObj.totalDues = responseObj.totalSales - responseObj.totalPayment;
    responseObj.totalExpenses = expenseResult[0].total;
    responseObj.totalSalesInWords = helper.inWords(responseObj.totalSales)
    responseObj.totalPaymentInWords = helper.inWords(responseObj.totalPayment)
    responseObj.totalDuesInWords = helper.inWords(responseObj.totalDues)
    responseObj.totalExpensesInWords = helper.inWords(responseObj.totalExpenses)


    res.send(responseObj);
  } catch (error) {
    res.send(error);
  }
};

let getMonthlyData = async (req, res) => {

  const responseObj = {
    data: [],
    totalBillAmount: 0,
    totalPaymentAmount: 0
  }
  let TODAY = new Date().toISOString();
  let YEAR_BEFORE = "2020-10-01T00:00:00";
  // let req = { params: { productId: 1 } };
  const monthsArray = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let parsedCustomerId = ''
  if(req.query.customer_uuid){
    parsedCustomerId = JSON.parse(req.query.customer_uuid)
  }
 
  const paymentQuery = {
    payment_date: { $gte: new Date(YEAR_BEFORE), $lte: new Date(TODAY) },
  }

  paymentQuery.orgId = req.loggedInUser.orgId || []
  paymentQuery["customer.type"] = req.query.transaction_type


  if(parsedCustomerId.length){
    paymentQuery.customer_uuid = {$in: parsedCustomerId}
  }

  const billQuery = {
    bill_date: { $gte: new Date(YEAR_BEFORE), $lte: new Date(TODAY) }
  }

  billQuery.orgId = req.loggedInUser.orgId || []
  billQuery["customer.type"] = req.query.transaction_type
  

  if(parsedCustomerId.length){
    billQuery.customer_uuid = {$in: parsedCustomerId}
  }

const paymentResult = await PaymentModel.aggregate([
    {
      $match: paymentQuery
      ,
    },
    {
      $group: {
        _id: { year_month: { $substrCP: ["$payment_date", 0, 7] } },
        count: { $sum: "$paid_amount" },
      },
    },
    {
      $sort: { "_id.year_month": 1 },
    },
    {
      $project: {
        _id: 0,
        count: 1,
        month_year: {
          $concat: [
            {
              $arrayElemAt: [
                monthsArray,
                {
                  $subtract: [
                    { $toInt: { $substrCP: ["$_id.year_month", 5, 2] } },
                    1,
                  ],
                },
              ],
            },
            " ",
            { $substrCP: ["$_id.year_month", 0, 4] },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        data: { $push: { k: "$month_year", v: "$count" } },
      },
    },
    {
      $project: {
        data: { $arrayToObject: "$data" },
        _id: 0,
      },
    },
  ])

  const billResult = await BillModel.aggregate([
    {
      $match: billQuery,
    },
    {
      $group: {
        _id: { year_month: { $substrCP: ["$bill_date", 0, 7] } },
        count: { $sum: "$bill_amount" },
      },
    },
    {
      $sort: { "_id.year_month": 1 },
    },
    {
      $project: {
        _id: 0,
        count: 1,
        month_year: {
          $concat: [
            {
              $arrayElemAt: [
                monthsArray,
                {
                  $subtract: [
                    { $toInt: { $substrCP: ["$_id.year_month", 5, 2] } },
                    1,
                  ],
                },
              ],
            },
            " ",
            { $substrCP: ["$_id.year_month", 0, 4] },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        data: { $push: { k: "$month_year", v: "$count" } },
      },
    },
    {
      $project: {
        data: { $arrayToObject: "$data" },
        _id: 0,
      },
    },
  ])

  const totalMonthlyData = Object.keys(paymentResult[0].data).reverse().map((key) => {
      const payObj = {
        month : key,
        payment_amount: paymentResult[0].data[key],
        bill_amount: billResult[0].data[key]
      }
    return payObj
  })

  responseObj.data =  totalMonthlyData

  totalMonthlyData.map((data) => {
    responseObj.totalPaymentAmount +=  data.payment_amount
    responseObj.totalBillAmount +=  data.bill_amount
  })

  res.send(responseObj)
};

let getDataByPlace = async (req, res) => {
  try {
    const placeRespectiveData = {
      billData : [],
      paymentData: []
    }

    const billData = await BillModel.aggregate([
      {
        $match: { orgId: req.loggedInUser.orgId },
      },
      {
        $group: {
          _id: "$customer.place.name",
          value: { $sum: "$bill_amount" },
        },
      },
    ]);

   const paymentData = await PaymentModel.aggregate([
     {
       $match: { orgId: req.loggedInUser.orgId },
     },
     {
       $group: {
         _id: "$customer.place.name",
         value: { $sum: "$paid_amount" },
       },
     },
   ]);
  placeRespectiveData.billData = billData.map(({ _id: name, ...rest }) => ({
    name,
    ...rest,
  }));
  placeRespectiveData.paymentData = paymentData.map(({ _id: name, ...rest }) => ({
    name,
    ...rest,
  }));
   console.log('billData', placeRespectiveData)
   res.send(placeRespectiveData)
  }catch(error){
    res.send(error)
  }


}

module.exports = {
  getDailyData,
  total,
  getMonthlyData,
  getDataByPlace
};
