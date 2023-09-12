const express = require('express');
const router = express.Router();

const OfferController = require('../controllers/offer');

router.get('/get', OfferController.get);

router.get('/update', OfferController.update);

router.get('/create', OfferController.create);

router.get('/send', OfferController.send);

router.get('/accept', OfferController.accept);

router.get('/reject', OfferController.reject);

//router.get('/offer/response', PackageController.responseOffer);
//

module.exports = router;