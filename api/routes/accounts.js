const express = require('express');
const router = express.Router();

const AccountController = require('../controllers/account');
const PackageController = require("../controllers/package");

router.get('/get', AccountController.get);

router.get('/balance/eth/get', AccountController.getBalanceEth);

router.get('/balance/token/get', AccountController.getBalanceToken);

module.exports = router;