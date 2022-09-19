const DbLocal = require("db-local");
const config = require("../config.json");
const { Schema } = new DbLocal({ path: config.db });

const Manufacturer = Schema("Manufacturers", {
    address: { type: String, required: true },
})

module.exports = Manufacturer;