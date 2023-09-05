const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

const Package = Schema("Packages", {
    idAccount: {type: String, required: true},
    //States ["STORED", "TRANSPORTING" ]
    state: {type: String, default: "STORED"},
    //Locations on the demo map
    locations: {
        type: Array, default: [{
            location: 0,
            timestamp: 0
        }]
    },
})

module.exports = Package;