const Offer = require("../models/Offer");
const Service = require("../models/Service");
const serviceOffer = require("../services/Offer");
const axios = require("axios");
const config = require("../config.json");


let createService = (_package) => {
    return Service.create({
        id_package: _package._id,
        //Current time in timestamp seconds
        startDate: Math.floor(Date.now() / 1000),
    }).save();
}
//If service is not fulfilled than return false
let isActive = (service) => {
    return service.state !== "CREATED"
}

let apiOrderTransport = (order) => {
    // send request to transport service using axios get http
    return new Promise((resolve, reject) => {
        axios.get(config.car_controller.url + "/request", {
            params: {
                offerId: order.offerId
            }
        }).then((response) => {
            resolve(response.data)
        })
    })
}

let manageServices = (web3, _package) => {
    return new Promise(async (resolve, reject) => {
        let msg = [];
        let services = Service.find({id_package: _package._id});
        //If no services found create new service
        if (services.length === 0) {
            let service = await createService(_package);
            services.push(service);
            msg.push({
                id_service: service._id,
                msg: "Service created",
            })
        }
        for (let service of services) {
            switch (service.state) {
                case "CREATED": {
                    //Move service to pool
                    service.state = "POOL";
                    service.save();
                    msg.push({
                        id_service: service._id,
                        msg: "Service moved to pool",
                    });
                }
                    break;
                case "POOL": {
                    msg.push(await serviceOffer.manageOffers(web3, service));
                }
                    break;
                case "ACCEPTED": {
                    //Request transport


                }
                    break;
                case "TRANSPORT_OUT": {

                }
                    break;
                case "PROCESSING": {

                }
                    break;
                case "TRANSPORT_BACK": {
                }
                    break;
                case "BACK": {
                }
                    break;
                case "PAID": {
                }
                    break;
            }

        }
        resolve(msg);
    })
}


let getServicesIdle = (_package) => {
    return Service.find({id_package: _package._id, state: "CREATED"});

}

module.exports.isActive = isActive;
module.exports.manageServices = manageServices;