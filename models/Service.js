const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

const Service = Schema("Services", {
    //States ["CREATED", "MARKET", "DEAL","TRANSPORT_IN","ACTIVE","TRANSPORT_OUT,"DONE"]
    state: {type: String, default: "CREATED"},
    //Service start timestamp
    serviceStart: {type: Number},
    //Service end timestamp
    serviceEnd: {type: Number},
    //Service number for this package
    count: {type: Number, default: 0},
})

module.exports = Service;
