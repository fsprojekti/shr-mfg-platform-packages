const Offer = require("../models/Offer");
const Service = require("../models/Service");
const Package = require("../models/Package");
const serviceOffer = require("../services/Offer");
const axios = require("axios");
const config = require("../config.json");

const tokenABI = require("../contracts/abiDAI.json");
const tokenAddress = config.tokenContractAddress;


module.exports.create = (_package) => {
    return Service.create({
        id_package: _package._id,
        //Current time in timestamp seconds
        startDate: Math.floor(Date.now() / 1000),
    }).save();
}



// let apiOrderTransportFromWarehouse = (service) => {
//     // send request to transport service using axios get http
//     return new Promise((resolve, reject) => {
//         //Find accepted offer
//         let offer = Offer.find({id_service: service._id, state: "ACCEPTED"})[0];
//         //Find package
//         let _package = Package.find({_id: service.id_package})[0];
//         let target = config.map[offer.manufacturer_address].location;
//         if (target === undefined) target = 4;
//         axios.get(config.car_controller.url + "/request", {
//             params: {
//                 packageId: _package.address,
//                 offerId: offer._id,
//                 source: 5,
//                 target: target
//             }
//         }).then((response) => {
//             resolve(response.data)
//         }).catch(e => {
//             reject(e)
//         })
//     })
// }
//
// let apiOrderTransportToWarehouse = (service) => {
//     // send request to transport service using axios get http
//     return new Promise((resolve, reject) => {
//         //Find accepted offer
//         let offer = Offer.find({id_service: service._id, state: "ACCEPTED"})[0];
//         //Find package
//         let _package = Package.find({_id: service.id_package})[0];
//         let source = config.map[offer.manufacturer_address].location;
//         if (source === undefined) source = 4;
//         axios.get(config.car_controller.url + "/request", {
//             params: {
//                 packageId: _package.address,
//                 offerId: offer._id,
//                 source: source,
//                 target: 5
//             }
//         }).then((response) => {
//             resolve(response.data)
//         }).catch(e => {
//             reject(e)
//         })
//     })
// }

// let manageServices = (web3, _package) => {
//     return new Promise(async (resolve, reject) => {
//         let msg = [];
//         let services = Service.find({id_package: _package._id});
//         //If no services found create new service
//         if (services.length === 0) {
//             let service = await createService(_package);
//             services.push(service);
//             msg.push({
//                 id_service: service._id,
//                 msg: "Service created",
//             })
//         }
//         for (let service of services) {
//             switch (service.state) {
//                 case "CREATED": {
//                     //Move service to pool
//                     service.state = "POOL";
//                     service.save();
//                     msg.push({
//                         id_service: service._id,
//                         msg: "Service moved to pool",
//                     });
//                 }
//                     break;
//                 case "POOL": {
//                     msg.push(await serviceOffer.manageOffers(web3, service));
//                 }
//                     break;
//                 case "ACCEPTED": {
//                     //Request transport
//                     console.log("Service accepted: ", service._id);
//                     try {
//                         let order = await apiOrderTransportFromWarehouse(service);
//                         service.state = "TRANSPORT_OUT";
//                         service.save();
//                         msg.push({
//                             id_service: service._id,
//                             msg: "Service moved to transport out",
//                         })
//                     } catch (e) {
//                         console.log("Error while requesting transport to manufacturer: ", e);
//                         msg.push({
//                             id_service: service._id,
//                             msg: "Error while requesting transport to manufacturer",
//                         })
//                     }
//                 }
//                     break;
//                 case "TRANSPORT_OUT": {
//
//                 }
//                     break;
//                 case "PROCESSING": {
//
//                 }
//                     break;
//                 case  "PROCESSING_FINISHED": {
//                     //Request transport
//                     console.log("Service processing finished: ", service._id);
//                     try {
//                         let order = await apiOrderTransportToWarehouse(service);
//                         service.state = "TRANSPORT_BACK";
//                         service.save();
//                         msg.push({
//                             id_service: service._id,
//                             msg: "Service moved to TRANSPORT_BACK",
//                         })
//                     } catch (e) {
//                         console.log("Error while requesting transport bac to warehouse: ", e);
//                         msg.push({
//                             id_service: service._id,
//                             msg: "Error while requesting transport back to warehouse",
//                         })
//
//                     }
//
//                 }
//                     break;
//                 case "TRANSPORT_BACK": {
//
//                 }
//                     break;
//                 case "BACK": {
//                     //Transfer tokens to manufacturer
//                     let offer = Offer.find({id_service: service._id, state: "ACCEPTED"})[0];
//                     let manufacturer = offer.manufacturer_address;
//                     let tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
//                     let amount = offer.price.toString()
//                     let _package = Package.find({_id: service.id_package})[0];
//                     tokenContract.methods.transfer(manufacturer, amount).send({
//                         from: _package.address,
//                         gasLimit: 1000000,
//                     }).then((receipt) => {
//                         console.log("Transfer tokens to manufacturer: ", receipt);
//                         service.state = "PAID";
//                         service.save();
//                         msg.push({
//                             id_service: service._id,
//                             msg: "Service moved to PAID",
//                         })
//                     }).catch(e => {
//                         console.log("Error while transfer tokens to manufacturer: ", e);
//                         msg.push({
//                             id_service: service._id,
//                             msg: "Error while transfer tokens to manufacturer",
//                         })
//                     })
//                 }
//                     break;
//                 case "PAID": {
//                 }
//                     break;
//             }
//
//         }
//         resolve(msg);
//     })
// }
