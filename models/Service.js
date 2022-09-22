const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

const Service = Schema("Services", {
    id_package: {type: String, required: true},
    //States ["CREATED", "POOL", "TRANS_OUT", "MANUFACTURING", "TRANS_BACK", "DONE"]
    state: {type: String, default: "CREATED"},
})

module.exports = Service;
