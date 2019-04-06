# CREATE2-wallets-with-upgrade
Using CREATE2 opcode to deploy counterfactual wallets.

## Use case

1 step user onboarding for wallets. User does not need to hold an account (private/public keypair) to get their wallet.

### Upgrade Strategy

A datastore to store the users. User data includes which version they are on so as to use the correct bytecode to deploy their contract and information on upgrades.

# Setup

First clone the repo.

Then run `npm i` to install the dependencies.

## Tests

Before running tests you need to have ganache running

Launch Ganache-cli on a new terminal window...

```sh
$ ganache-cli -m "birth..."
```
You also need to have your credentials (private key mnemonic) in credentials/credentials.js

Now we're ready to run the tests:

```bash
truffle test
```

## Static Analysis
Static analysis using Smartdec: 
https://tool.smartdec.net/scan/86cc7f0813e542aa9f6757f665d48bfd


## Deployed Contracts
On the Kovan testnet
Version Control contract: 0x7dc03b8775baf5a0cab6fca4c2a8e0f5c5a37810
Factory contract: 0xd43f8f862372651e102e5bc35171084604a69318
Wallet contract: 0xf3f63ff1b6eb9403940908811551279054563d9c

## Licence

MIT

**Free Software, Hell Yeah!**

# Resources
https://eips.ethereum.org/EIPS/eip-1014

https://github.com/miguelmota/solidity-create2-example

https://medium.com/gitcoin/counterfactual-loan-repayment-828a59d9b730

https://hackernoon.com/create2-a-tale-of-two-optcodes-1e9b813418f8

https://hackernoon.com/the-create2-opcode-and-dapp-onboarding-in-ethereum-e2178e6c20cb

https://blog.goodaudience.com/one-weird-trick-to-fix-user-on-boarding-d54b7ff9d711

