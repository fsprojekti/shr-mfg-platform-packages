const Offer = require("../models/Offer");
const config = require("../config.json");
const axios = require("axios");
const emitter = require('../utils/events').eventEmitter;

exports.calculatePrice = (offer) => {
    if (offer === null) return randomNumber(config.package.offer.priceStartInterval[0], config.package.offer.priceStartInterval[1]);
    //If previous offer was expired return increased price
    if (offer.state === "EXPIRED") return offer.price + randomNumber(config.package.offer.priceChangeInterval[0], config.package.offer.priceChangeInterval[1]);
    //If previous offer was accepted return decreased price but not less than 1
    if (offer.state === "ACCEPTED") return Math.max(offer.price - randomNumber(config.package.offer.priceChangeInterval[0], config.package.offer.priceChangeInterval[1]), 1);
    return offer.price;
}

let randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.createOffer = (service) => {
    // Get all offers for the service, sorted by count in descending order.
    let offers = Offer.find({idService: service._id}).sort((a, b) => b.count - a.count);
    //Update expired offers
    for (let offer of offers) {
        this.updateExpired(offer);
    }

    let t = Math.floor(new Date() / 1000) + config.package.offer.expiryDuration;
    // If there are no offers for the service, create a new offer with a price of 0.
    if (offers.length === 0) {
        let offer = Offer.create({
            idService: service._id,
            price: this.calculatePrice(null),
            expiryDate: t
        }).save();
        //Create timout for offer expiration
        setTimeout(() => {
            offer.state = "EXPIRED";
            offer.save();
            emitter.emit('offerExpired', offer);
        }, config.package.offer.expiryDuration * 1000);
        return offer;
    }

    // If the first offer is expired or accepted, create a new offer with the same price.
    if (offers[0].state === "EXPIRED" || offers[0].state === "ACCEPTED") {
        let offer = Offer.create({
            idService: service._id,
            price: this.calculatePrice(offers[0]),
            expiryDate: t,
            count: offers[0].count + 1,
        }).save();
        setTimeout(() => {
            offer.state = "EXPIRED";
            offer.save();
            emitter.emit('offerExpired', offer);
        }, config.package.offer.expiryDuration * 1000);
        return offer;
    }
    return null;
}

exports.get = (service) => {
    //Update expired offers
    let offers = Offer.find({idService: service._id});
    for (let offer of offers) {
        this.updateExpired(offer);
    }
    return offers;
}

exports.getAll = () => {
    return Offer.find();
}

exports.HttpSendOffer = (offer) => {
    return new Promise(async (resolve, reject) => {
        try {
            let index = this.clcWarehouse();
            let url = config.warehouses[index].url + "/offer/new";
            let data = {
                offer: {
                    id: offer._id,
                    price: offer.price,
                    expiryDate: offer.expiryDate,
                }
            }
            //Form GET request with data as query parameter
            let response = await axios.get(url, {params: data});

            //Update offer state and manufacturer index
            offer.state = "SEND";
            offer.manufacturer = index;
            offer.save();

            resolve(response.data);
        } catch (e) {
            reject(e);
        }
    })
}

exports.clcWarehouse = (offer) => {
    //Select random number from 0 to number of warehouses
    return randomNumber(0, config.warehouses.length - 1);

}

// let updateOfferPool = (web3, offer) => {
//     return new Promise(async (resolve, reject) => {
//         let manufacturersPool = new web3.eth.Contract(abiManufacturersPool, config.manufacturerPoolAddress);
//         try {
//             let offerWeb3 = await manufacturersPool.methods.getOffer(offer._id).call();
//             //Check if offer is expired
//             if (parseInt(offerWeb3.endDate) < Math.floor(new Date() / 1000)) {
//                 offer.state = "EXPIRED";
//             }
//             switch (parseInt(offerWeb3.state)) {
//                 //Accepted by the manufacturer
//                 case 1: {
//                     offer.state = "ACCEPTED";
//                     offer.manufacturer_address= offerWeb3.manufacturer;
//                 }
//                     break;
//                 case 2: {
//                     offer.state = "REMOVED";
//                 }
//             }
//             offer.save();
//             resolve();
//         }catch (e) {
//             resolve();
//         }
//     })
// }
//
// //Return true if offer was accepted
// let manageOffers = (web3, service) => {
//     return new Promise(async (resolve, reject) => {
//         let msg=[];
//         let offers = getOffers(service);
//         //If service has no offers create new one
//         if (offers.length === 0) {
//             let of = createOffer(service);
//             console.log("Created offer:", of);
//             msg.push({
//                 offer: of,
//                 msg: "Created new offer",
//             });
//             offers = getOffers(service);
//         }
//         for (let offer of offers) {
//             msg.push(await updateOfferPool(web3, offer));
//             switch (offer.state) {
//                 case "CREATED": {
//                     await publishOffer(web3, offer);
//                     console.log("Offer published: ", offer);
//                     msg.push({
//                         offer: offer,
//                         msg: "Offer published",
//                     })
//                 }
//                     break;
//                 case "PUBLISHED": {
//
//                 }
//                     break;
//                 case "ACCEPTED": {
//                     //Change service state to ACCEPTED
//                     service.state = "ACCEPTED";
//                     service.save();
//                     console.log("Offer accepted: ", offer);
//                     msg.push({
//                         offer: offer,
//                         msg: "Offer accepted",
//                     })
//                 }
//                     break;
//                 case "EXPIRED": {
//                     //Create new offer
//                     let of = await createOffer(service);
//                     console.log("Offer expired - created new: ", of);
//                     msg.push({
//                         offer: of,
//                         msg: "Offer expired - created new",
//                     })
//                 }
//                     break;
//             }
//         }
//         resolve(msg);
//     })
// }
//
// let getOffers = (service) => {
//     return Offer.find({id_service: service._id});
// }

exports.updateExpired = (offer) => {
    if (offer.state === "EXPIRED") return;
    if (offer.state === "ACCEPTED") return;
    //Check with current timestamp
    if (offer.expiryDate < Math.floor(new Date() / 1000)) {
        offer.state = "EXPIRED";
        offer.save();
    }

}