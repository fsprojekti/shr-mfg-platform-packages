const servicePackage = require("../../services/Package");
const serviceService = require("../../services/Service");
const serviceOffer = require("./../../services/Offer");

exports.create = (req, res, next) => {
    //Check for parameter count if not set to 1
    let count = req.query.count || 1;
    //Loop count times
    for (let i = 0; i < count; i++) {
        //Create a new package
        let _package = servicePackage.create();
    }

    res.status(200).json(servicePackage.getAll());
}

exports.get = (req, res, next) => {
    //If address parameter not empty parse array of syntax ([address1, address2, ...])
    if (req.query.addresses) req.query.addresses = JSON.parse(req.query.addresses);
    //Check for address parameter if not return all packages
    if (!req.query.address) return res.status(200).json(servicePackage.getAll());
    //Get package by address
    let _package = servicePackage.get(req.query.address);
    //Check if package exists
    if (!_package) return res.status(404).json({message: "Package not found"});
    //Return package
    res.status(200).json(_package);
}

exports.getBalanceEth = async (req, res, next) => {
    try {
        //If address parameter not empty parse array of syntax ([address1, address2, ...])
        if (req.query.addresses) req.query.addresses = JSON.parse(req.query.addresses);
        //Check for addresses parameter if array empty or not set variable addresses to all packages
        let addresses = req.query.addresses || servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
        //Check if addresses empty array set to all packages
        if (addresses.length === 0) addresses = servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
        //Check balance for each address
        let balances = [];
        for (let address of addresses) {
            //Get package from db by address
            let _package = await servicePackage.getByAddress(address);
            //Check if package exists
            if (!_package) return res.status(404).json({message: "Package with address " + address + " not found"});
            let balance = await servicePackage.getBalanceEth(_package);
            balances.push({[address]: balance});
        }
        //Return balances
        res.status(200).json(balances);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.getBalanceToken = async (req, res, next) => {
    try {
        //If address parameter not empty parse array of syntax ([address1, address2, ...])
        if (req.query.addresses) req.query.addresses = JSON.parse(req.query.addresses);
        //Check for addresses parameter if array empty or not set variable addresses to all packages
        let addresses = req.query.addresses || servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
        //Check if addresses empty array set to all packages
        if (addresses.length === 0) addresses = servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
        //Check balance for each address
        let balances = [];
        for (let address of addresses) {
            //Get package from db by address
            let _package = await servicePackage.getByAddress(address);
            //Check if package exists
            if (!_package) return res.status(404).json("Package with address " + address + " not found");
            let balance = await servicePackage.getBalanceToken(_package);
            balances.push({[address]: balance});
        }
        //Return balances
        res.status(200).json(balances);
    } catch (e) {
        res.status(400).json(e);
    }

}

exports.getService = async (req, res, next) => {
    //If address parameter not empty parse array of syntax ([address1, address2, ...])
    if (req.query.addresses) req.query.addresses = JSON.parse(req.query.addresses);
    //Check for address array parameter if not set to all packages
    let addresses = req.query.addresses || servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
    //Check if addresses empty array set to all packages
    if (addresses.length === 0) addresses = servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
    //If state parameter not empty parse array of syntax ([state1, state2, ...])
    if (req.query.states) req.query.states = JSON.parse(req.query.states);
    //Check for state array parameter if not set to all states
    let states = req.query.states || ["CREATED", "MARKET", "DEAL", "TRANSPORT", "ACTIVE", "DONE"];
    //Check if states empty array set to all states
    if (states.length === 0) states = ["CREATED", "MARKET", "DEAL", "TRANSPORT", "ACTIVE", "DONE"];

    //Get services from packages with account with addresses and filter services that are not in requested states
    let services = [];
    for (let address of addresses) {
        let _package = servicePackage.getByAddress(address);
        let _services = await servicePackage.getServices(_package);
        _services = _services.filter(service => states.includes(service.state));
        services.push({[address]: _services});
    }
    res.status(200).json(services);


}

exports.createService = async (req, res, next) => {
    try {
        //If address parameter not empty parse array of syntax ([address1, address2, ...])
        if (req.query.addresses) req.query.addresses = JSON.parse(req.query.addresses);
        //Check for address array parameter if not set to all packages
        let addresses = req.query.addresses || servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
        //Check if addresses empty array set to all packages
        if (addresses.length === 0) addresses = servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
        let services = [];
        for (let address of addresses) {
            services.push({
                [address]: servicePackage.createService(servicePackage.getByAddress(address))
            })
        }
        res.status(200).json(services);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.createOffer = async (req, res, next) => {
    try {
        //If address parameter not empty parse array of syntax ([address1, address2, ...])
        if (req.query.addresses) req.query.addresses = JSON.parse(req.query.addresses);
        //Check for address array parameter if not set to all packages
        let addresses = req.query.addresses || servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
        //Check if addresses empty array set to all packages
        if (addresses.length === 0) addresses = servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
        let offers = [];
        for (let address of addresses) {
            offers.push({
                [address]: serviceService.createOffer(servicePackage.getServiceLast(servicePackage.getByAddress(address)))
            })
        }
        res.status(200).json(offers);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.getOffer = async (req, res, next) => {
    //If address parameter not empty parse array of syntax ([address1, address2, ...])
    if (req.query.addresses) req.query.addresses = JSON.parse(req.query.addresses);
    //Check for address array parameter if not set to all packages
    let addresses = req.query.addresses || servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
    //Check if addresses empty array set to all packages
    if (addresses.length === 0) addresses = servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
    //If state parameter not empty parse array of syntax ([state1, state2, ...])
    if (req.query.states) req.query.states = JSON.parse(req.query.states);
    //Check for state array parameter if not set to all states
    let states = req.query.states || ["CREATED", "PUBLISHED", "ACCEPTED", "REMOVED", "EXPIRED"];
    //Check if states empty array set to all states
    if (states.length === 0) states = ["CREATED", "PUBLISHED", "ACCEPTED", "REMOVED", "EXPIRED"];

    //Get offers from packages with account with addresses and filter offers that are not in requested states
    let offers = [];
    for (let address of addresses) {
        let _package = servicePackage.getByAddress(address);
        let _offers = servicePackage.getOffers(_package);
        offers.push({[address]: _offers});
    }
    res.status(200).json(offers);
}

exports.sendOffer = async (req, res, next) => {
    try {
        //If address parameter not empty parse array of syntax ([address1, address2, ...])
        if (req.query.addresses) req.query.addresses = JSON.parse(req.query.addresses);
        //Check for address array parameter if not set to all packages
        let addresses = req.query.addresses || servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);
        //Check if addresses empty array set to all packages
        if (addresses.length === 0) addresses = servicePackage.getAll().map(_package => servicePackage.getAccount(_package).address);

        for (let address of addresses) {
            let _package = servicePackage.getByAddress(address);
            let offers = servicePackage.getAllOffers(_package);
            //Send only offers that are in state CREATED
            offers = offers.filter(offer => offer.state === "CREATED");
            for (let offer of offers) {
                await serviceOffer.HttpSendOffer(offer);
            }
        }
        res.status(200).json(serviceOffer.getAll());
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.respondOffer = async (req, res, next) => {
    //Parse offer parameter from query
}