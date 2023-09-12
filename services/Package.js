const {web3, contractCPLToken} = require("../utils/utils");
//Console log web instance with time and blue color
const secret = require("../secret.json");

const Package = require("../models/Package");
const Offer = require("../models/Offer");
const Service = require("../models/Service");
const serviceAccount = require("./Account");
const serviceOffer = require("./Offer");
const serviceService = require("./Service");
const Account = require("../models/Account");


exports.get = () => {
    return Package.findOne();
}

exports.create = (account) => {
    let _package = Package.create({idAccount: account._id,}).save();
    //Retrieve  package
    return Package.findOne({address: account.address});
}

//Load package from database
exports.loadPackage = () => {
    //Get account web3
    let account = web3.eth.accounts.privateKeyToAccount(secret.privateKey);
    //Check if account address is already in database
    let _account = Account.findOne({address: account.address});
    if (!_account) {
        //Create new account
        _account = serviceAccount.create();
    }
    //Get package
    let _package = Package.findOne();
    if (!_package) {
        //Create new package
        this.create(_account);
    }
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

exports.createService = (_package) => {
    return serviceService.create(_package);
}

exports.createOffer = () => {
    return serviceService.createOffer(this.get());
}

exports.sendOffer = () => {
    return new Promise(async (resolve, reject) => {
        //Find last service
        let service = Service.find().sort((a, b) => b.count - a.count)[0];
        //Check if service is not in state CREATED or MARKET return null
        if (service.state !== "CREATED" && service.state !== "MARKET") return resolve("No service in state CREATED or MARKET");
        serviceService.sendOffer(service)
            .then((offer) => {
                resolve(offer);
            })
            .catch(e => {
                reject(e);
            })
    })
}

exports.getServiceLast = (_package) => {
    //Get last service with max count parameter
    return Service.find({idPackage: _package._id}).sort((a, b) => b.count - a.count)[0];
}

exports.getLocation


