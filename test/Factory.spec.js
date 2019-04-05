const ethers = require('ethers');
const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const Factory = artifacts.require('Factory')
const VersionControl = artifacts.require('VersionControl');
const Wallet = artifacts.require('Wallet');

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
    this.walletContract = await Wallet.new(accounts[0], { from: accounts[0] });
  })

  describe('Test deploy', () => {
    it('Factory contract should deploy.', async () => {

      let factoryContractDeployTest = await Factory.new({ from: accounts[0] })
      // console.log(this.factoryContract.address);
      // console.log(this.versionContract.address);
      // console.log(this.walletContract.address);

      // throw error if contract is undefined
      assert.ok(factoryContractDeployTest);
    })

    it('Version control contract should deploy.', async () => {

      let versionContractDeployTest = await VersionControl.new(this.factoryContract.address, bytecode, { from: accounts[0] })
      // console.log(this.factoryContract.address);
      // console.log(this.versionContract.address);
      // console.log(this.walletContract.address);

      // throw error if contract is undefined
      assert.ok(versionContractDeployTest);
    })

    it('Wallet contract should deploy.', async () => {

      let walletContractDeployTest = await Wallet.new(accounts[0], { from: accounts[0] })
      // console.log(this.factoryContract.address);
      // console.log(this.versionContract.address);
      // console.log(this.walletContract.address);

      // throw error if contract is undefined
      assert.ok(walletContractDeployTest);
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

    it("Should add a user that does not yet exist", async () => {

      const salt = 123;

      const computedAddr = buildCreate2Address(
        this.factoryContract.address,
        numberToUint256(salt),
        bytecode
      );

      let user = {
        username: "hello",
        address: computedAddr
      }

      await this.versionContract.addUser(user.username, user.address);

      let userReturn = await this.versionContract.viewUser(user.username);

      assert.equal(
        userReturn[1].toLowerCase(),    // These damn random cases..
        computedAddr,
        "Added user is not expected value."
      );
    });

    it("Should fail if adding a new user that already exists.", async () => {

      const salt = 1234;

      const computedAddr = buildCreate2Address(
        this.factoryContract.address,
        numberToUint256(salt),
        bytecode
      );

      let user = {
        username: "hello",
        address: computedAddr
      }

      await shouldFail.reverting(this.versionContract.addUser(user.username, user.address));

    });

    it("Should return user data for if user exists.", async () => {

      let user = await this.versionContract.viewUser("hello");

      assert.ok(user);

    });

    it("Should fail if looking up a user that does not exist.", async () => {

      await shouldFail.reverting(this.versionContract.viewUser("I don't exist"));

    });

    it("Should fail if upgrading user that is already at current version.", async () => {

      await shouldFail.reverting(this.versionContract.upgradeUser("hello", accounts[5]));

    });

    it("Should fail if upgrading user that does not exist.", async () => {

      await shouldFail.reverting(this.versionContract.upgradeUser("I dont exist", accounts[5]));

    });

    it("Should allow an existing user to upgrade if the have a lower version", async () => {

      await this.versionContract.updateBytecode(bytecode);

      const salt = 12;

      const computedAddr = buildCreate2Address(
        this.factoryContract.address,
        numberToUint256(salt),
        bytecode
      );

      await this.versionContract.upgradeUser("hello", computedAddr);

      let userReturn = await this.versionContract.viewUser("hello");

      assert.equal(
        userReturn[6],    // These damn random cases..
        true,
        "User is not in upgrade mode."
      );
    });

    it("Should emit an event after a user is added", async () => {

      const salt = 100;

      const computedAddr = buildCreate2Address(
        this.factoryContract.address,
        numberToUint256(salt),
        bytecode
      );

      let user = {
        username: "world",
        address: computedAddr
      }

      // SAVE LOGS
      let { logs } = await this.versionContract.addUser(user.username, user.address);

      let versionNumber = await this.versionContract.currentVersion();

      // random cases in contract address
      logs[0].args.contractAddress = logs[0].args.contractAddress.toLowerCase();

      // EVENT
      await expectEvent.inLogs(logs, 'NewUser', { username: user.username, contractAddress: user.address, version: versionNumber.toString() });
    });
  })

  describe('Factory testing', () => {

    it('Should deploy wallet contract.', async () => {
      const salt = 12345;

      const computedAddr = buildCreate2Address(
        this.factoryContract.address,
        numberToUint256(salt),
        bytecode
      );

      let transaction = await this.factoryContract.deploy(bytecode, salt);

      // fails if there is no transaction
      assert.ok(transaction);
    })

    it('Should emit an event when deploying a wallet contract.', async () => {
      const salt = 123456;
      const saltString = "123456";  // Needed to compare in logs

      const computedAddr = buildCreate2Address(
        this.factoryContract.address,
        numberToUint256(salt),
        bytecode
      );

      // SAVE LOGS
      let { logs } = await this.factoryContract.deploy(bytecode, salt);

      // We need to take care of some discrepancies with uppercase
      //
      // Otherwise we get this error:
      //
      // AssertionError: expected '0xE775dDa670d7466Afcc0924ac33ea5954f939B33' to equal '0xe775dda670d7466afcc0924ac33ea5954f939b33'
      // + expected - actual
      //
      // -0xE775dDa670d7466Afcc0924ac33ea5954f939B33
      // +0xe775dda670d7466afcc0924ac33ea5954f939b33

      logs[0].args.addr = logs[0].args.addr.toLowerCase();

      // EVENT
      await expectEvent.inLogs(logs, 'Deployed', { addr: computedAddr, salt: saltString });

    })
  })

  describe('Wallet testing', () => {

    it("Should have owner address be same address who deployed contract.", async () => {
      const owner = accounts[0];

      assert.equal(
        (await this.walletContract.owner()),
        owner,
        "Initial owner is not expected address."
      );
    });

    it("Should let owner transfer ownership.", async () => {
      let walletOwnershipTest = await Wallet.new(accounts[0], {from: accounts[0]});
      await walletOwnershipTest.setOwner(accounts[1], { from: accounts[0] })

      assert.equal(
        await walletOwnershipTest.owner(),
        accounts[1],
        "Owner transfer does not match."
      )
    });

    it("Should fail if non-owner tries to transfer ownership.", async () => {
      let walletOwnershipTest = await Wallet.new(accounts[0], {from: accounts[0]});

      assert.equal(
        await walletOwnershipTest.owner(),
        accounts[0],
        "Original owner should not have changed."
      );

      await shouldFail.reverting(walletOwnershipTest.setOwner(accounts[1], { from: accounts[2] }));
    });

    it("Should fire event when transfering ownership", async () => {
      let walletOwnershipTest = await Wallet.new(accounts[0], {from: accounts[0]});

      // SAVE LOGS
      let { logs } = await walletOwnershipTest.setOwner(accounts[1], { from: accounts[0] });

      // EVENT
      await expectEvent.inLogs(logs, 'OwnershipChanged', { oldOwner: accounts[0], newOwner: accounts[1] });

    });

    it("Should have no balance initially.", async () => {

      assert.equal(
        (await this.walletContract.totalBalance()),
        0,
        "Balance is not zero."
      );
    });

    it("Should fail if user tries to withdraw without a balance.", async () => {

      await shouldFail.reverting(this.walletContract.withdraw({ from: accounts[0] }));

    });

    it("Should have some balance after being sent funds.", async () => {

      await this.walletContract.sendTransaction({from: accounts[5],value:420 })

      assert.equal(
        (await this.walletContract.totalBalance()),
        420,
        "Balance is not what value funds were sent."
      );
    });


    it("Should fail if non owner tries to withdraw balance.", async () => {

      await shouldFail.reverting(this.walletContract.withdraw({ from: accounts[2] }));

    });

    it("Should let owner withdraw balance.", async () => {

      await this.walletContract.withdraw({ from: accounts[0] });

      assert.equal(
        (await this.walletContract.totalBalance()),
        0,
        "Balance should be zero after withdraw."
      );
    });


    it("Should emit an event after owner withdraws.", async () => {

      await this.walletContract.sendTransaction({from: accounts[5],value:420 })

      // SAVE LOGS
      let { logs } = await this.walletContract.withdraw({ from: accounts[0] });

      // EVENT
      await expectEvent.inLogs(logs, 'Withdraw', { from: this.walletContract.address, to: accounts[0], amount: "420" });

    });
  })
})
