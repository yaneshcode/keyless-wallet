const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')
const credentials = require('../credentials/credentials.js')

const provider = new HDWalletProvider(
  credentials.MNEMONIC,
  "https://ropsten.infura.io/v3/" + credentials.INFURA_API_KEY,
)

const web3 = new Web3(provider)

const { abi:factoryAbi, bytecode:factoryBytecode } = require('../build/contracts/Factory.json')
const { abi:accountAbi, bytecode:accountBytecode } = require('../build/contracts/Wallet.json')

function buildCreate2Address(salt) {
  const bytecode = `${accountBytecode}${encodeParam('address', provider.addresses[0]).slice(2)}`

  return `0x${web3.utils.sha3(`0x${[
    'ff',
    credentials.FACTORY_ADDR,
    web3.utils.sha3(salt),
    web3.utils.sha3(bytecode)
  ].map(x => x.replace(/0x/, ''))
  .join('')}`).slice(-40)}`.toLowerCase()
}

async function deployAccount (salt) {
  console.log(provider.addresses[0]);
  const factory = new web3.eth.Contract(factoryAbi, credentials.FACTORY_ADDR)
  const account = provider.addresses[0]
  const nonce = await web3.eth.getTransactionCount(account)
  const bytecode = `${accountBytecode}${encodeParam('address', provider.addresses[0]).slice(2)}`
  //console.log(bytecode);
  console.log(salt)
  const result = await factory.methods.deploy(bytecode, web3.utils.sha3(salt)).send({
    from: account,
    gas: 4500000,
    gasPrice: 20000000000,
    nonce
  })

  // const computedAddr = buildCreate2Address(
  //   factoryAddress,
  //   salt,
  //   bytecode
  // )

  console.log(result.transactionHash);
  //const addr = result.events.DeployedWallet.returnValues.addr.toLowerCase()
  //assert.equal(addr, computedAddr)
  //console.log(addr);

  return {
    txHash: result.transactionHash,
    //address: addr,
    receipt: result
  }
}

function encodeParam(dataType, data) {
  return web3.eth.abi.encodeParameter(dataType, data)
}

async function getAddressBalance(address) {
  const balance = await web3.eth.getBalance(address);
  console.log(balance)
  return balance;
}

async function getAccountBalance(address) {
  const account = new web3.eth.Contract(accountAbi, address);
  const balance = await account.methods.totalBalance().call();
  return balance;
}

module.exports = {
   web3,
  // deployFactory,
  deployAccount,
  buildCreate2Address,
  //
  encodeParam,
  // isContract,
  getAccountBalance,
  getAddressBalance
}
