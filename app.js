const abiDAI = require('./contracts/abiDAI.json');

const Web3 = require("web3");
const config = require('./config.json');

const Offer = require("./models/Offer");
const Service = require("./models/Service");
const Package = require("./models/Package");

const servicePackage = require("./services/Package");
const servicesService = require("./services/Service");

const express = require('express')
const app = express()
const port = 3000

//Connect to web3
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.web3_provider));

web3.eth.handleRevert = true;

//Import account to web3 generate from private key
let account = web3.eth.accounts.privateKeyToAccount(config.admin.private_key);
web3.eth.accounts.wallet.add(account);
console.log("Main account added to web3");

//Import packages accounts to web3
let packages = Package.find();
packages.forEach(_package => {
    let account = web3.eth.accounts.privateKeyToAccount(_package.private_key);
    web3.eth.accounts.wallet.add(account);
    console.log("Package account added to web3");
});


// //Every second check if a package needs to be updated
// setInterval(async () => {
//     console.log("Check all packages if they need to be updated");
//     for (let i = 0; i < packages.length; i++) {
//         //Is a manufacturing service in progress?
//         let serviceManufacturing = packageService.
//     }
// }, 1000);


//WEB server
app.get('/admin/balance/token', async (req, res) => {
    const tokenContract = new web3.eth.Contract(abiDAI, config.tokenContractAddress);
    let balance = await tokenContract.methods.balanceOf(account.address).call();
    balance = web3.utils.fromWei(balance, "ether");
    res.send(balance);
});

app.get('/admin/balance', async (req, res) => {
    let balance = await web3.eth.getBalance(account.address);
    balance = web3.utils.fromWei(balance, "ether");
    res.send(balance);
});

//Admin routes
app.get('/admin/clear', (req, res) => {
    //clear all database entries
    Package.find().forEach(_package => Package.remove(_package));
    Offer.find().forEach(offer => Offer.remove(offer));
    Service.find().forEach(service => Service.remove(service));
    res.status(200).send("Database cleared");
})

app.get('/packages/create', (req, res) => {
    if (!req.query.count) return res.status(400).send("Parameter count not set");
    //Create packages
    for (let i = 0; i < req.query.count; i++) {
        let account = web3.eth.accounts.create();
        let _package = Package.create({
            address: account.address,
            private_key: account.privateKey,
            state: "CREATED"
        });
        _package.save();
    }
    return res.status(200).send(Package.find());
})

app.get('/packages/transfer/tokens', async (req, res) => {
    //Reject if parameter amount not set
    if (!req.query.amount) return res.status(400).send("Parameter amount not set");
    let trxs = [];
    let packages = Package.find();
    let tokenContract = new web3.eth.Contract(abiDAI, config.tokenContractAddress);
    packages.forEach(_package => {
        let amount = web3.utils.toWei(req.query.amount, "ether");
        let transaction = tokenContract.methods.transfer(_package.address, amount);
        trxs.push(transaction);
    })
    //Post transaction to blockchain
    let nonce = await web3.eth.getTransactionCount(account.address);
    let promises = [];
    for (let i = 0; i < trxs.length; i++) {
        let opt = {};
        opt.from = account.address;
        opt.gas = 100000;
        opt.nonce = nonce + i;
        promises.push(new Promise((resolve1, reject1) => {
            trxs[i].send(opt)
                .then(() => {
                    resolve1();
                }).catch(e => {
                reject1(e);
            });
        }))
    }
    Promise.all(promises)
        .then((values) => {
            res.status(200).send("All transactions sent");
        })
        .catch(e => {
            res.status(401).send(e);
        })
})

app.get('/packages/transfer/eth', async (req, res) => {
    //Reject if parameter amount not set
    if (!req.query.amount) return res.status(400).send("Parameter amount not set");
    let packages = Package.find();
    let amount = web3.utils.toWei(req.query.amount, "ether");
    let nonce = await web3.eth.getTransactionCount(account.address);
    packages.forEach(_package => {
        web3.eth.sendTransaction({
            from: account.address,
            to: _package.address,
            value: amount,
            gasLimit: 100000,
            nonce: nonce
        });
        nonce++;
    })
    res.status(200).send("All transactions sent");
})

app.get('/packages/balance/tokens', async (req, res) => {
    let packages = Package.find();
    let balances = [];
    let tokenContract = new web3.eth.Contract(abiDAI, config.tokenContractAddress);
    for (let _package of packages) {
        balances.push({[_package.address]: await tokenContract.methods.balanceOf(_package.address).call()});
    }
    res.status(200).send(balances);
})

app.get('/packages/balance/eth', async (req, res) => {
    let packages = Package.find();
    let balances = [];
    for (let _package of packages) {
        balances.push({[_package.address]: await web3.eth.getBalance(_package.address)});
    }
    res.status(200).send(balances);
})

app.get('/packages/get', (req, res) => {
    let packages = Package.find()
    res.send(packages);

})

//Get offers by package id check request parameter
app.get('/packages/offers/get', (req, res) => {
    //Reject if parameter id not set
    if (!req.query.id) return res.status(400).send("Parameter id not set");
    let offers = Offer.find({_id: req.query.id});
    res.send(offers);
})

app.get('/offers/get', (req, res) => {
    res.send(Offer.find());
})

app.get('/services/get', (req, res) => {
    res.send(Service.find());
})

//Package routes
app.get('/package/services/get', (req, res) => {
    //Reject if parameter id_package not set
    if (!req.query.id_package) return res.status(400).send("Parameter id_package not set");
    //Reject if there is no package with the given id_package
    let _package = Package.find({_id: req.query.id_package});
    if (!_package) return res.status(400).send("No package with the given id_package");
    res.status(200).send(Service.find({id_package: req.query.id_package}));
})


app.get('/packages/services/manage', async (req, res) => {
    //Get all packages
    let msg = [];
    let packages = Package.find();
    for (let _package of packages) {
        msg.push(await servicesService.manageServices(web3, _package));
    }
    res.status(200).send(msg);
})

//Game control
app.get('/game/start', (req, res) => {
    //Get packages
    let packages = Package.find();
    //Activate packages
    for (let _package of packages) {
        //Check if package has active service
    }
})

//BC
app.get('/bc/offers', (req, res) => {
    let contractAddress = config.manufacturerPoolAddress;
    let contractAbi = require('./contracts/abiManufacturersPool.json');
    let contract = new web3.eth.Contract(contractAbi, contractAddress);
    contract.methods.getOffers().call().then(offers => {
        res.status(200).send(offers);
    }).catch(e => {
        res.status(400).send(e);
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})





