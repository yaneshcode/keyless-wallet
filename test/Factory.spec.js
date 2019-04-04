const ethers = require('ethers');
const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const Factory = artifacts.require('Factory')
const VersionControl = artifacts.require('VersionControl');

const {
  web3,
  deployFactory,
  deployAccount,
  buildCreate2Address,
  numberToUint256,
  encodeParam,
  isContract
} = require('./utils')

// We need the wallet bytecode for testing
const { abi:accountAbi, bytecode:accountBytecode } = require('../build/contracts/Wallet.json');


contract('Factory', (accounts) => {

  const bytecode = `${accountBytecode}${encodeParam('address', accounts[0]).slice(2)}`

  before('setup', async () => {
    this.factoryContract = await Factory.new({ from: accounts[0] });
    this.versionContract = await VersionControl.new(this.factoryContract.address, bytecode, {from: accounts[0]});
  })

  describe('test deploy', () => {
    it('should deploy', async () => {
      // TODO

      console.log(this.factoryContract.address);
      console.log(this.versionContract.address);
      assert.ok(true)
    })
  })


  describe('Version Control testing', () => {

    it("Should have owner address be same address who deployed contract.", async () => {
      const owner = accounts[0];

      assert.equal(
        (await this.versionContract.owner()),
        owner,
        "Initial owner is not expected address."
      );
    });

    it("Should have correct factory contract address.", async () => {

      assert.equal(
        (await this.versionContract.factory()),
        this.factoryContract.address,
        "Factory contract address is not expected address."
      );
    });

    it("Should have correct initial bytecode.", async () => {

      assert.equal(
        (await this.versionContract.bytecodeMap(0)),
        bytecode,
        "Initial bytecode does not match."
      );
    });


    it("Should let owner transfer ownership.", async () => {
      let versionContractOwnershipTest = await VersionControl.new(this.factoryContract.address, bytecode, {from: accounts[0]});
      await versionContractOwnershipTest.setOwner(accounts[1], { from: accounts[0] })

      assert.equal(
        await versionContractOwnershipTest.owner(),
        accounts[1],
        "Owner transfer does not match."
      )
    });

    it("Should fail if non-owner tries to transfer ownership.", async () => {
      let versionContractOwnershipTest = await VersionControl.new(this.factoryContract.address, bytecode, {from: accounts[0]});

      assert.equal(
        await versionContractOwnershipTest.owner(),
        accounts[0],
        "Original owner should not have changed."
      );

      await shouldFail.reverting(versionContractOwnershipTest.setOwner(accounts[1], { from: accounts[2] }));
    });

    it("Should have owner address be same address who deployed contract.", async () => {
      const owner = accounts[0];

      assert.equal(
        (await this.versionContract.owner()),
        owner,
        "Initial owner is not expected address."
      );
    });

    it("Should upgrade to next version", async () => {
      await this.versionContract.updateBytecode(bytecode);
      let version = await this.versionContract.currentVersion();
      console.log(version.toString());
    });


  })

  describe('Factory testing', () => {
    it('Should deploy', async () => {
      // TODO
      assert.ok(true)
    })
  })

  describe('Wallet testing', () => {
    it('should deploy', async () => {
      // TODO
      assert.ok(true)
    })
  })
})
