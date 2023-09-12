const serviceOffer = require("./../../services/Offer");
const servicePackage = require("../../services/Package");
const serviceAccount = require("./account");
const serviceService = require("./../../services/Service");

exports.get = async (req, res, next) => {
    try {
        //Check for state array parameter if set parse with JSON if not set to all states
        let states = req.query.states || ["CREATED", "SEND", "ACCEPTED", "REJECTED", "REMOVED", "EXPIRED"];
        //If states parameter not empty parse array of syntax ([state1, state2, ...])
        if (req.query.states) states = JSON.parse(req.query.states);
        //Check if states empty array set to all states
        if (states.length === 0) states = ["CREATED", "SEND", "ACCEPTED", "REJECTED", "REMOVED", "EXPIRED"];

        //Get offers from packages with account with addresses and filter offers that are not in requested states
        let offers = serviceOffer.get();

        //Filter offers by state
        offers = offers.filter(offer => states.includes(offer.state));
        res.status(200).json(offers);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.update = async (req, res, next) => {
    try {
        let offers = serviceOffer.get();
        for (let offer of offers) {
            serviceOffer.update(offer);
        }
        res.status(200).json(offers);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.create = async (req, res, next) => {
    try {
        let offer = servicePackage.createOffer();
        res.status(200).json(offer);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.send = async (req, res, next) => {
    try {
        let offer = await servicePackage.sendOffer();
        res.status(200).json(offer);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.accept = async (req, res, next) => {
    //Parse offer parameter from query
    try {
        //Check if offer parameter is set
        if (!req.query.offer) return res.status(400).json("Parameter offer not set");
        //JSON parse offer parameter
        let params = JSON.parse(req.query.offer);
        //Check if offer id parameter is set
        if (!params.id) return res.status(400).json("Parameter offer id not set");
        //Get offer
        let offer = serviceOffer.get({_id: params.id})[0];
        //Reject if offer not found
        if (!offer) return res.status(400).json("Offer with id: " + params.id + "not found");
        //Find service of offer
        let service = serviceService.get({_id: offer.idService})[0];
        //Reject if service not found
        if (!service) return res.status(400).json("Service of offer with id: " + params.id + "not found");
        //Reject if service not in state MARKET
        if (service.state !== "MARKET") return res.status(400).json("Service of offer with id: " + params.id + "not in state MARKET");
        //Accept offer
        offer = serviceOffer.accept(offer);

        res.status(200).json(offer);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.reject = async (req, res, next) => {
    //Parse offer parameter from query
    try {
        //Check if offer parameter is set
        if (!req.query.offer) return res.status(400).json("Parameter offer not set");
        //JSON parse offer parameter
        let params = JSON.parse(req.query.offer);
        //Check if offer id parameter is set
        if (!params.id) return res.status(400).json("Parameter offer id not set");
        //Get offer
        let offer = serviceOffer.get({_id: params.id})[0];
        //Reject if offer not found
        if (!offer) return res.status(400).json("Offer with id: " + params.id + "not found");
        //Check if offer is in state SEND
        if (offer.state !== "SEND") return res.status(400).json("Offer with id: " + params.id + " not in state SEND");

        //Reject offer
        offer = serviceOffer.reject(offer);

        res.status(200).json(offer);
    } catch (e) {
        res.status(400).json(e);
    }
}