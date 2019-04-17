const ethers = require('ethers');

const {
  web3,
  deployFactory,
  deployAccount,
  buildCreate2Address,
  numberToUint256,
  encodeParam,
  isContract,
  getAccountBalance
} = require('./utils')

const { abi:accountAbi, bytecode:accountBytecode } = require('../build/contracts/Wallet.json')

async function main() {
  const factoryAddress = await deployFactory()
  const salt = 1

  console.log("factory address: " + factoryAddress)
  console.log("salt: " + numberToUint256(salt));

  const bytecode = `${accountBytecode}${encodeParam('address', web3.eth.currentProvider.addresses[0]).slice(2)}`

  const computedAddr = buildCreate2Address(
    factoryAddress,
    numberToUint256(salt),
    bytecode
  )

  const computedAddrKovan = buildCreate2Address(
    "0xc126bd0440865b0ce4668269d485f7dd4750d4b9",
    numberToUint256(6),
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

  const nonce = await web3.eth.getTransactionCount(from);

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

  const result = await deployAccount(factoryAddress, salt, web3.eth.currentProvider.addresses[0])

  console.log("result tx: " + result.txHash)
  console.log("result addr: " + result.address)

  console.log("isContract: " + await isContract(computedAddr))
  console.log("balance after: " + await getAccountBalance(computedAddr));

}

main()
