const ethers = require('ethers');

const {
  web3,
  deployFactory,
  deployAccount,
  buildCreate2Address,
  encodeParam,
  isContract,
  getAccountBalance
} = require('./utils')

const { abi:accountAbi, bytecode:accountBytecode } = require('../build/contracts/Wallet.json')

async function main() {
  const factoryAddress = await deployFactory()

  const salt = "cafebabe"

  console.log("factory address: " + factoryAddress)
  console.log("salt: " + ethers.utils.id(salt));

  const bytecode = `${accountBytecode}${encodeParam('address', web3.eth.currentProvider.addresses[0]).slice(2)}`

  const computedAddr = buildCreate2Address(
    factoryAddress,
    ethers.utils.id(salt),
    bytecode
  )

  const computedAddrKovan = buildCreate2Address(
    "0xd5863670b7ead2a4218261f473a81aa426363f1d",
    ethers.utils.id(salt),
    bytecode
  )
  console.log("kovan computed addr: " + computedAddrKovan)

  console.log("computed address: " + computedAddr)
  console.log("isContract: " + await isContract(computedAddr))
  console.log("recipent: " + web3.eth.currentProvider.addresses[0])


  // FUND Wallet
  const value = ethers.utils.bigNumberify('123');
  const gasPrice = ethers.utils.bigNumberify('2000000000');
  const gasLimit = ethers.utils.bigNumberify('210000');
  const to = computedAddr;
  const from = web3.eth.currentProvider.addresses[0];

  //const nonce = await web3.eth.getTransactionCount(from);

  //console.log("nonce: " + nonce);

  const tx = {
    from,
    to,
    //nonce,
    value
    // gasPrice,
    // gasLimit
  }

  console.log (tx);
  const txHash = await web3.eth.sendTransaction(tx);

  //console.log(txHash);



  //console.log("balance before: " + await getAccountBalance(computedAddr));

  // DEPLOYING WALLET

  const result = await deployAccount(factoryAddress, ethers.utils.id(salt), web3.eth.currentProvider.addresses[0])

  console.log("result tx: " + result.txHash)
  console.log("result addr: " + result.address)

  console.log("isContract: " + await isContract(computedAddr))
  console.log("balance after: " + await getAccountBalance(computedAddr));

}

main()
