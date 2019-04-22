pragma solidity 0.5.7;

import "./SafeMath.sol";

// Factory interface
contract FactoryInterface {
  function deploy(bytes memory code, bytes32 salt) public returns(address);
}

// Wallet interface
contract WalletInterface {
  function setOwner(address payable _owner) public;
}

// Datastore contract
contract VersionControl {

  using SafeMath for uint256;

  event DeployedWallet(string username, address contractAddress, uint256 version);
  event UpgradedWallet(string username, address oldContractAddress, uint256 oldVersion, address newContractAddress, uint256 newVersion);
  event NewUser(string username, address contractAddress, uint256 version);
  event OwnershipChanged(address indexed oldOwner, address indexed newOwner);

  FactoryInterface public factory;       // Factory contract address
  WalletInterface public wallet;         // Wallet contract address
  uint256 public currentVersion = 0;     // Keep track of the current version
  address public owner;
  uint256 public deployThreshold = 0;

  // struct to hold user data
  struct User {
    uint256 bytecodeVersion;
    address walletAddress;
    bool deployed;
    bool exists;
    address upgradeAddress;
    uint256 upgradeVersion;
    bool upgrading;
  }

  // mapping of usernames
  mapping(bytes32 => User) public users;

  // mapping of bytecodes to keep track of versions
  mapping(uint256 => bytes) public bytecodeMap;

  constructor(address _address, bytes memory _bytecode) public {
    owner = msg.sender;
    factory = FactoryInterface(_address);
    currentVersion = 0;
    bytecodeMap[currentVersion] = _bytecode;
  }

  // owner modifier
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // Transfering ownership
  function setOwner(address _owner) public {
    require(msg.sender == owner);
    emit OwnershipChanged(owner, _owner);
    owner = _owner;
  }

  // owner can upgrade wallet contract
  function updateBytecode(bytes memory _bytecode) public onlyOwner {
    currentVersion = currentVersion.add(1);
    bytecodeMap[currentVersion] = _bytecode;
  }

  // deploying a wallet contract. user will supply salt. owner is optional
  function deployWallet(string memory _username, bytes32 _salt) public onlyOwner {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    require(user.walletAddress.balance > deployThreshold, "Wallet does not have enough funds to deploy.");

    address walletAddress = factory.deploy(bytecodeMap[user.bytecodeVersion], _salt);

    // Check wallet address for security
    require(walletAddress == user.walletAddress, "Wallet address does not match.");

    emit DeployedWallet(_username, walletAddress, user.bytecodeVersion);

    user.deployed = true;

  }

  // deploying an upgraded wallet contract. user will supply _salt. owner is optional
  function upgradeWallet(string memory _username, bytes32 _salt) public onlyOwner {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    require(user.upgrading, "User is not in upgrade stage.");

    require(user.upgradeAddress.balance > deployThreshold, "Wallet does not have enough funds to deploy.");

    address walletAddress = factory.deploy(bytecodeMap[user.bytecodeVersion], _salt);

    // Check wallet address for security
    require(walletAddress == user.upgradeAddress, "Wallet address does not match.");

    emit UpgradedWallet(_username, user.walletAddress, user.bytecodeVersion, user.upgradeAddress, user.upgradeVersion);

    user.bytecodeVersion = user.upgradeVersion;
    user.walletAddress = walletAddress;
    user.upgrading = false;

  }

  // adding a user to our database/mapping
  function addUser(string memory _username, address _address) public onlyOwner {

    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(!users[usernameKey].exists, "Username already exists.");

    User memory newUser = User({
        bytecodeVersion: currentVersion,
        walletAddress: _address,
        deployed: false,
        exists: true,
        upgradeAddress: address(0x0),
        upgradeVersion: currentVersion,
        upgrading: false
      });

    users[usernameKey] = newUser;

    emit NewUser(_username, _address, currentVersion);
  }

  // puts the user in upgrade mode if there is a new wallet version
  // and user wants to upgrade.
  // during upgrade stage we keep track of previous wallet and new wallet
  function upgradeUser(string memory _username, address _address) public onlyOwner {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    require(user.bytecodeVersion < currentVersion, "Version is up to do date.");

    user.upgradeVersion = currentVersion;
    user.upgradeAddress = _address;
    user.upgrading = true;
  }

  // public function to view a user's data
  function viewUser(string memory _username) public view returns
  (uint256, address, bool, bool, address, uint256, bool) {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    return(user.bytecodeVersion,
        user.walletAddress,
        user.deployed,
        user.exists,
        user.upgradeAddress,
        user.upgradeVersion,
        user.upgrading
    );
  }

  // public function to view a user's wallet balance
  function viewBalance(string memory _username) public view returns (uint256) {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    return(user.walletAddress.balance);
  }

  // function for user to set themselves as owner
  function userOwnership(string memory _username, address payable _owner) public onlyOwner {
    bytes memory usernameBytes = bytes(_username);
    bytes32 usernameKey = keccak256(usernameBytes);

    require(users[usernameKey].exists, "User does not exist.");

    User storage user = users[usernameKey];

    wallet = WalletInterface(user.walletAddress);

    wallet.setOwner(_owner);
  }

  // Concatenate two bytes arrays. https://ethereum.stackexchange.com/a/40456
  function MergeBytes(bytes memory a, bytes memory b) public pure returns (bytes memory c) {
    // Store the length of the first array
    uint alen = a.length;
    // Store the length of BOTH arrays
    uint totallen = alen + b.length;
    // Count the loops required for array a (sets of 32 bytes)
    uint loopsa = (a.length + 31) / 32;
    // Count the loops required for array b (sets of 32 bytes)
    uint loopsb = (b.length + 31) / 32;
    assembly {
      let m := mload(0x40)
      // Load the length of both arrays to the head of the new bytes array
      mstore(m, totallen)
      // Add the contents of a to the array
      for {  let i := 0 } lt(i, loopsa) { i := add(1, i) } { mstore(add(m, mul(32, add(1, i))), mload(add(a, mul(32, add(1, i))))) }
      // Add the contents of b to the array
      for {  let i := 0 } lt(i, loopsb) { i := add(1, i) } { mstore(add(m, add(mul(32, add(1, i)), alen)), mload(add(b, mul(32, add(1, i))))) }
      mstore(0x40, add(m, add(32, totallen)))
      c := m
    }
  }
}
