// TODO: proper tests

const {
  web3,
  deployFactory,
  deployAccount,
  buildCreate2Address,
  numberToUint256,
  encodeParam,
  isContract
} = require('./utils')

const { abi:accountAbi, bytecode:accountBytecode } = require('../build/contracts/Account.json')

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

  console.log("computed address: " + computedAddr)
  console.log("isContract: " + await isContract(computedAddr))
  console.log("recipent: " + web3.eth.currentProvider.addresses[0])

  const result = await deployAccount(factoryAddress, salt, web3.eth.currentProvider.addresses[0])

  console.log("result tx: " + result.txHash)
  console.log("result addr: " + result.address)

  console.log("isContract: " + await isContract(computedAddr))
}

main()
