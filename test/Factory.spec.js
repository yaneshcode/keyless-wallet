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


contract('Upgradeable CREATE2 Wallet testing', (accounts) => {

  const bytecode = `${accountBytecode}${encodeParam('address', accounts[0]).slice(2)}`

  before('setup', async () => {
    this.factoryContract = await Factory.new({ from: accounts[0] });
    this.versionContract = await VersionControl.new(this.factoryContract.address, bytecode, {from: accounts[0]});
  })

  describe('Test deploy', () => {
    it('Factory contract should deploy.', async () => {

      let factoryContractDeployTest = await Factory.new({ from: accounts[0] })
      // console.log(this.factoryContract.address);
      // console.log(this.versionContract.address);
      assert.ok(factoryContractDeployTest);
    })

    it('Version control contract should deploy.', async () => {

      let versionContractDeployTest = await VersionControl.new(this.factoryContract.address, bytecode, { from: accounts[0] })
      // console.log(this.factoryContract.address);
      // console.log(this.versionContract.address);
      assert.ok(versionContractDeployTest);
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

    it("Should fire event when transfering ownership", async () => {
      let versionContractOwnershipTest = await VersionControl.new(this.factoryContract.address, bytecode, {from: accounts[0]});

      // SAVE LOGS
      let { logs } = await versionContractOwnershipTest.setOwner(accounts[1], { from: accounts[0] });

      // EVENT
      await expectEvent.inLogs(logs, 'OwnershipChanged', { oldOwner: accounts[0], newOwner: accounts[1] });

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

      assert.equal(
        await this.versionContract.currentVersion(),
        1,
        "Updated version is not expected value."
      );
    });

    it("Should match with correct bytecode after upgrade", async () => {
      await this.versionContract.updateBytecode(bytecode);

      assert.equal(
        await this.versionContract.currentVersion(),
        2,
        "Updated version is not expected value."
      );

      let version = await this.versionContract.currentVersion();

      assert.equal(
        await this.versionContract.bytecodeMap(version),
        bytecode,
        "Updated version bytecode is not expected value."
      );
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
