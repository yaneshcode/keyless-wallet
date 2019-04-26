const ethers = require('ethers');
const kovan = ethers.getDefaultProvider('kovan')

const contract = new ethers.Contract(ADDRESS, ABI, kovan);
function buildCreate2Address(creatorAddress, salt, byteCode) {
  return `0x${ethers.utils.id(`0x${[
    'ff',
    creatorAddress,
    ethers.utils.id(salt),
    ethers.utils.id(byteCode)
  ].map(x => x.replace(/0x/, ''))
  .join('')}`).slice(-40)}`.toLowerCase()
}

async function deployAccount (factoryAddress, salt, recipient) {
  const network = ethers.getDefaultProvider('ropsten')

  const contract = new ethers.Contract(ADDRESS, ABI, network);

  const factory = new ethers.Contract(factoryAddress, factoryAbi, network);

  const account = new ethers.Wallet(PRIVATE_KEY, network);
  const nonce = await acc.getTransactionCount('pending');

  const bytecode = `${accountBytecode}${encodeParam('address', recipient).slice(2)}`
  console.log(bytecode);
  console.log(salt)
  const result = await factory.methods.deploy(bytecode, salt).send({
    from: account,
    gas: 4500000,
    gasPrice: 10000000000,
    nonce
  })

  // const computedAddr = buildCreate2Address(
  //   factoryAddress,
  //   salt,
  //   bytecode
  // )

  const addr = result.events.DeployedWallet.returnValues.addr.toLowerCase()
  // assert.equal(addr, computedAddr)

  return {
    txHash: result.transactionHash,
    address: addr,
    receipt: result
  }
}

module.exports = {
  // web3,
  // deployFactory,
  // deployAccount,
  buildCreate2Address,
  //
  // encodeParam,
  // isContract,
  // getAccountBalance
}
