const {
  buildCreate2Address,
  deployAccount,
  getAccountBalance,
  getAddressBalance
} = require('../utils/utils');


var walletController = {};

// Show index list of all players
walletController.index = function (req, res) {
  res.render('./index', { title: 'Keyless Wallet' });
};

// Show check balance page
walletController.showBalancePage = function (req, res) {
  res.locals.wallet = {
    address : "",
    balance: "",
  };
  res.render('./checkBalance');
}

walletController.getBalance = function (req, res) {
  let address = req.body.address;
  console.log(address)
  getAddressBalance(address).then((result) => {
    res.locals.wallet = {
      address: address,
      balance: result
    }
    res.render('./checkBalance');
  })
};

walletController.showGenerateAddressPage = function (req, res) {
  res.locals.wallet = {
    username: "",
    password: "",
    address : "",
  };
  res.render('./createWallet');
}
walletController.generateAddress = function (req, res) {
  let data = req.body;
  let address = buildCreate2Address(data.salt);
  res.locals.wallet = {
    address: address,
    username: data.username,
    password: "",

  }
  res.render('./createWallet');
};

walletController.showDeployWalletPage = function (req, res) {
  res.locals.wallet = {
    address : "",
    password: "",
    username: "",
    tx: "",
  };
  res.render('./deployWallet');
}

walletController.deployWallet = function (req, res) {
  let data = req.body;
  deployAccount(data.salt).then((result) => {
    res.locals.wallet = {
      address : data.address,
      password: "",
      username: data.username
      tx: result.txHash,
    };
  });
  res.render('./deployWallet');
};

walletController.aboutPage = function (req, res) {
  res.render('./about');
};

module.exports = walletController;
