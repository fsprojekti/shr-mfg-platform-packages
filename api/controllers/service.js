const servicePackage = require("../../services/Package");
const serviceService = require("../../services/Service");
const serviceOffer = require("./../../services/Offer");


exports.get = async (req, res, next) => {
    try {
        let states = JSON.parse(req.query.states) || ["CREATED", "MARKET", "DEAL", "TRANSPORT", "ACTIVE", "DONE"];
        //Check if states empty array set to all states
        if (states.length === 0) states = ["CREATED", "MARKET", "DEAL", "TRANSPORT", "ACTIVE", "DONE"];

        let services = serviceService.get();
        //Filter services by state
        services = services.filter(service => states.includes(service.state));
        res.status(200).json(services);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.create = async (req, res, next) => {
    try {
        let service = serviceService.create();
        res.status(200).json(service);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.transportIn = async (req, res, next) => {
    try {
        //Get last service
        let service = serviceService.getLast();
        //Reject if service not found
        if (!service) return res.status(400).json("Service not found");
        //Reject if service not in state DEAL
        if (service.state !== "DEAL") return res.status(400).json("Service not in state DEAL");
        service = await serviceService.transportIn(service)

        res.status(200).json(service);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.transportOut = async (req, res, next) => {
    try {
        let service = await serviceService.transportOut();
        res.status(200).json(service);
    } catch (e) {
        res.status(400).json(e);
    }
}