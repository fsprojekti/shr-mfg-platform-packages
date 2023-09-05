const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

const Account = Schema("Accounts", {
    //Types ["ADMIN","USER"]
    type: {type: String, required: true},
    address: {type: String, required: true},
    privateKey: {type: String, required: true}
})

module.exports = Account;