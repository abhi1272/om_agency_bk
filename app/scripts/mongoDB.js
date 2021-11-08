const { MongoClient } = require("mongodb");
const uri = 'mongodb+srv://abhi:kite@cluster0.9wlbm.mongodb.net/pharmaApp?authSource=admin'

const client = new MongoClient(uri);

async function run() {
  try {
    MongoClient.connect(uri, async function(err, db) {
        if (err) throw err;
        console.log("Database created!");
        var dbo = db.db("pharmaApp");
        const old_customer = dbo.collection('customer_2020-21')
        const customer = dbo.collection('customers')
        const result = await old_customer.find({}).toArray()
        const modifiedCustomer = result.map((item) => {
            return { name:item.name,
                     area: item.area,
                     place: item.place,
                     uuid: item.uuid,
                     customer_type: item.customer_type,
                     type: 'Sale',
                     active: true
            }

        })
        const res = await customer.insertMany(modifiedCustomer)
        console.log('result', res)
      });
  } catch(e) {
      console.log(e)
  }
}

run()
