const express = require('express');
const router = express.Router();

const PackageController = require('../controllers/package');

router.get('/get', PackageController.get);

//router.get('/offer/response', PackageController.responseOffer);
//

module.exports = router;