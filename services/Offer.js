const Offer = require("../models/Offer");

serviceService = require("./Service");

const config = require("../config.json");
const axios = require("axios");
const utils = require("../utils/utils");
const {contractCapacityRegistry} = require("../utils/utils");
const serviceAccount = require("./Account");
const emitter = require('../utils/events').eventEmitter;

exports.get = (query) => {
    //Update expired offers
    return Offer.find(query);
}

exports.create = (service) => {
    // Get all offers for the service, sorted by count in descending order.
    let offers = Offer.find({idService: service._id}).sort((a, b) => b.count - a.count);
    //Update expired offers
    for (let offer of offers) {
        this.update(offer);
    }

    let price = 1;
    if (offers.length === 0) {
        price = calculatePrice(null);
    } else {
        price = calculatePrice(offers[0]);
    }
    return Offer.create({
        idService: service._id,
        price: price
    }).save();
}

exports.HttpSend = (offer) => {
    return new Promise(async (resolve, reject) => {
        try {
            let capacityProvider = await getCapacityProvider();
            //Send offer over http GET to capacity provider but first build query data of offer
            offer.expiryDate = Math.floor(new Date() / 1000) + config.offer.expiryDuration;
            offer.addressRecipient = capacityProvider.address;
            offer.save();

            let data = {
                offer: {
                    id: offer._id,
                    price: offer.price,
                    expiryDate: offer.expiryDate,
                    addressRecipient: offer.addressRecipient,
                    addressSender: serviceAccount.get().address
                }
            }

            let response = await axios.get(capacityProvider.url + "/offer/new", {
                params: data
            });

            //Check if response is OK
            if (response.status !== 200) return reject("Error sending offer");
            //Update service state
            let service = serviceService.getLast();
            service.state = "MARKET";
            service.save();
            //Update offer state
            offer = Offer.findOne({_id: offer._id});
            offer.state = "SEND";
            offer.save();
            // Create timout for offer expiration
            setTimeout(() => {
                eventOfferExpired(offer);
            }, config.offer.expiryDuration * 1000);
            resolve(offer);
        } catch (e) {
            reject(e);
        }
    })
}

exports.accept = (offer) => {
    //Find service
    let service = serviceService.get({_id: offer.idService})[0];
    //Check if service is in state MARKET
    if (service.state !== "MARKET") return false;
    //Set service state to DEAL
    service.state = "DEAL";
    service.save();
    //Set offer state to ACCEPTED
    offer.state = "ACCEPTED";
    offer.save();
    //Emit event offerAccepted
    emitter.emit('offerAccepted', offer);
    return offer;
}

exports.reject = (offer) => {
    //Set offer state to ACCEPTED
    offer.state = "REJECTED";
    offer.save();
    //Emit event offerAccepted
    emitter.emit('offerRejected', offer);
    return offer;
}

let getCapacityProvider = () => {
    return new Promise(async (resolve, reject) => {
        let capacitySellers = [];
        let capacitySellerAddresses = await contractCapacityRegistry.methods.getProvidersAddresses().call();

        // Fetch all URLs concurrently using Promise.all()
        let urls = await Promise.all(capacitySellerAddresses.map(async (address) => {
            return {
                address: address,
                url: await contractCapacityRegistry.methods.getProviderUrl(address).call()
            };
        }));

        // Filter out addresses with empty URLs
        for (let entry of urls) {
            if (entry.url !== "") {
                capacitySellers.push({address: entry.address, url: entry.url});
            }
        }

        // Choose random capacity seller
        let index = randomNumber(0, capacitySellers.length - 1);
        resolve(capacitySellers[index]);
    })

}

let randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Subscribe to events

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

let calculatePrice = (offer) => {
    if (offer === null) return randomNumber(config.offer.priceStartInterval[0], config.offer.priceStartInterval[1]);
    //If previous offer was expired return increased price
    if (offer.state === "EXPIRED") return offer.price + randomNumber(config.offer.priceChangeInterval[0], config.offer.priceChangeInterval[1]);
    //If previous offer was accepted return decreased price but not less than 1
    if (offer.state === "ACCEPTED") return Math.max(offer.price - randomNumber(config.offer.priceChangeInterval[0], config.offer.priceChangeInterval[1]), 1);
    //If previous offer was rejected return increased price
    if (offer.state === "REJECTED") return offer.price + randomNumber(config.offer.priceChangeInterval[0], config.offer.priceChangeInterval[1]);
    return offer.price;
}

exports.update = (offer) => {
    if (offer.state === "SEND") {
        //Check with current timestamp
        if (offer.expiryDate < Math.floor(new Date() / 1000)) {
            offer.state = "EXPIRED";
            offer.save();
        }
    }
}

let eventOfferExpired = (offer) => {
    this.update(offer);
    emitter.emit('offerExpired', offer);
}