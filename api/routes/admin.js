const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/admin');

router.get('/balance/eth/get', AdminController.getBalanceEth);

router.get('/balance/token/get', AdminController.getBalanceToken);

router.get('/package/transfer/eth', AdminController.transferEthToPackage);

router.get('/package/transfer/tokens', AdminController.transferTokensToPackage);

router.get('/package/clear/tokens', AdminController.clearTokensFromPackage);

module.exports = router;