const {web3, contractCPLToken, contractCapacityPool} = require("../../utils/utils");

const Package = require("../../models/Package");
const serviceAccount = require("../../services/Account");
const servicePackage = require("../../services/Package");

exports.getBalanceEth = (req, res, next) => {
    //Check if account of type ADMIN exists
    let accounts = serviceAccount.getAdmin();
    if (accounts.length === 0) return res.status(400).send("No admin account found");
    serviceAccount.getBalanceEth(accounts[0])
        .then((balance) => {
            res.status(200).send(web3.utils.fromWei(balance));
        }).catch((err) => {
        res.status(400).send(err);
    })
}

exports.getBalanceToken = (req, res, next) => {
    //Check if account of type ADMIN exists
    let accounts = serviceAccount.getAdmin();
    if (accounts.length === 0) return res.status(400).send("No admin account found");
    serviceAccount.getBalanceToken(accounts[0])
        .then((balance) => {
            res.status(200).send(web3.utils.fromWei(balance));
        })
        .catch((err) => {
            res.status(400).send(err);
        })
}

exports.transferEthToPackage = async (req, res, next) => {
    try {
        let packages = Package.find();
        for (let _package of packages) {
            _package.account = servicePackage.getAccount(_package);
        }

        //Check for address parameter if not set address to all packages
        let address = req.query.address || packages.map(_package => _package.account.address);

        //Check if address empty array set to all packages addresses
        if (address.length === 0) address = packages.map(_package => _package.account.address);

        //Check if amount parameter is set if not set to 100
        let amount = req.query.amount || 0.01;

        //Convert amount to wei
        amount = web3.utils.toBN(web3.utils.toWei(amount.toFixed(18), "ether"));

        //Filter packages with address
        packages = packages.filter(_package => address.includes(_package.account.address));

        //Send eth to packages
        for (let _package of packages) {
            await serviceAccount.addEth(_package.account, amount);
        }

        // Fetch the updated ETH balances of all packages in parallel
        const balancePromises = packages.map(async _package => {
                const balance = await serviceAccount.getBalanceEth(_package.account);
                return {[_package.account.address]: web3.utils.fromWei(balance)};
            }
        );

        // Use Promise.all() to resolve all promises in parallel (since reading doesn't require sequential execution)
        let balances = await Promise.all(balancePromises);

        // Send the response
        res.status(200).send(balances);
    } catch (error) {
        res.status(400).send(error);
    }
}

exports.transferTokensToPackage = async (req, res, next) => {

    try {
        let packages = Package.find();
        for (let _package of packages) {
            _package.account = servicePackage.getAccount(_package);
        }

        //Check for address parameter if not set address to all packages
        let address = req.query.address || packages.map(_package => _package.account.address);

        //Check if address empty array set to all packages addresses
        if (address.length === 0) address = packages.map(_package => _package.account.address);

        //Check if amount parameter is set if not set to 100
        let amount = req.query.amount || 100;

        //Convert amount to wei
        amount = web3.utils.toBN(web3.utils.toWei(amount.toFixed(18), "ether"));

        //Filter packages with address
        packages = packages.filter(_package => address.includes(_package.account.address));

        //Send eth to packages
        for (let _package of packages) {
            await serviceAccount.addToken(_package.account, amount);
        }

        // Fetch the updated ETH balances of all packages in parallel
        const balancePromises = packages.map(async _package => {
                const balance = await serviceAccount.getBalanceToken(_package.account);
                return {[_package.account.address]: web3.utils.fromWei(balance)};
            }
        );

        // Use Promise.all() to resolve all promises in parallel (since reading doesn't require sequential execution)
        let balances = await Promise.all(balancePromises);

        // Send the response
        res.status(200).send(balances);
    } catch (error) {
        res.status(400).send(error);
    }



}

exports.clearTokensFromPackage = async (req, res, next) => {
    try {
        // Join accounts with packages
        let accounts = serviceAccount.getUsers();
        let packages = await Package.find();
        let packagesWithAccounts = packages.map(_package => {
            _package.account = accounts.find(account => account.address === _package.address);
            return _package;
        });

        // Check for address parameter. If set, filter packages to only those addresses
        if (req.query.address) {
            const addresses = Array.isArray(req.query.address) ? req.query.address : [req.query.address];
            packagesWithAccounts = packagesWithAccounts.filter(_package => addresses.includes(_package.account.address));
        }

        for (let _package of packagesWithAccounts) {
            const balance = await serviceAccount.getBalanceToken(_package.account);
            if (balance.gt(web3.utils.toBN(0))) {
                await serviceAccount.clearToken(_package.account);
            }
        }

        // Fetch the updated token balances of all packages in parallel
        const balancePromises = packagesWithAccounts.map(async _package => {
            const balance = await serviceAccount.getBalanceToken(_package.account);
            return {[_package.account.address]: web3.utils.fromWei(balance)};
        });

        // Use Promise.all() to resolve all promises in parallel
        let balances = await Promise.all(balancePromises);

        // Send the response
        res.status(200).send(balances);
    } catch (error) {
        res.status(400).send(error);
    }
}


