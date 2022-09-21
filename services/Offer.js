const Offer = require("../models/Offer");
const config = require("../config.json");
const serviceManufacturer = require("./Manufacturer");
const axios = require("axios");
const serviceService = require("./Service");
const Service = require("../models/Service");
const Package = require("../models/Package");

let calculatePrice = (service) => {
    let offer = Offer.find({id_service: service._id});
    //Generate random number between min and max
    let price = randomNumber(config.packages.offer.price_start_interval[0], config.packages.offer.price_start_interval[1])
    for (let i = offer.length - 1; i >= 0; i--) {
        if (offer[i].state === "EXPIRED") {
            price += randomNumber(config.packages.offer.price_increase_interval[0], config.packages.offer.price_increase_interval[1]);
        } else if (offer[i].state === "SUCCESSFUL") {
            break;
        }
    }
    return price;
}

let randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let createOffer = (service) => {
    return Offer.create({
        id_service: service._id,
        id_package: service.id_package,
        price: calculatePrice(service),
        endDate: new Date() + config.packages.offer.expiry_duration * 1000,
    }).save();
}

let assignOffer = async (web3, offer) => {
    //Get service
    let service = Service.find({_id: offer.id_service})[0];
    //Gather all manufacturers
    let manufacturers = await serviceManufacturer.fetchManufacturers(web3);
    //Remove manufacturers from array that already rejected an offer or offer expired
    let offers = Offer.find({id_service: service._id, state: {$in: ["REJECTED", "EXPIRED"]}});
    for (let i = 0; i < offers.length; i++) {
        for (let j = 0; j < manufacturers.length; j++) {
            if (offers[i].manufacturer_address === manufacturers[j].address) {
                manufacturers.splice(j, 1);
                break;
            }
        }
    }
    //Select one manufacturer randomly
    offer.manufacturer_address = manufacturers[Math.floor(Math.random() * manufacturers.length)].address;
    offer.state="ASSIGNED";
    offer.save();
    return offer;
}

let sendOffer = (web3, offer) => {
    return new Promise(async (resolve, reject) => {
        //Get manufacturer url
        let url = await serviceManufacturer.getUrl(web3, offer.manufacturer_address);
        //Get package address from offer
        let _package = Package.find({_id: offer.id_package})[0];
        //Send offer to manufacturer
        axios.get('url', {
            params: {
                address: _package.address,
                price: offer.price,
                endDate: offer.endDate
            }
        }).then((response) => {
            //Set offer state to send
            offer.state = "SEND";
            offer.save();
            resolve(offer);
        }).catch((error) => {
            offer.state = "REJECTED";
            offer.save();
            resolve(offer);
        });
    })
}

let manageOffersNew = (web3, service) => {
    return new Promise(async (resolve, reject) => {
        //If offer is accepted or offer is in send state don't create new offers
        if (Offer.find({id_service: service._id, state: {$in: ["SEND", "ACCEPTED"]}}).length <= 0) {
            //Create new offer
            let offer = createOffer(service);
            resolve({msg: "New offer created", offer: offer});
        }
        resolve({msg: "Offer not accepted or still waiting for response"});
    })


}

let manageOffersAssign = (web3, service) => {
    return new Promise(async (resolve, reject) => {
        let msg = [];
        let offers = Offer.find({id_service: service._id, state: "CREATED"});
        for (let offer of offers) {
            await assignOffer(web3, offer);
            msg.push([{msg: "Offer assigned", offer: offer}]);
            resolve(msg);
        }
        resolve({msg: "No offers to assign"});
    })


}

let manageOffersSend = (web3, service) => {
    return new Promise(async (resolve, reject) => {
        let msg = [];
        //Check if service has active offer
        if (getOffersActive(service).length <= 0) {
            //Create new offer
            let offer = createOffer(service);
            msg.push([{msg: "New offer created", offer: offer}]);
        }
        //Get all offers of service
        let offers = getOffers(service);
        for (let offer of offers) {
            switch (offer.state) {
                case "CREATED": {
                    //Assign offer to manufacturer
                    await assignOffer(web3, offer);
                    msg.push([{msg: "Offer assigned", offer: offer}]);
                    //Send offer to manufacturer
                    await sendOffer(web3, offer);
                    msg.push([{msg: "Offer send", offer: offer}]);
                }
                    break;
                case "SEND": {
                    //Check if offer expired
                    if (offer.endDate * 1000 < new Date()) {
                        offer.state = "EXPIRED";
                        offer.save();
                        msg.push([{msg: "Offer expired", offer: offer}]);
                    }
                }
                    break;
                case "REJECTED": {
                    msg.push([{msg: "Offer rejected", offer: offer}]);
                    //Create new offer
                    let of = createOffer(service);
                    msg.push([{msg: "New offer created", offer: of}]);
                    //Assign offer to manufacturer
                    await assignOffer(web3, offer);
                    msg.push([{msg: "Offer assigned", offer: of}]);
                    //Send offer to manufacturer
                    await sendOffer(web3, offer);
                    msg.push([{msg: "Offer send", offer: of}]);
                }
                    break;
                case "EXPIRED": {
                    msg.push([{msg: "Offer expired", offer: offer}]);
                    //Create new offer
                    let of = createOffer(service);
                    msg.push([{msg: "New offer created", offer: of}]);
                    //Assign offer to manufacturer
                    await assignOffer(web3, offer);
                    msg.push([{msg: "Offer assigned", offer: of}]);
                    //Send offer to manufacturer
                    await sendOffer(web3, offer);
                    msg.push([{msg: "Offer send", offer: of}]);

                }
                    break;
                case "ACCEPTED": {
                    msg.push([{msg: "Offer accepted", offer: offer}]);

                }
                    break;
            }
        }
        resolve(msg);
    })


}


let getOffer = (service) => {
    return Offer.find({id_service: service._id})[0];
}

let getOffers = (service) => {
    return Offer.find({id_service: service._id});
}

//Find offers created offers
let getOffersCreated = (service) => {
    return Offer.find({id_service: service._id, state: "CREATED"});
}

let getOffersActive = (service) => {
    return Offer.find({id_service: service._id, state: {$in: ["SEND", "CREATED"]}});

}

module.exports.createOffer = createOffer;
module.exports.assignOffer = assignOffer;
module.exports.sendOffer = sendOffer;
module.exports.manageOffersNew = manageOffersNew;
module.exports.manageOffersAssign = manageOffersAssign;
module.exports.manageOffersSend = manageOffersSend;
module.exports.getOffersActive = getOffersActive;
module.exports.getOffersCreated = getOffersCreated;
module.exports.getOffers = getOffers;
module.exports.getOffer = getOffer;
