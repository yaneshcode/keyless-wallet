var express = require('express');
var router = express.Router();
var walletController = require('../controllers/walletController');

router.get('/', walletController.index);

router.get('/getBalance', walletController.showBalancePage);

router.post('/getBalance', walletController.getBalance);

router.get('/createWallet', walletController.showGenerateAddressPage);

router.post('/createWallet', walletController.generateAddress);

router.get('/deployWallet', walletController.showDeployWalletPage);

router.post('/deployWallet', walletController.deployWallet);

router.get('/about', walletController.aboutPage);


module.exports = router;
