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

walletController.getBalance = function (req, res) {
  let address = req.params.addr
  console.log(address)
  getAddressBalance(address).then((result) => {
    res.send(result);
  })
};

walletController.generateAddress = function (req, res) {
  let data = req.body;
  let address = buildCreate2Address(data.salt);
  res.send(address);
};

walletController.deployWallet = function (req, res) {
  let data = req.body;
  deployAccount(data.salt).then((result) => {
    res.send(result);
  });
  //res.send(result);
};

walletController.changeWalletOwner = function (req, res) {
  res.render('./index', { title: 'Keyless Wallet' });
};
//
// // Get a single player by slug
// playerController.showSlug = function (req, res) {
//   Player.findOne({
//     slug: req.params.slug
//   }).exec((err, player) => {
//     if (err) {
//       console.log("Error: " + err);
//     }
//     else {
//       res.locals.player = player;
//       //res.render('players/show')
//       res.send(player);
//     }
//   })
// };
//
// // Get a single player by id
// playerController.show = function (req, res) {
//   Player.findOne({
//     _id: req.params.id
//   }).exec((err, player) => {
//     if (err) {
//       console.log("Error: " + err);
//     }
//     else {
//       res.locals.player = player;
//       res.render('./player/show');
//     }
//   })
// };
//
// // Show player info to update
// playerController.showUpdate = function (req, res) {
//   Player.findOne({
//     _id: req.params.id
//   }).exec((err, player) => {
//     if (err) {
//       console.log("Error: " + err);
//     }
//     else {
//       res.locals.player = player;
//       res.render('./player/update');
//     }
//   })
// };
//
// // Create a new player
// // initialize empty and redirect
// playerController.new = function (req, res) {
//   res.locals.title = "New Player";
//   res.locals.player = {
//     username: "",
//     publicKey: "",
//     balance: ""
//   };
//   res.render('./player/new');
// };
//
// // Save a new player
// playerController.save = function (req, res) {
//   let newPlayer = new Player(req.body);
//
//   newPlayer.save((err) => {
//     if (err) {
//       console.log("Error: " + err);
//     }
//     else {
//       console.log("Successfully saved new player.");
//       res.redirect("/player/index");
//       //res.send("Succesffully saved new player.");
//     }
//   });
// };
//
// // Update an existing player
// playerController.update = function (req, res) {
//   Player.findByIdAndUpdate(
//     req.params.id,
//     {
//       $set: req.body
//     },
//     {
//       new: true   // returns the modified data instead of original
//     },
//     (err, player) => {
//       if (err) {
//         console.log("Error: " + err);
//       }
//       else {
//         console.log("Updated player: " + player._id);
//         res.redirect("/player/index");
//       }
//     }
//   );
// };
//
// // Delete an existing player
// playerController.delete = function (req, res) {
//   Player.findByIdAndDelete(
//     req.params.id,
//     (err, player) => {
//       if (err) {
//         console.log("Error: " + err);
//       }
//       else {
//         console.log("Player deleted: \n", player);
//         res.redirect("/player/index");
//         //res.send("Deleted player: \n", player);
//       }
//     }
//   );
// }

module.exports = walletController;
