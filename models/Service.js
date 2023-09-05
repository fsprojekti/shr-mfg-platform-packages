const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

const Service = Schema("Services", {
    idPackage: {type: String, required: true},
    //States ["CREATED", "MARKET", "DEAL","TRANSPORT","ACTIVE","DONE"]
    state: {type: String, default: "CREATED"},
    //Service start timestamp
    serviceStart: {type: Number},
    //Service end timestamp
    serviceEnd: {type: Number},
})

module.exports = Service;
