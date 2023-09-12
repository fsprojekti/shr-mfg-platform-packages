const Account = require('../models/Account');
const {web3, contractCPLToken, mnemonic} = require("../utils/utils");
const secret = require("../secret.json");


exports.get = () => Account.findOne();

exports.create = () => {
    let account = web3.eth.accounts.privateKeyToAccount(secret.privateKey)
    web3.eth.accounts.wallet.add(account);
    let _account = Account.create({
        address: account.address,
        privateKey: account.privateKey,
    });
    _account.save();
    return Account.findOne({address: account.address});
}

exports.getBalanceEth = (account) => {
    return new Promise(async (resolve, reject) => {
        let balance = await web3.eth.getBalance(account.address);
        balance = web3.utils.fromWei(balance, "ether");
        resolve(balance);
    })
}

exports.getBalanceToken = (account) => {
    return new Promise(async (resolve, reject) => {
        let balance = await contractCPLToken.methods.balanceOf(account.address).call();
        balance = web3.utils.fromWei(balance, "ether");
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