const servicePackage = require("../../services/Package");
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
    let _package = servicePackage.get();
    //Check if package exists
    if (!_package) return res.status(404).json({message: "Package not found"});
    //Return package
    res.status(200).json(_package);
}