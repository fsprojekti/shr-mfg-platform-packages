const Account = require("../../models/Account");
const serviceAccount = require("../../services/Account");


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



