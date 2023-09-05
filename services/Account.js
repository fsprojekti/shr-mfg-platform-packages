const Account = require('../models/Account');
const {web3, contractCPLToken, mnemonic} = require("../utils/utils");
const {ethers} = require("ethers");


exports.getUsers = () => Account.find({type: "USER"});

exports.getAdmin = () => Account.find({type: "ADMIN"});

exports.getAll = () => Account.find();


exports.create = () => {
    //Create account from mnemonic. If this is the first account, it will be admin account (type: ADMIN) otherwise it will be a user account (type: USER). Add account to web3 wallet and save it to database
    let accounts = Account.find();
    let type = accounts.length === 0 ? "ADMIN" : "USER";
    let account = web3.eth.accounts.privateKeyToAccount((ethers.HDNodeWallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/" + accounts.length)).privateKey)
    web3.eth.accounts.wallet.add(account);
    let _account = Account.create({
        address: account.address,
        privateKey: account.privateKey,
        type: type
    });
    _account.save();
    return Account.findOne({address: account.address});
}

exports.createAdmin = () => {
    let accounts = Account.find({type: "ADMIN"});
    if (accounts.length > 0) return accounts[0];
    return this.create();

}

exports.loadAccountsToWallet = () => {
    let accounts = Account.find();
    for (let i = 0; i < accounts.length; i++) {
        let account = web3.eth.accounts.privateKeyToAccount(accounts[i].privateKey);
        web3.eth.accounts.wallet.add(account);
    }
}

exports.getBalanceEth = (account) => {
    return new Promise(async (resolve, reject) => {
        let balance = await web3.eth.getBalance(account.address);
        resolve(balance);
    })
}

exports.getBalanceToken = (account) => {
    return new Promise(async (resolve, reject) => {
        let balance = await contractCPLToken.methods.balanceOf(account.address).call();
        resolve(balance);
    })
}

exports.addEth = (account, amount) => {
    return new Promise(async (resolve, reject) => {
        //Check for admin account
        let adminAccounts = this.getAdmin();
        if (adminAccounts.length === 0) return reject("No admin account found");
        await web3.eth.sendTransaction({
            from: adminAccounts[0].address,
            to: account.address,
            value: amount,
            gasLimit: 100000
        });
        resolve({account: account.address, balance: amount});
    })
}

exports.addToken = (account, amount) => {
    return new Promise(async (resolve, reject) => {
        //Check for admin account
        let adminAccounts = this.getAdmin();
        if (adminAccounts.length === 0) return reject("No admin account found");
        await contractCPLToken.methods.transfer(account.address, amount).send({
            from: adminAccounts[0].address,
            gasLimit: 100000
        });
        resolve({account: account.address, balance: amount});
    })
}

exports.clearToken = (account) => {
    return new Promise(async (resolve, reject) => {
        let balance = await this.getBalanceToken(account);
        if (balance > 0) {
            //Check for admin account
            let adminAccounts = this.getAdmin();
            if (adminAccounts.length === 0) return reject("No admin account found");
            await contractCPLToken.methods.transfer(adminAccounts[0].address, balance).send({from: account.address});
            resolve({account: account.address, balance: balance});
        }
        reject("No token balance to clear");
    })

}