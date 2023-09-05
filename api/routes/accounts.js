const express = require('express');
const router = express.Router();

const AccountController = require('../controllers/account');

router.get('/get', AccountController.get);

router.get('/getAll', AccountController.getAll);

module.exports = router;