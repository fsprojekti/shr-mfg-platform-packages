const DbLocal = require("db-local");
const config = require("../config.json");
const { Schema } = new DbLocal({ path: config.db });


const Package=Schema("Packages", {
    address: {type: String, required: true},
    private_key: {type: String, required: true},
    state: {type: String, default: "CREATED"},
})

module.exports = Package;


//     sendDemand() {
//         //Get manufacturers
//         let manufacturers = this.findManufacturers();
//         //Select one manufacturer randomly
//         let manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
//         //Create demand
//         let demand = new Demand(manufacturer, this.calculatePrice(), new Date() + this.demandMaxDuration * 1000);
//         //Create a time event at the end of demand duration
//         setTimeout(() => {
//
//
//         }, demand.demandEndDate);
//
//
//     }
//
//
// }