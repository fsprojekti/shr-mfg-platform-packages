const Offer = require("../models/Offer");

let getOffer=(service)=>{
    return Offer.find({id_service: service._id})[0];
}

let isActive=(service)=>{
    return service.state==="CREATED" || service.state==="DONE";
}

module.exports.getOffer = getOffer;
module.exports.isActive = isActive;