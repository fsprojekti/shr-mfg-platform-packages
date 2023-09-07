const express = require('express');
const router = express.Router();

const PackageController = require('../controllers/package');

router.get('/create', PackageController.create);

router.get('/balance/eth/get', PackageController.getBalanceEth);

router.get('/balance/token/get', PackageController.getBalanceToken);

router.get('/service/create', PackageController.createService);

router.get('/service/get', PackageController.getService);

router.get('/offer/create', PackageController.createOffer);

router.get('/offer/get', PackageController.getOffer);

router.get('/offer/send', PackageController.sendOffer);

router.get('/offer/response', PackageController.responseOffer);
//
 router.get('/get', PackageController.get);

module.exports = router;