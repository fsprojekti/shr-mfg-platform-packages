const express = require('express');
const router = express.Router();

const PackageController = require('../controllers/package');

router.get('/create', PackageController.create);

router.get('/balance/eth/get', PackageController.getBalanceEth);

router.get('/balance/token/get', PackageController.getBalanceToken);

router.get('/offer/create', PackageController.create);

// router.get('/offer/send', PackageController.packagesOfferSend);
//
 router.get('/get', PackageController.get);

module.exports = router;