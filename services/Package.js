const config = require("../config.json");
const abiDAI = require("../contracts/abiDAI.json");
const Offer = require("../models/Offer");
const serviceManufacturer = require("./Manufacturer");
const axios = require("axios");
const Service = require("../models/Service");
const serviceService = require("../services/Service");

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

let calculatePrice = (_package) => {
    let offer = Offer.find({id_package: _package._id});
    let price = _package.price_start;
    for (let i = offer.length - 1; i >= 0; i--) {
        if (offer[i].state === "EXPIRED") {
            price += _package.price_increase;
        } else if (offer[i].state === "SUCCESSFUL") {
            break;
        }
    }
    return price;
}

let newOffer = (_package, serviceId) => {
    let offer = Offer.create({
        id_service: serviceId,
        id_package: _package._id,
        price: calculatePrice(_package),
        endDate: new Date() + _package.demand_max_duration * 1000
    });
    offer.save();
    return offer;
}

let assignOffer = async (_package, web3, offer) => {
    //Gather all manufacturers
    let manufacturers = await serviceManufacturer.fetchManufacturers(web3);
    //Remove manufacturers from array that already rejected an offer or offer expired
    let offers = Offer.find({id_package: _package._id, state: {$in: ["REJECTED", "EXPIRED"]}});
    for (let i = 0; i < offers.length; i++) {
        for (let j = 0; j < manufacturers.length; j++) {
            if (offers[i].manufacturer_address === manufacturers[j].address) {
                manufacturers.splice(j, 1);
                break;
            }
        }
    }
    //Select one manufacturer randomly
    offer.manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    offer.save();
    return offer;
}

let sendOffer = (_package, web3, offer) => {
    return new Promise(async (resolve, reject) => {
        //Get manufacturer url
        let url = await serviceManufacturer.getUrl(web3, offer.manufacturer_address);
        //Send offer to manufacturer
        axios.get('url', {
            params: {
                address: _package.address,
                price: offer.price,
                endDate: offer.endDate
            }
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        });
    })
}

let eventDemandExpired = async (web3, _package, demand) => {
    //Gather all manufacturers
    let manufacturers = await serviceManufacturer.fetchManufacturers(web3);
    //Remove ones that already got a demand


}

let eventDemandAccepted = (_package, demand) => {

}
let newService = (_package) => {
    let service = Service.create({
        id_package: _package._id,
        startDate: new Date()
    });
    service.save();
    return service;
}

let eventStartService = async (web3, _package) => {
    //Check if service is active
    if (isServiceActive(_package)) return;
    //Create new service
    let service = Service.create({
        id_package: _package._id,
        startDate: new Date()
    });
    service.save();
    //Send new offer to manufacturer
    let offer = newOffer(_package, service._id);
    offer = await assignOffer(_package, web3, offer);
    await sendOffer(_package, web3, offer);
}


let isServiceActive = (_package) => {
    let services = Service.find({id_package: _package._id});
    if (services.length > 0) {
        if (serviceService.isActive(services[0])) return true;
    }
    return false;
}

module.exports.getBalance = getBalance;
module.exports.clearBalance = clearBalance;
module.exports.newOffer = newOffer;
module.exports.isServiceActive = isServiceActive;
module.exports.eventStartService = eventStartService;
module.exports.newService = newService;