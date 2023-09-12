const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

const Offer = Schema("Offers", {
    idService: {type: String, required: true},
    price: {type: Number, required: true},
    expiryDate: {type: Number},
    //states ["CREATED", "SEND", "EXPIRED", "ACCEPTED", "REJECTED"]
    state: {type: String, default: "CREATED"},
    //Offer number for this package and service
    count: {type: Number, default: 0},
    //address of offer recipient
    addressRecipient: {type: String, default: ""},
})

module.exports = Offer;


