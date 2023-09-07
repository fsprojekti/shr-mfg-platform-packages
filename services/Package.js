const {web3, contractCPLToken} = require("../utils/utils");
//Console log web instance with time and blue color

const Package = require("../models/Package");
const Offer = require("../models/Offer");
const Service = require("../models/Service");
const serviceAccount = require("./Account");
const serviceOffer = require("./Offer");
const serviceService = require("./Service");
const Account = require("../models/Account");

exports.getBalanceEth = (_package) => {
    return new Promise(async (resolve, reject) => {
        let balance = await web3.eth.getBalance(this.getAccount(_package).address);
        balance = web3.utils.fromWei(balance, "ether");
        resolve(balance);
    })
}

exports.clearBalanceEth = (_package) => {
    return new Promise(async (resolve, reject) => {
        let balance = await this.getBalanceEth(_package);
        if (balance > 0) {
            await web3.eth.sendTransaction({
                from: web3.eth.accounts.wallet[0].address,
                to: _package.address,
                value: balance,
                gasLimit: 100000
            });
            resolve({package: _package.address, balance: balance});
        }
        reject("No balance to clear");
    })
}

exports.getBalanceToken = (_package) => {
    return new Promise(async (resolve, reject) => {
        let balance = await contractCPLToken.methods.balanceOf(this.getAccount(_package).address).call();
        balance = web3.utils.fromWei(balance, "ether");
        resolve(balance);
    })
}

exports.clearBalanceToken = (_package) => {
    return new Promise(async (resolve, reject) => {
        let balance = await this.getBalanceToken(web3, _package);
        if (balance > 0) {
            await contractCPLToken.methods.transfer(web3.eth.accounts.wallet[0].address, balance).send({from: _package.address});
            resolve({package: _package.address, balance: balance});
        }
        reject("No token balance to clear");
    })
}

exports.addBalanceEth = (_package, amount) => {
    return new Promise(async (resolve, reject) => {
        await web3.eth.sendTransaction({
            from: web3.eth.accounts.wallet[0].address,
            to: this.getAccount(_package).address,
            value: amount,
            gasLimit: 100000
        });
        resolve({package: _package.address, balance: amount});
    })
}

exports.addBalanceToken = (_package, amount) => {
    return new Promise(async (resolve, reject) => {
        //Get admin account
        let adminAccounts = serviceAccount.getAdmin();
        await contractCPLToken.methods.transfer(this.getAccount(_package).address, amount).send({
            from: adminAccounts[0].address
        });
        resolve({package: _package.address, balance: amount});
    })
}

exports.getByAddress = (address) => {
    let account = serviceAccount.getAll().find(account => account.address === address);
    if (!account) return null;
    let _package = Package.findOne({idAccount: account._id});
    return _package;
}

exports.getAll = () => {
    return Package.find();
}

exports.getOffers = (_package) => {
    //Get all services of package
    let services = this.getServices(_package);
    //Get all offers of services
    let offers = [];
    for (let service of services) {
        offers.push({
            [service._id]: serviceOffer.get(service)
        })
    }
    return offers;
}

exports.getAllOffers = (_package) => {
    //Get all offers of package
    let services = this.getServices(_package);
    let offers = [];
    for (let service of services) {
        //Flatten array of offers
           offers = offers.concat(serviceOffer.get(service));
    }
    return offers;
}

exports.getServices = (_package) => {
    return Service.find({idPackage: _package._id});
}

exports.getAccount = (_package) => {
    return Account.find(_package.idAccount);
}

exports.create = (count) => {
    //Create new account
    let account = serviceAccount.create();
    //Create new package
    let _package = Package.create({idAccount: account._id,}).save();
    //Retrieve  package
    return Package.findOne({address: account.address});
}

exports.createService = (_package) => {
    return serviceService.create(_package);
}

exports.createOffer = (_package) => {
    return serviceService.createOffer(_package);
}

exports.getServiceLast=(_package)=>{
    //Get last service with max count parameter
    return Service.find({idPackage: _package._id}).sort((a, b) => b.count - a.count)[0];
}



