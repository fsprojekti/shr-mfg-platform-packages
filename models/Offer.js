const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

const Offer = Schema("Offers", {
    id_service: {type: String, required: true},
    id_package: {type: String, required: true},
    price: {type: Number, required: true},
    endDate: {type: Number},
    //states ["CREATED", "PUBLISHED", "EXPIRED", "ACCEPTED"]
    state: {type: String, default: "CREATED"},
    manufacturer_address: {type: String, default: ""},
})

module.exports = Offer;


