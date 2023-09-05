const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

const Offer = Schema("Offers", {
    idService: {type: String, required: true},
    idPackage: {type: String, required: true},
    addressBuyer: {type: String, default: ""},
    price: {type: Number, required: true},
    expiryDate: {type: Number},
    //states ["CREATED", "SEND", "EXPIRED", "ACCEPTED"]
    state: {type: String, default: "CREATED"},

})

module.exports = Offer;


