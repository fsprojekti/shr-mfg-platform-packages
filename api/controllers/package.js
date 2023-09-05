const {web3, contractCPLToken, contractCapacityPool} = require("../../utils/utils");

const config = require('../../config.json');
const Package = require("../../models/Package");
const servicePackage = require("../../services/Package");

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
}

exports.getBalanceToken = async (req, res, next) => {
    try{
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
    }catch (e) {
        res.status(400).json(e);
    }

}

exports.createService = async (req, res, next) => {
    //Check for address array parameter if not set to all packages
    let addresses = req.query.addresses || servicePackage.getAll().map(_package => _package.address);
    //Check if addresses empty array set to all packages
    if (addresses.length === 0) addresses = servicePackage.getAll().map(_package => _package.address);

    for (let address of addresses){
        servicePackage.createService(addresse);
    }


}