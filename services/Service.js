const Offer = require("../models/Offer");
const Service = require("../models/Service");



//If service is not fulfilled than return false
let isActive = (service) => {
    return service.state !== "CREATED"
}


let manageServices =(web3, _package) => {
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