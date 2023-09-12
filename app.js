// Description: Main file of the application
const config = require('./config');

const express = require('express')
const app = express()
const port = 3000

const emitter = require('./utils/events').eventEmitter;

const packageRoutes = require('./api/routes/package');
const accountRoutes = require('./api/routes/accounts');
const serviceRoutes = require('./api/routes/service');
const serviceOffer = require('./api/routes/Offer');

app.use('/package', packageRoutes);
app.use('/account', accountRoutes);
app.use('/service', serviceRoutes);
app.use('/offer', serviceOffer);

//Load admin account
const servicePackage = require("./services/Package");
servicePackage.loadPackage();

app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`)
})

//Subscribe to events
const events = require('./utils/events');
emitter.on('offerExpired', (offer) => {
    //Log in yellow
    console.log("\x1b[33m%s\x1b[0m", "Offer expired: ", offer);
})

emitter.on('offerAccepted', (offer) => {
    //Log in green
    console.log("\x1b[32m%s\x1b[0m", "Offer accepted: ", offer);
})

emitter.on('offerRejected', (offer) => {
    //Log in red
    console.log("\x1b[31m%s\x1b[0m", "Offer rejected: ", offer);
})


//
// //WEB server
// app.get('/admin/balance/token', async (req, res) => {
//     const tokenContract = new web3.eth.Contract(abiDAI, config.tokenContractAddress);
//     let balance = await tokenContract.methods.balanceOf(account.address).call();
//     balance = web3.utils.fromWei(balance, "ether");
//     res.send(balance);
// });
//
// app.get('/admin/balance', async (req, res) => {
//     let balance = await web3.eth.getBalance(account.address);
//     balance = web3.utils.fromWei(balance, "ether");
//     res.send(balance);
// });
//
// //Admin routes
// app.get('/admin/clear', (req, res) => {
//     //clear all database entries
//     Package.find().forEach(_package => Package.remove(_package));
//     Offer.find().forEach(offer => Offer.remove(offer));
//     Service.find().forEach(service => Service.remove(service));
//     res.status(200).send("Database cleared");
// })
//
// app.get('/packages/create', (req, res) => {
//     if (!req.query.count) return res.status(400).send("Parameter count not set");
//     //Create packages
//     for (let i = 0; i < req.query.count; i++) {
//         let account = web3.eth.accounts.create();
//         let _package = Package.create({
//             address: account.address,
//             private_key: account.privateKey,
//             state: "CREATED"
//         });
//         _package.save();
//     }
//     return res.status(200).send(Package.find());
// })
//
// app.get('/packages/transfer/tokens', async (req, res) => {
//     //Reject if parameter amount not set
//     if (!req.query.amount) return res.status(400).send("Parameter amount not set");
//     let trxs = [];
//     let packages = Package.find();
//     let tokenContract = new web3.eth.Contract(abiDAI, config.tokenContractAddress);
//     packages.forEach(_package => {
//         let amount = web3.utils.toWei(req.query.amount, "ether");
//         let transaction = tokenContract.methods.transfer(_package.address, amount);
//         trxs.push(transaction);
//     })
//     //Post transaction to blockchain
//     let nonce = await web3.eth.getTransactionCount(account.address);
//     let promises = [];
//     for (let i = 0; i < trxs.length; i++) {
//         let opt = {};
//         opt.from = account.address;
//         opt.gas = 100000;
//         opt.nonce = nonce + i;
//         promises.push(new Promise((resolve1, reject1) => {
//             trxs[i].send(opt)
//                 .then(() => {
//                     resolve1();
//                 }).catch(e => {
//                 reject1(e);
//             });
//         }))
//     }
//     Promise.all(promises)
//         .then((values) => {
//             res.status(200).send("All transactions sent");
//         })
//         .catch(e => {
//             res.status(401).send(e);
//         })
// })
//
// app.get('/packages/transfer/eth', async (req, res) => {
//     //Reject if parameter amount not set
//     if (!req.query.amount) return res.status(400).send("Parameter amount not set");
//     let packages = Package.find();
//     let amount = web3.utils.toWei(req.query.amount, "ether");
//     let nonce = await web3.eth.getTransactionCount(account.address);
//     packages.forEach(_package => {
//         web3.eth.sendTransaction({
//             from: account.address,
//             to: _package.address,
//             value: amount,
//             gasLimit: 100000,
//             nonce: nonce
//         });
//         nonce++;
//     })
//     res.status(200).send("All transactions sent");
// })
//
// app.get('/packages/balance/tokens', async (req, res) => {
//     let packages = Package.find();
//     let balances = [];
//     let tokenContract = new web3.eth.Contract(abiDAI, config.tokenContractAddress);
//     for (let _package of packages) {
//         balances.push({[_package.address]: web3.utils.fromWei(await tokenContract.methods.balanceOf(_package.address).call())});
//     }
//     res.status(200).send(balances);
// })
//
// app.get('/packages/balance/eth', async (req, res) => {
//     let packages = Package.find();
//     let balances = [];
//     for (let _package of packages) {
//         balances.push({[_package.address]: await web3.eth.getBalance(_package.address)});
//     }
//     res.status(200).send(balances);
// })
//
// app.get('/packages/get', (req, res) => {
//     let packages = Package.find()
//     res.send(packages);
//
// })
//
// //Get offers by package id check request parameter
// app.get('/packages/offers/get', (req, res) => {
//     //Reject if parameter id not set
//     if (!req.query.id) return res.status(400).send("Parameter id not set");
//     let offers = Offer.find({_id: req.query.id});
//     res.send(offers);
// })
//
// app.get('/offers/get', (req, res) => {
//     res.send(Offer.find());
// })
//
// app.get('/services/get', (req, res) => {
//     res.send(Service.find());
// })
//
// //Package routes
// app.get('/package/services/get', (req, res) => {
//     //Reject if parameter id_package not set
//     if (!req.query.id_package) return res.status(400).send("Parameter id_package not set");
//     //Reject if there is no package with the given id_package
//     let _package = Package.find({_id: req.query.id_package});
//     if (!_package) return res.status(400).send("No package with the given id_package");
//     res.status(200).send(Service.find({id_package: req.query.id_package}));
// })
//
//
// app.get('/packages/services/manage', async (req, res) => {
//     //Get all packages
//     let msg = [];
//     let packages = Package.find();
//     for (let _package of packages) {
//         msg.push(await servicesService.manageServices(web3, _package));
//     }
//     res.status(200).send(msg);
// })
//
// //Game control
// app.get('/game/start', (req, res) => {
//     //Get packages
//     let packages = Package.find();
//     //Activate packages
//     for (let _package of packages) {
//         //Check if package has active service
//     }
// })
//
// //BC
// app.get('/bc/offers', (req, res) => {
//     let contractAddress = config.manufacturerPoolAddress;
//     let contractAbi = require('./contracts/abiManufacturersPool.json');
//     let contract = new web3.eth.Contract(contractAbi, contractAddress);
//     contract.methods.getOffers().call().then(offers => {
//         res.status(200).send(offers);
//     }).catch(e => {
//         res.status(400).send(e);
//     })
// })
//
// app.get('/transportFinished', (req, res) => {
//     //Reject if parameter offerId not set
//     if (!req.query.offerId) return res.status(400).send("Parameter offerId not set");
//     //Get offer and reject of offer not found
//     let offer = Offer.find({_id: req.query.offerId})[0];
//     if (!offer) return res.status(400).send("Offer not found");
//     //Get service to which offer belongs
//     let service = Service.find({_id: offer.id_service})[0];
//     if (service.state === "TRANSPORT_BACK") {
//         service.state = "BACK";
//         service.save();
//         console.log("Service state changed to BACK");
//         res.status(200).send("Service state changed to BACK");
//     } else {
//         service.state = "PROCESSING";
//         service.save();
//         console.log("Service state changed to PROCESSING");
//         res.status(200).send("Service state changed to PROCESSING");
//     }
// })
//
// app.get('/processingFinished', (req, res) => {
//     //Reject if parameter offerId not set
//     if (!req.query.offerId) return res.status(400).send("Parameter offerId not set");
//     //Get offer and reject of offer not found
//     let offer = Offer.find({_id: req.query.offerId})[0];
//     if (!offer) return res.status(400).send("Offer not found");
//     //Get service to which offer belongs
//     let service = Service.find({_id: offer.id_service})[0];
//     service.state = "PROCESSING_FINISHED";
//     service.save()
//     res.status(200).send("Service state changed to PROCESSING_FINISHED");
// })
//

//




