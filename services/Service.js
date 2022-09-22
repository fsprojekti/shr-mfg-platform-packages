const Offer = require("../models/Offer");
const Service = require("../models/Service");
const serviceOffer = require("../services/Offer");


//If service is not fulfilled than return false
let isActive = (service) => {
    return service.state !== "CREATED"
}


let manageServices = (web3, _package) => {
    return new Promise(async (resolve, reject) => {
        let services = Service.find({id_package: _package._id});
        for (let service of services) {
            switch (service.state) {
                case "CREATED": {
                    //Move service to pool
                    service.state = "POOL";
                    service.save();
                }
                    break;
                case "POOL": {
                    let offers = Offer.find({id_service: service._id});
                    //If there is no offer create one
                    if (offers.length > 0) {
                        serviceOffer.createOffer(service);
                    }
                    for (let offer of offers) {
                        switch (offer.state) {
                            case "CREATED": {
                                //Publish offer to pool
                                serviceOffer.publishOffer(web3, offer);
                            }
                                break;
                            case "PUBLISHED": {
                            }
                                break;
                            case "ACCEPTED": {
                            }
                                break;
                            case "EXPIRED": {
                            }

                        }
                    }
                }
                    break;
                case "DEAL": {


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
    })


    //Check for idle services
    let servicesIdle = getServicesIdle(_package);
    if (servicesIdle.length > 0) {
        console.log("Service is already active: ");
        console.log(servicesIdle[0]);
        //eventOfferManagement(web3, _package, servicesIdle[0]);
        return ({msg: "Service is already active", service: servicesIdle[0]});
    } else {
        //Create new service
        let service = newService(_package);
        //Create event for offer management
        console.log("New service created: ");
        console.log(service);
        return ({msg: "New service created", service: service});
    }

}

let newService = (_package) => {
    return Service.create({
        id_package: _package._id,
        startDate: new Date()
    }).save();
}

let getServicesIdle = (_package) => {
    return Service.find({id_package: _package._id, state: "CREATED"});

}

module.exports.isActive = isActive;
module.exports.manageServices = manageServices;