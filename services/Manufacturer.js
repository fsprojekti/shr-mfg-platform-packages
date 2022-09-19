const abiManufacturerRegister = require("../contracts/abiManufacturerRegister.json");
const config = require("../config.json");

let fetchManufacturers = (web3) => {
    return new Promise(async (resolve, reject) => {
        let manufacturerRegisterContract = new web3.eth.Contract(abiManufacturerRegister, config.manufacturersRegisterAddress);
        let manufacturers = await manufacturerRegisterContract.methods.getManufacturersAndUrls().call();
        //Transform manufacturers to array of objects
        let manufacturersArray = [];
        for (let i = 0; i < manufacturers[0].length; i++) {
            manufacturersArray.push({
                address: manufacturers[0][i],
                url: manufacturers[1][i]
            })
        }
        resolve(manufacturersArray)
    })
}

let getUrl = (web3, manufacturerAddress) => {
    return new Promise(async (resolve, reject) => {
        let manufacturerRegisterContract = new web3.eth.Contract(abiManufacturer, config.manufacturersRegisterAddress);
        let url = await manufacturerRegisterContract.methods.getManufacturer(manufacturerAddress).call();
        resolve(url);
    })
}


module.exports.fetchManufacturers = fetchManufacturers;
module.exports.getUrl = getUrl;

