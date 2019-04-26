var express = require('express');
var router = express.Router();
var walletController = require('../controllers/walletController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/', walletController.index);

router.get('/getBalance/:addr', walletController.getBalance);

router.post('/generateAddress', walletController.generateAddress);

router.post('/deployWallet', walletController.deployWallet);

router.post('/changeWalletOwner', walletController.changeWalletOwner);


module.exports = router;
