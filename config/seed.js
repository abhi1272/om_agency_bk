const faker = require('faker');
const shortid = require('shortid');
const fs = require('fs');


const currentModel = process.argv[2];
const modelCount = process.argv[3]

let createData = () => {
    let users = loadUsers();
    for(let i=1;i<=modelCount;i++){
        users.push(selectModel());
    }
    saveUsers(users);
};

let saveUsers = (users) => {
    let saveUser = JSON.stringify(users);
    fs.writeFileSync(`${currentModel}.json`, saveUser);
};

let loadUsers = () => {
    console.log('load')
    try {
        let dataBuffer = fs.readFileSync(`${currentModel}.json`);
        let dataJson = dataBuffer.toString();
        return JSON.parse(dataJson);
    } catch (e) {
        return [];
    }
};

function selectModel(){
    if(currentModel === 'User'){
       return {
            userId: shortid.generate(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            password: faker.internet.password(),
            email: faker.internet.email(),
            mobileNumber: faker.phone.phoneNumber()
        }
    }else if(currentModel === 'Customer'){
        return {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            address: {
                street: faker.address.streetName(),
                place: faker.address.city(),
                pincode: faker.address.zipCode(),
            },
            password: faker.internet.password(),
            email: faker.internet.email(),
            mobileNumber: faker.phone.phoneNumber()
        }
    }else if(currentModel === 'Product'){
        return {
            productName: faker.commerce.productName(),
            company: faker.commerce.department(),
            batchNo: shortid.generate(),
            MRP: faker.commerce.price(),
            Rate: faker.commerce.price()
        }
    }
}

createData()
