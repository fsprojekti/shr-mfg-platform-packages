const Offer = require("../models/Offer");
const config = require("../config.json");
const axios = require("axios");
const serviceService = require("./Service");
const Service = require("../models/Service");
const Package = require("../models/Package");
const abiManufacturersPool = require("../contracts/abiManufacturersPool.json");

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
    }).save();
}

let publishOffer = (web3, offer) => {
    return new Promise(async (resolve, reject) => {
        //Get current block timestamp
        let block = await web3.eth.getBlock("latest");
        let _package = Package.find({_id: offer.id_package})[0];
        //Create manufacturersPool contract object
        let manufacturersPool = new web3.eth.Contract(abiManufacturersPool, config.manufacturerPoolAddress);
        //add offer to manufacturersPool
        let price = offer.price;
        let endDate = block.timestamp+config.packages.offer.expiry_duration;
        await manufacturersPool.methods.addOffer(offer._id, price, endDate).send({
            from: _package.address,
            gasLimit:1000000
        })
        offer.endDate= endDate;
        offer.state = "PUBLISHED";
        offer.save();
        resolve();
    })
}

let updateOfferPool = (web3, offer) => {
    return new Promise(async (resolve, reject) => {
        let msg = [];
        let manufacturersPool = new web3.eth.Contract(abiManufacturersPool, config.manufacturerPoolAddress);
        try {
            let offerWeb3 = await manufacturersPool.methods.getOffer(offer._id).call();
            //Check if offer is expired
            if (offerWeb3.endDate < new Date() / 1000) {
                offer.state = "EXPIRED";
                msg.push({
                    offer: offer,
                    msg: "Offer expired",
                })
            }
            switch (offerWeb3.state) {
                //Accepted by the manufacturer
                case 1: {
                    offer.state = "ACCEPTED";
                    msg.push({
                        offer: offer,
                        msg: "Offer accepted",
                    })
                }
                    break;
                case 2: {
                    offer.state = "REMOVED";
                    msg.push({
                        offer: offer,
                        msg: "Offer removed",
                    })
                }
            }
            offer.save();
            resolve(msg);
        }catch (e) {
            resolve(msg);
        }
    })
}

//Return true if offer was accepted
let manageOffers = (web3, service) => {
    return new Promise(async (resolve, reject) => {
        let msg=[];
        let offers = getOffers(service);
        //If service has no offers create new one
        if (offers.length === 0) {
            let of = createOffer(service);
            console.log("Created offer:", of);
            msg.push({
                offer: of,
                msg: "Created new offer",
            });
            offers = getOffers(service);
        }
        for (let offer of offers) {
            msg.push(await updateOfferPool(web3, offer));
            switch (offer.state) {
                case "CREATED": {
                    await publishOffer(web3, offer);
                    console.log("Offer published: ", offer);
                    msg.push({
                        offer: offer,
                        msg: "Offer published",
                    })
                }
                    break;
                case "PUBLISHED": {

                }
                    break;
                case "ACCEPTED": {
                    //Change service state to ACCEPTED
                    service.state = "ACCEPTED";
                    service.save();
                    console.log("Offer accepted: ", offer);
                    msg.push({
                        offer: offer,
                        msg: "Offer accepted",
                    })
                }
                    break;
                case "EXPIRED": {
                    //Create new offer
                    let of = await createOffer(service);
                    console.log("Offer expired - created new: ", of);
                    msg.push({
                        offer: of,
                        msg: "Offer expired - created new",
                    })
                }
                    break;
            }
        }
        resolve(msg);
    })
}

let getOffers = (service) => {
    return Offer.find({id_service: service._id});
}

module.exports.createOffer = createOffer;
module.exports.getOffers = getOffers;
module.exports.manageOffers = manageOffers;
