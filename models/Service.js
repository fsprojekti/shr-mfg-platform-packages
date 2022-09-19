const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

const Service = Schema("Services", {
    id_package: {type: String, required: true},
    //States ["CREATED", "MARKET", "DEAL", "TRANS_OUT_QUEUED","TRAN_OUT_DRIVING","MANUFACTURING","TRANS_IN_QUEUED","TRANS_IN_DRIVING", "DONE"]
    state: {type: String, default: "CREATED"},
    sourceAddress: String,
    targetAddress: String,
})

module.exports = Service;
