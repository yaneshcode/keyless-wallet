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


## Licence
----

MIT


**Free Software, Hell Yeah!**
