const config = require("../config.json");
const abiDAI = require("../contracts/abiDAI.json");
const Offer = require("../models/Offer");
const serviceManufacturer = require("./Manufacturer");
const axios = require("axios");
const Service = require("../models/Service");
const serviceService = require("../services/Service");

let eventsOffer={};
let eventsService={};

let getBalance = (web3, _package) => {
    return new Promise(async (resolve, reject) => {
        let tokenContract = new web3.eth.Contract(abiDAI, config.tokenContractAddress);
        let balance = await tokenContract.methods.balanceOf(_package.address).call();
        balance = web3.utils.fromWei(balance, "ether");
        resolve(balance);
    })
}

let clearBalance = (web3, _package) => {
    return new Promise(async (resolve, reject) => {
        let balance = await getBalance(web3, _package);
        if (balance > 0) {
            let tokenContract = new web3.eth.Contract(abiDAI, config.tokenContractAddress);
            web3.eth.accounts.wallet.add(_package.private_key);
            let tx = await tokenContract.methods.transfer(_package.address, balance).send({
                from: _package.address,
                gasLimit: "100000",
            });
            resolve(tx);
        }
        reject("No balance to return");
    })
}

module.exports.getBalance = getBalance;
module.exports.clearBalance = clearBalance;