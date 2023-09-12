const express = require('express');
const router = express.Router();

const ServiceController = require('../controllers/service');

router.get('/get', ServiceController.get);

router.get('/create', ServiceController.create);

router.get('/transport/in', ServiceController.transportIn);

router.get('/transport/out', ServiceController.transportOut);

module.exports = router;