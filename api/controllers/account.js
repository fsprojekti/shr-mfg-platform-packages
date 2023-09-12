const Account = require("../../models/Account");
const serviceAccount = require("../../services/Account");
const servicePackage = require("../../services/Package");
const {web3} = require("../../utils/utils");

exports.getBalanceEth = async (req, res, next) => {
    try {
        //Get account
        let account = serviceAccount.get();
        let balance = await serviceAccount.getBalanceEth(account);
        //Return balance
        res.status(200).json(balance);
    } catch (e) {
        res.status(400).json(e);
    }
}

exports.getBalanceToken = async (req, res, next) => {
    try {
        //Get account
        let account = serviceAccount.get();
        let balance = await serviceAccount.getBalanceToken(account);
        //Return balance
        res.status(200).json(balance);
    } catch (e) {
        res.status(400).json(e);
    }


}

exports.get = (req, res, next) => {
    //Check for address parameter
    if (!req.query.address) return res.status(400).send("Parameter address not set");

    //Check if account exists
    let account = serviceAccount.getAll().filter(account => account.address === req.query.address)

    if (account.length === 0) return res.status(400).send("No account with the given address");

    res.status(200).send(account[0]);
}

exports.getAll = (req, res, next) => {
    res.status(200).send(serviceAccount.getAll());
}



