const assert = require('assert')
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')
const credentials = require('../../credentials/credentials.js')

// TODO: clean up

const provider = new HDWalletProvider(
  credentials.MNEMONIC,
  'http://localhost:8545',
)

const web3 = new Web3(provider)

const { abi:factoryAbi, bytecode:factoryBytecode } = require('../../build/contracts/Factory.json')
const { abi:accountAbi, bytecode:accountBytecode } = require('../../build/contracts/Wallet.json')

async function deployFactory() {
  const Factory = new web3.eth.Contract(factoryAbi)
  const {_address: factoryAddress} = await Factory.deploy({
      data: factoryBytecode
  }).send({
    from: web3.eth.currentProvider.addresses[0]
  })

  return factoryAddress
}

async function deployAccount (factoryAddress, salt, recipient) {
  const factory = new web3.eth.Contract(factoryAbi, factoryAddress)
  const account = web3.eth.currentProvider.addresses[0]
  const nonce = await web3.eth.getTransactionCount(account)
  const bytecode = `${accountBytecode}${encodeParam('address', recipient).slice(2)}`
  console.log(bytecode);
  console.log(salt)
  const result = await factory.methods.deploy(bytecode, salt).send({
    from: account,
    gas: 4500000,
    gasPrice: 10000000000,
    nonce
  })

  const computedAddr = buildCreate2Address(
    factoryAddress,
    salt,
    bytecode
  )

  const addr = result.events.DeployedWallet.returnValues.addr.toLowerCase()
  assert.equal(addr, computedAddr)

  return {
    txHash: result.transactionHash,
    address: addr,
    receipt: result
  }
}

function buildCreate2Address(creatorAddress, saltHex, byteCode) {
  return `0x${web3.utils.sha3(`0x${[
    'ff',
    creatorAddress,
    saltHex,
    web3.utils.sha3(byteCode)
  ].map(x => x.replace(/0x/, ''))
  .join('')}`).slice(-40)}`.toLowerCase()
}

// function valu) {
//   const hex = value.toString(16)
//   return `0x${'0'.repeat(64-hex.length)}${hex}`
// }

function encodeParam(dataType, data) {
  return web3.eth.abi.encodeParameter(dataType, data)
}

async function isContract(address) {
  const code = await web3.eth.getCode(address)
  return code.slice(2).length > 0
}

async function getAccountBalance(address) {
  const account = new web3.eth.Contract(accountAbi, address);
  const balance = await account.methods.totalBalance().call();
  return balance;
}

module.exports = {
  web3,
  deployFactory,
  deployAccount,
  buildCreate2Address,

  encodeParam,
  isContract,
  getAccountBalance
}
